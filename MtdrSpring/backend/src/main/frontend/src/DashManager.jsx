import React, { useState, useEffect, useCallback } from "react";
import SidebarManager from "./components/SidebarManager";
import Dropdown from "./components/DropDown";
import AcceptTaskModal from "./components/AcceptTaskModal";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./components/SortableItem";
import { Bell, UserCircle, Menu, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ManagerAcceptTaskModal from "./components/ManagerAcceptTaskModal";



const tagColors = {
  High: "bg-red-600",
  Medium: "bg-yellow-500",
  Low: "bg-green-600",
};

const columnMap = {
  pending: 1,
  doing: 2,
  done: 3,
};

const columnNames = {
  1: "pending",
  2: "doing",
  3: "done",
};

const EmptyDropArea = ({ columnId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId
  });
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex items-center justify-center h-32 bg-[#1a1a1a] rounded-lg border border-dashed ${isOver ? 'border-red-500 bg-[#252525]' : 'border-gray-600'}`}
    >
      <p className="text-gray-500">Drop tasks here</p>
    </div>
  );
};

const TaskList = ({ columnId, tasks, onTaskClick, sprints }) => {
  if (tasks.length === 0) {
    return <EmptyDropArea columnId={columnId} />;
  }

  return (
    <SortableContext
      items={tasks.filter(Boolean).map(t => t.id)}
      strategy={verticalListSortingStrategy}
    >
      {tasks.filter(Boolean).map((task) => {
        const sprint = task.idSprint ? sprints.find(s => s.id === task.idSprint) : null;
        const isLocked = sprint?.completado === true;

        return (
          <SortableItem key={task.id} id={task.id} disabled={isLocked}>
            <div
              className={`bg-[#1a1a1a] rounded-lg p-4 shadow-md border border-neutral-700 transition-colors ${isLocked ? 'opacity-70' : 'cursor-pointer hover:border-red-500'}`}
              onClick={() => !isLocked && onTaskClick(task)}
            >
              <span className={`text-xs px-2 py-1 rounded-full text-white ${tagColors[task.type]}`}>
                {task.type}
              </span>
              <h3 className="font-semibold text-white mt-2">{task.title}</h3>
              <p className="text-sm text-gray-400">{task.description}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {new Date(task.fechaVencimiento).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  {task.idColumna === 3 && task.tiempoReal > 0 && (
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">
                      {task.tiempoReal} hrs
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-xs text-gray-400" title="Sprint completado">
                      <Lock className="text-white" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SortableItem>
        );
      })}
    </SortableContext>
  );
};


const DroppableColumn = ({ id, title, tasksCount, children, isOver }) => {
  return (
    <section
      className={`bg-[#2a2a2a] text-white rounded-lg p-4 flex flex-col ${isOver ? "ring-2 ring-red-500 bg-[#3a3a3a]" : ""}`}
      data-column-id={id}
    >
      <h2 className="text-lg font-semibold mb-2 capitalize">
        {title} ({tasksCount})
      </h2>
      <div className="flex-grow min-h-[100px] space-y-3">
        {children}
      </div>
    </section>
  );
};

const DashManager = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({ pending: [], doing: [], done: [] });
  const [allTasks, setAllTasks] = useState({ pending: [], doing: [], done: [] });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [overColumnId, setOverColumnId] = useState(null);
  const [originalTaskLocations, setOriginalTaskLocations] = useState({});
  const [sprints, setSprints] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [integrantes, setIntegrantes] = useState([]);
  const [selectedSprints, setSelectedSprints] = useState(new Set());
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [selectedIntegrante, setSelectedIntegrante] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskModalNotAccepted, setShowTaskModalNotAccepted] = useState(false);
  const [debugSprintInfo, setDebugSprintInfo] = useState(null);
  const [notAcceptedTasks, setNotAcceptedTasks] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchNotAcceptedTasks = useCallback(async (proyectoId = selectedProyecto) => {
    if (!proyectoId) return;

    try {
      const res = await fetch(`/pruebas/TareasNoAceptadasProyecto/${proyectoId}`);
      if (!res.ok) throw new Error("Error loading not accepted tasks");

      const data = await res.json();

      const tasks = data.map(task => ({
        id: `notaccepted-${task.idTarea}`,
        rawId: task.idTarea,
        idEncargado: task.idEncargado,
        idProyecto: task.idProyecto,
        idColumna: task.idColumna,
        idSprint: task.idSprint,
        title: task.nombre,
        description: task.descripcion,
        fechaInicio: task.fechaInicio,
        fechaVencimiento: task.fechaVencimiento,
        prioridad: task.prioridad,
        type: task.prioridad === 1 ? "Low" : task.prioridad === 2 ? "Medium" : "High",
      }));

      setNotAcceptedTasks(tasks);
    } catch (err) {
      console.error("Failed to fetch not accepted tasks", err);
    }
  }, [selectedProyecto]);

  const fetchProyectos = useCallback(async () => {
    const userId = JSON.parse(localStorage.getItem("userId"));
    if (!userId) return;
    try {
      const res = await fetch(`/pruebasProy/ProyectosForManager/${userId}`);
      const data = await res.json();
      
      const validProys = data.filter(proy => 
        proy && proy.id !== undefined && proy.id !== null
      );
      
      console.log("Fetched proyectos:", validProys);
      setProyectos(validProys);
      if (validProys.length > 0) {
        setSelectedProyecto(validProys[0].id);
      }
      
      return validProys[0]?.id;
    } catch (err) {
      console.error("Failed to fetch proyectos", err);
    }
  }, []);

  const fetchIntegrantes = useCallback(async (proyectoId = selectedProyecto) => {
    if (!proyectoId) return;
    try {
      const res = await fetch(`/pruebasProy/UsuariosProyecto/${proyectoId}`);
      const data = await res.json();
      
      const validUsers = data.filter(user => 
        user && user.id !== undefined && user.id !== null
      );
      
      console.log("Fetched users:", validUsers);
      setIntegrantes(validUsers);
      setSelectedIntegrante(null);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, [selectedProyecto]);

  const fetchTasks = useCallback(async (proyectoId = selectedProyecto) => {
    console.log("Tasks proyecto id", proyectoId);
    if (!proyectoId) return;

    try {
      const res = await fetch(`/pruebas/TareasProyecto/${proyectoId}`);
      if (!res.ok) throw new Error("Error al cargar tareas");

      const data = await res.json();
      const newTasks = { pending: [], doing: [], done: [] };
      const newOriginalLocations = {};

      data.forEach((task) => {
        const taskObj = {
          id: `task-${task.idTarea}`,
          rawId: task.idTarea,
          idEncargado: task.idEncargado,
          idProyecto: task.idProyecto,
          idColumna: task.idColumna,
          idSprint: task.idSprint,
          title: task.nombre,
          description: task.descripcion,
          fechaInicio: task.fechaInicio,
          fechaVencimiento: task.fechaVencimiento,
          fechaCompletado: task.fechaCompletado,
          storyPoints: task.storyPoints,
          tiempoReal: task.tiempoReal || 0,
          tiempoEstimado: task.tiempoEstimado,
          prioridad: task.prioridad,
          aceptada: task.aceptada || 1,
          type: task.prioridad === 1 ? "Low" : task.prioridad === 2 ? "Medium" : "High",
        };
        const column = columnNames[task.idColumna];
        if (column) {
          newTasks[column].push(taskObj);
          newOriginalLocations[taskObj.id] = column;
        }
      });

      setTasks(newTasks);
      setAllTasks(newTasks);
      setOriginalTaskLocations(newOriginalLocations);
    } catch (err) {
      console.error(err);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, selectedProyecto]); 

  const fetchSprints = useCallback(async (proyectoId = selectedProyecto) => {
    if (!proyectoId) return;

    try {
      const res = await fetch(`/pruebasSprint/SprintsForProject/${proyectoId}`);
      const data = await res.json();
      
      const validSprints = data.filter(sprint => 
        sprint && sprint.id !== undefined && sprint.id !== null
      );
      
      console.log("Fetched sprints:", validSprints);
      setSprints(validSprints);
      
      const initialSelectedSprints = new Set(
        validSprints
          .map(sprint => Number(sprint.id))
          .filter(id => !isNaN(id))
      );
      
      setSelectedSprints(initialSelectedSprints);
      console.log("Initial selected sprint IDs:", Array.from(initialSelectedSprints));
    } catch (err) {
      console.error("Failed to fetch sprints", err);
    }
  }, [selectedProyecto]);

  useEffect(() => {
    const init = async () => {
      const proyectoId = await fetchProyectos();
    };
    init();
  }, [fetchProyectos]);

  useEffect(() => {
    if (selectedProyecto) {
      fetchTasks(selectedProyecto);
      fetchSprints(selectedProyecto);
      fetchIntegrantes(selectedProyecto);
      fetchNotAcceptedTasks(selectedProyecto);
    }
  }, [selectedProyecto, fetchTasks, fetchSprints, fetchIntegrantes, fetchNotAcceptedTasks]);

  useEffect(() => {
    console.log("Selected sprints:", Array.from(selectedSprints));
    console.log("Selected integrante:", selectedIntegrante);
    console.log("All tasks:", allTasks);

    if (selectedSprints.size === 0) {
      setTasks({
        pending: [],
        doing: [],
        done: [],
      });
      return;
    }

    const filtered = Object.fromEntries(
      Object.entries(allTasks).map(([columnKey, columnTasks]) => [
        columnKey,
        columnTasks.filter((task) => {
          const sprintId = Number(task.idSprint);
          const encargadoId = task.idEncargado;

          if (isNaN(sprintId) || !selectedSprints.has(sprintId)) {
            return false;
          }

          if (!selectedIntegrante || selectedIntegrante === "null") {
            return true;
          }

          return String(encargadoId) === String(selectedIntegrante);
        }),
      ])
    );

    setTasks(filtered);
    setDebugSprintInfo({
      selectedSprints: Array.from(selectedSprints),
      filteredTaskCount: Object.values(filtered).flat().length,
      allTasksCount: Object.values(allTasks).flat().length,
    });
  }, [selectedSprints, allTasks, selectedIntegrante]);

  useEffect(() => {
    const container = document.getElementById("scrollContainer");
    const leftArrow = document.getElementById("scrollLeft");
    const rightArrow = document.getElementById("scrollRight");

    if (!container || !leftArrow || !rightArrow) return;

    const updateArrows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      leftArrow.style.display = scrollLeft > 0 ? "block" : "none";
      rightArrow.style.display = scrollLeft + clientWidth < scrollWidth ? "block" : "none";
    };

    container.addEventListener("scroll", updateArrows);
    updateArrows();

    return () => container.removeEventListener("scroll", updateArrows);
  }, [notAcceptedTasks]);

  const handleSprintToggle = (sprintId, isChecked) => {
    const numericSprintId = Number(sprintId);
    if (isNaN(numericSprintId)) {
      console.error("Invalid sprint ID received:", sprintId);
      return;
    }
    
    console.log(`Toggle sprint ${numericSprintId} to ${isChecked}`);
    
    setSelectedSprints(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(numericSprintId);
      } else {
        newSet.delete(numericSprintId);
      }
      console.log("New selected sprints:", Array.from(newSet));
      return newSet;
    });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskClickNotAccepted = (task) => {
    setSelectedTask(task);
    setShowTaskModalNotAccepted(true);
  };

  const updateTaskState = (state, updatedTask) => {
    const newState = { ...state };
    Object.keys(newState).forEach(col => {
      newState[col] = newState[col].map(t => 
        t.id === updatedTask.id ? updatedTask : t
      );
    });
    return newState;
  };

  const handleSaveTask = async (updatedTask) => {
    try {
      // Validate sprint
      const taskSprint = sprints.find(s => Number(s.id) === Number(updatedTask.idSprint));
      if (taskSprint) {
        const dueDate = new Date(updatedTask.fechaVencimiento);
        const startDate = new Date(taskSprint.fechaInicio);
        const endDate = new Date(taskSprint.fechaFin);
        
        if (dueDate < startDate || dueDate > endDate) {
          throw new Error(`La fecha debe estar entre ${startDate.toLocaleDateString()} y ${endDate.toLocaleDateString()}`);
        }
      }

      // Validate estimated hours
      const horasEstimadas = parseInt(updatedTask.tiempoEstimado);
      if (isNaN(horasEstimadas) || horasEstimadas < 0) {
        throw new Error("Estimated Time must be positive integer");
      }

      // Ensure numeric fields
      const prioridad = Number(updatedTask.prioridad) || 1;
      const tiempoReal = updatedTask.idColumna === 3 ? 
        (Number(updatedTask.tiempoReal) || null) : 
        (updatedTask.tiempoReal || null);
      
      if(updatedTask.aceptada === false){
        const storyP = parseInt(updatedTask.storyPoints);
        if(isNaN(storyP) || storyP < 0) {
          throw new Error("Story points must be positive integer");
        }
        updatedTask.aceptada = true;
      }

      const payload = {
        idTarea: updatedTask.rawId,
        idEncargado: updatedTask.idEncargado,
        idProyecto: updatedTask.idProyecto,
        idColumna: updatedTask.idColumna,
        idSprint: updatedTask.idSprint,
        nombre: updatedTask.title,
        descripcion: updatedTask.description,
        prioridad: prioridad,
        fechaInicio: updatedTask.fechaInicio,
        fechaVencimiento: updatedTask.fechaVencimiento,
        ...(updatedTask.fechaCompletado && { 
          fechaCompletado: updatedTask.fechaCompletado 
        }),
        storyPoints: updatedTask.storyPoints,
        tiempoReal: tiempoReal,
        tiempoEstimado: horasEstimadas,
        aceptada: updatedTask.aceptada !== undefined ? updatedTask.aceptada : 1,
      };

      console.log("Enviando datos al servidor:", payload);

      const response = await fetch(`/pruebas/updateTarea/${updatedTask.rawId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const responseData = await response.json();
      
      const updatedTaskData = {
        ...updatedTask,
        prioridad: responseData.prioridad || prioridad,
        tiempoReal: responseData.tiempoReal || tiempoReal,
        tiempoEstimado: responseData.tiempoEstimado || horasEstimadas,
        fechaVencimiento: responseData.fechaVencimiento || updatedTask.fechaVencimiento,
        fechaInicio: responseData.fechaInicio || updatedTask.fechaInicio,
        idEncargado: responseData.idEncargado || updatedTask.idEncargado,
        idSprint: responseData.idSprint || updatedTask.idSprint,
        title: responseData.nombre || updatedTask.title,
        description: responseData.descripcion || updatedTask.description
      };

      setTasks(prev => updateTaskState(prev, updatedTaskData));
      setAllTasks(prev => updateTaskState(prev, updatedTaskData));

      return responseData;
    } catch (error) {
      console.error("Error al guardar:", error);
      throw error;
    }
  };

  const handleDeleteTask = async (deletedTask) => {
    try {
      const response = await fetch(`/pruebas/deleteTarea/${deletedTask.rawId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ''}`,
        },
      });

      const deletedFlag = await response.json();

      if (deletedFlag === true) {
        // Refetch task lists
        fetchTasks();
        fetchNotAcceptedTasks();
      } else {
        console.warn("Deletion did not return true. Response:", deletedFlag);
      }
    } catch (error) {
      console.error("Error al borrar:", error);
      throw error;
    }
  };

  const progress =
    tasks.done.length + tasks.pending.length + tasks.doing.length > 0
      ? Math.round((tasks.done.length / (tasks.done.length + tasks.pending.length + tasks.doing.length)) * 100)
      : 0;

  if (isLoading) return <div className="text-white text-center mt-10">Cargando tareas...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#1a1a1a]">
      <button className="md:hidden fixed top-4 left-4 z-50 text-white" onClick={() => setIsMobileOpen(true)}>
        <Menu size={28} />
      </button>
      <SidebarManager isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />

      <div className="flex-1 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <header className="flex flex-wrap items-center justify-between py-4 gap-4">
          <h1 className="text-white text-2xl font-semibold">Dashboard</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="bg-[#2a2a2a] text-white rounded px-4 py-2 text-sm"
              value={selectedProyecto || ''}
              onChange={(e) => setSelectedProyecto(e.target.value)}
            >
              <option value="">Select a Project</option>
              {proyectos.map((proy) => (
                <option key={proy.id} value={proy.id}>
                  {proy.nombre} 
                </option>
              ))}
            </select>
            <select
              className="bg-[#2a2a2a] text-white rounded px-4 py-2 text-sm"
              value={selectedIntegrante || ''}
              onChange={(e) => setSelectedIntegrante(e.target.value)}
            >
              <option value="">All Users</option>
              {integrantes.map((integrante) => (
                <option key={integrante.id} value={integrante.id}>
                  {integrante.nombre} 
                </option>
              ))}
            </select>
            <Dropdown
              label="Sprints"
              options={sprints.map((sprint) => ({ 
                id: Number(sprint.id),
                name: sprint.nombre || `Sprint ${sprint.id}`
              }))}
              onSelect={handleSprintToggle}
              initialChecked={true}
            />
            
            {debugSprintInfo && (
              <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs z-50">
                <div>Selected: {debugSprintInfo.selectedSprints.join(', ')}</div>
                <div>Filtered/Total: {debugSprintInfo.filteredTaskCount}/{debugSprintInfo.allTasksCount}</div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Bell className="text-white cursor-pointer hover:text-red-500" />
              <UserCircle className="text-white w-8 h-8 cursor-pointer hover:text-red-500" />
            </div>
          </div>
        </header>

        <section className="bg-[#2a2a2a] text-white rounded-lg p-4 mb-6 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Not Accepted Tasks</h2>

          <div className="relative pb-6"> {/* Extra space for pagination */}
            <Swiper
              modules={[Pagination]}
              pagination={{
                clickable: true,
                el: ".custom-swiper-pagination",
              }}
              spaceBetween={20}
              slidesPerView="auto"
              className="!overflow-hidden"
              style={{ height: '150px' }}
            >
              {notAcceptedTasks.map((task) => (
                <SwiperSlide
                  key={task.id}
                  className="!w-auto !flex-shrink-0"
                >
                  <div
                    className="w-[260px] h-[150px] bg-[#1a1a1a] rounded-lg p-4 shadow-md border border-neutral-700 cursor-pointer hover:border-red-500 transition-colors flex flex-col justify-between overflow-hidden"
                    onClick={() => handleTaskClickNotAccepted(task)}
                  >
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${tagColors[task.type]}`}>
                        {task.type}
                      </span>
                      <h3 className="font-semibold text-white mt-2 break-words">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-400 break-words overflow-hidden text-ellipsis whitespace-nowrap">
                        {task.description}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(task.fechaVencimiento).toLocaleDateString()}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom pagination container BELOW swiper */}
            <div className="custom-swiper-pagination flex justify-center mt-2" />
          </div>
        </section>


        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          measuring={{ droppable: { strategy: 'always' } }}
        >
          <main className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.entries(tasks).map(([columnId, columnTasks]) => (
              <DroppableColumn
                key={columnId}
                id={columnId}
                title={columnId}
                tasksCount={columnTasks.length}
                isOver={overColumnId === columnId}
              >
                <TaskList
                  columnId={columnId}
                  tasks={columnTasks}
                  onTaskClick={handleTaskClick}
                  sprints={sprints}
                />
              </DroppableColumn>
            ))}

            <section className="bg-[#2a2a2a] text-white rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Progress</h2>
              <div className="w-full flex items-center justify-center mb-4 relative">
                <ResponsiveContainer width="100%" height={120}>
                  <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={10} data={[{ value: progress, fill: "#ff1f1f" }]}>
                    <RadialBar minAngle={15} background clockWise dataKey="value" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <span className="absolute text-xl font-bold text-white">{progress}%</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Tasks Left</h3>
                <ul className="space-y-2">
                  <li className="bg-[#1a1a1a] px-4 py-2 rounded">Today</li>
                  <li className="bg-[#1a1a1a] px-4 py-2 rounded">Tomorrow</li>
                  <li className="bg-[#1a1a1a] px-4 py-2 rounded">Wednesday</li>
                </ul>
              </div>
            </section>
          </main>

          <DragOverlay>
            {activeId && activeTask && (
              <div className="bg-[#1a1a1a] rounded-lg p-4 shadow-md border border-neutral-700 opacity-80">
                <span className={`text-xs px-2 py-1 rounded-full text-white ${tagColors[activeTask.type]}`}>
                  {activeTask.type}
                </span>
                <h3 className="font-semibold text-white mt-2">{activeTask.title}</h3>
                <p className="text-sm text-gray-400">{activeTask.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(activeTask.fechaVencimiento).toLocaleDateString()}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {showTaskModal && (
          <AcceptTaskModal
            task={selectedTask}
            sprints={sprints}
            integrantes={integrantes}
            onClose={() => setShowTaskModal(false)}
            onDelete={handleDeleteTask}
            onSave={handleSaveTask}
          />
        )}

        {showTaskModalNotAccepted && (
          <ManagerAcceptTaskModal
            task={selectedTask}
            sprints={sprints}
            integrantes={integrantes}
            onClose={() => setShowTaskModalNotAccepted(false)}
            onDelete={handleDeleteTask}
            onSave={handleSaveTask}
          />
        )}
      </div>
    </div>
  );
};

export default DashManager;
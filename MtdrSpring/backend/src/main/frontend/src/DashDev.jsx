import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Dropdown from "./components/DropDown";
import TaskDetailsModal from "./components/TaskDetailsModal";
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
import { Bell, UserCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex items-center justify-center h-32 bg-[#1a1a1a] rounded-lg border border-dashed ${
        isOver ? 'border-red-500 bg-[#252525]' : 'border-gray-600'
      }`}
    >
      <p className="text-gray-500">Drop tasks here</p>
    </div>
  );
};

const TaskList = ({ columnId, tasks, onTaskClick }) => {
  if (tasks.length === 0) {
    return <EmptyDropArea columnId={columnId} />;
  }

  return (
    <SortableContext 
      items={tasks.map(t => t.id)}
      strategy={verticalListSortingStrategy}
    >
      {tasks.map((task) => (
        <SortableItem key={task.id} id={task.id}>
          <div 
            className="bg-[#1a1a1a] rounded-lg p-4 shadow-md border border-neutral-700 cursor-pointer hover:border-red-500 transition-colors"
            onClick={() => onTaskClick(task)}
          >
            <span className={`text-xs px-2 py-1 rounded-full text-white ${tagColors[task.type]}`}>
              {task.type}
            </span>
            <h3 className="font-semibold text-white mt-2">{task.title}</h3>
            <p className="text-sm text-gray-400">{task.description}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(task.fechaVencimiento).toLocaleDateString()}
            </p>
          </div>
        </SortableItem>
      ))}
    </SortableContext>
  );
};

const DroppableColumn = ({ id, title, tasksCount, children, isOver }) => {
  return (
    <section
      className={`bg-[#2a2a2a] text-white rounded-lg p-4 flex flex-col ${
        isOver ? "ring-2 ring-red-500 bg-[#3a3a3a]" : ""
      }`}
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

const DashDev = () => {
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
  const [selectedSprints, setSelectedSprints] = useState(new Set());
  const [debugSprintInfo, setDebugSprintInfo] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTasks = useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.id;
    if (!userId) return navigate("/login");

    try {
      const res = await fetch(`/pruebas/TareasUsuario/${userId}`);
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
          tiempoReal: task.tiempoReal,
          tiempoEstimado: task.tiempoEstimado,
          prioridad: task.prioridad,
          aceptada: 1,
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
  }, [navigate]);

  const fetchSprints = useCallback(async () => {
    const userId = JSON.parse(localStorage.getItem("userId"));
    if (!userId) return;
    try {
      const res = await fetch(`/pruebasSprint/SprintsForUser/${userId}`);
      const data = await res.json();

      const validSprints = data.filter(sprint => 
        sprint && sprint.id !== undefined && sprint.id !== null
      );
      
      setSprints(validSprints);
      
      const initialSelectedSprints = new Set(
        validSprints
          .map(sprint => Number(sprint.id))
          .filter(id => !isNaN(id))
      );
      
      setSelectedSprints(initialSelectedSprints);
    } catch (err) {
      console.error("Failed to fetch sprints", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchSprints();
  }, [fetchTasks, fetchSprints]);

  useEffect(() => {
    if (selectedSprints.size === 0) {
      setTasks({ pending: [], doing: [], done: [] });
      return;
    }
    
    const filtered = Object.fromEntries(
      Object.entries(allTasks).map(([key, value]) => [
        key,
        value.filter((task) => {
          if (!task.idSprint) return false;
          const taskSprintId = Number(task.idSprint);
          if (isNaN(taskSprintId)) return false;
          return selectedSprints.has(taskSprintId);
        })
      ])
    );
    
    setTasks(filtered);
  }, [selectedSprints, allTasks]);

  const handleSprintToggle = (sprintId, isChecked) => {
    const numericSprintId = Number(sprintId);
    if (isNaN(numericSprintId)) return;
    
    setSelectedSprints(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(numericSprintId);
      } else {
        newSet.delete(numericSprintId);
      }
      return newSet;
    });
  };

  const findColumn = (itemId) => {
    if (["pending", "doing", "done"].includes(itemId)) return itemId;
    
    for (const colId of ["pending", "doing", "done"]) {
      if (tasks[colId].some(task => task.id === itemId)) {
        return colId;
      }
    }
    return null;
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
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
      // Validación del sprint
      const taskSprint = sprints.find(s => Number(s.id) === Number(updatedTask.idSprint));
      if (taskSprint) {
        const dueDate = new Date(updatedTask.fechaVencimiento);
        const startDate = new Date(taskSprint.fechaInicio);
        const endDate = new Date(taskSprint.fechaFin);
        
        if (dueDate < startDate || dueDate > endDate) {
          throw new Error(`La fecha debe estar entre ${startDate.toLocaleDateString()} y ${endDate.toLocaleDateString()}`);
        }
      }

      // Asegurar que la prioridad sea número
      const prioridad = Number(updatedTask.prioridad) || 1;

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
        tiempoReal: updatedTask.tiempoReal,
        tiempoEstimado: updatedTask.tiempoEstimado,
        aceptada: updatedTask.aceptada,
      };

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
      
      // Actualizar estado local
      const updatedTaskData = {
        ...updatedTask,
        prioridad: responseData.prioridad || prioridad,
        fechaVencimiento: responseData.fechaVencimiento || updatedTask.fechaVencimiento,
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

  const handleDragStart = ({ active }) => {
    const column = findColumn(active.id);
    if (!column) return;
    
    const task = tasks[column].find((t) => t.id === active.id);
    setActiveId(active.id);
    setActiveTask(task || null);
    
    setOriginalTaskLocations(prev => ({
      ...prev,
      [active.id]: column
    }));
  };

  const handleDragOver = ({ active, over }) => {
    if (!active || !over) {
      setOverColumnId(null);
      return;
    }
    
    const overColumn = ["pending", "doing", "done"].includes(over.id) 
      ? over.id 
      : findColumn(over.id);
    
    setOverColumnId(overColumn);
    
    const activeColumn = findColumn(active.id);
    
    if (!activeColumn || !overColumn || activeColumn === overColumn) return;
    
    setTasks(prevTasks => {
      const activeItems = [...prevTasks[activeColumn]];
      const overItems = [...prevTasks[overColumn]];
      
      const activeIndex = activeItems.findIndex(item => item.id === active.id);
      if (activeIndex === -1) return prevTasks;
      
      const taskToMove = { ...activeItems[activeIndex] };
      
      return {
        ...prevTasks,
        [activeColumn]: activeItems.filter(item => item.id !== active.id),
        [overColumn]: [...overItems, taskToMove]
      };
    });
  };

  const handleDragEnd = async ({ active, over }) => {
    setOverColumnId(null);

    if (!active || !over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    const sourceColumn = originalTaskLocations[active.id];
    let targetColumn = null;

    if (["pending", "doing", "done"].includes(over.id)) {
      targetColumn = over.id;
    } else {
      for (const col of ["pending", "doing", "done"]) {
        if (tasks[col].some(task => task.id === over.id)) {
          targetColumn = col;
          break;
        }
      }
    }

    if (!sourceColumn || !targetColumn) {
      console.error("Source or target column not found");
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    const originalTask = tasks[sourceColumn]?.find(task => task.id === active.id) || activeTask;
    if (!originalTask) {
      console.error("Original task not found:", active.id);
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    if (sourceColumn === targetColumn) {
      if (over.id !== targetColumn) {
        const activeIndex = tasks[sourceColumn].findIndex(task => task.id === active.id);
        const overIndex = tasks[targetColumn].findIndex(task => task.id === over.id);
        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          setTasks(prev => ({
            ...prev,
            [sourceColumn]: arrayMove(prev[sourceColumn], activeIndex, overIndex),
          }));
        }
      }
    } else {
      const targetColumnId = columnMap[targetColumn];

      setTasks(prev => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(task => task.id !== active.id),
        [targetColumn]: [...prev[targetColumn], { ...originalTask, idColumna: targetColumnId }]
      }));
      
      setAllTasks(prev => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(task => task.id !== active.id),
        [targetColumn]: [...prev[targetColumn], { ...originalTask, idColumna: targetColumnId }]
      }));

      setOriginalTaskLocations(prev => ({
        ...prev,
        [active.id]: targetColumn,
      }));

      try {
        const response = await fetch(`/pruebas/updateTarea/${originalTask.rawId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
          },
          body: JSON.stringify({
            idTarea: originalTask.rawId,
            idEncargado: originalTask.idEncargado,
            idProyecto: originalTask.idProyecto,
            idColumna: targetColumnId,
            idSprint: originalTask.idSprint,
            nombre: originalTask.title,
            descripcion: originalTask.description,
            prioridad: originalTask.prioridad,
            fechaInicio: originalTask.fechaInicio,
            fechaVencimiento: originalTask.fechaVencimiento,
            fechaCompletado: originalTask.fechaCompletado,
            storyPoints: originalTask.storyPoints,
            tiempoReal: originalTask.tiempoReal,
            tiempoEstimado: originalTask.tiempoEstimado,
            aceptada: originalTask.aceptada,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to update task:", error);
        fetchTasks();
      }
    }

    setActiveId(null);
    setActiveTask(null);
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
      <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />

      <div className="flex-1 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <header className="flex flex-wrap items-center justify-between py-4 gap-4">
          <h1 className="text-white text-2xl font-semibold">Dashboard</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <select className="bg-[#2a2a2a] text-white rounded px-4 py-2 text-sm">
              <option>Select a Project</option>
            </select>
            <select className="bg-[#2a2a2a] text-white rounded px-4 py-2 text-sm">
              <option>All Users</option>
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
            <div className="flex items-center gap-3">
              <Bell className="text-white cursor-pointer hover:text-red-500" />
              <UserCircle className="text-white w-8 h-8 cursor-pointer hover:text-red-500" />
            </div>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
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
      </div>

      {showTaskModal && (
        <TaskDetailsModal
          task={selectedTask}
          sprints={sprints}
          onClose={() => setShowTaskModal(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default DashDev;
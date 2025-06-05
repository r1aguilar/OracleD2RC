import React, { useState, useEffect, useCallback } from "react";
import Dropdown from "./components/DropDown";
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
import SidebarManager from "./components/SidebarManager";

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

// Create a separate droppable component for empty columns
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

const TaskList = ({ columnId, tasks }) => {
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
          <div className="bg-[#1a1a1a] rounded-lg p-4 shadow-md border border-neutral-700">
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
  // Debug state to track what's happening with sprint selection
  const [debugSprintInfo, setDebugSprintInfo] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 8 } 
    }),
    useSensor(KeyboardSensor, { 
      coordinateGetter: sortableKeyboardCoordinates 
    })
  );

  const fetchProyectos = useCallback(async () => {
    const userId = JSON.parse(localStorage.getItem("userId"));
    if (!userId) return;
    try {
      const res = await fetch(`/pruebasProy/ProyectosForManager/${userId}`);
      const data = await res.json();
      
      // Ensure we get valid sprint data
      const validProys = data.filter(proy => 
        proy && proy.id !== undefined && proy.id !== null
      );
      
      // Log valid sprints for debugging
      console.log("Fetched proyectos:", validProys);
      
      setProyectos(validProys);
      console.log(validProys[0].id)
      setSelectedProyecto(validProys[0].id)
      
      console.log("Initial selected proyecto IDs:", validProys[0].id);

      return validProys[0].id;
      
    } catch (err) {
      console.error("Failed to fetch proyectos", err);
    }
  }, []);

  const fetchIntegrantes = useCallback(async (proyectoId = selectedProyecto) => {
    if (!proyectoId) return;
    try {
      const res = await fetch(`/pruebasProy/UsuariosProyecto/${proyectoId}`);
      const data = await res.json();
      
      // Ensure we get valid sprint data
      const validUsers = data.filter(user => 
        user && user.id !== undefined && user.id !== null
      );
      
      // Log valid sprints for debugging
      console.log("Fetched users:", validUsers);

      setIntegrantes(validUsers);
      setSelectedIntegrante(null)
      
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, []);

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
          idColumna: task.idColumna, // Backend column ID
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
      setAllTasks(newTasks);  // Save full list
      setOriginalTaskLocations(newOriginalLocations);
    } catch (err) {
      console.error(err);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const fetchSprints = useCallback(async (proyectoId = selectedProyecto) => {
    if (!proyectoId) return;

    try {
      const res = await fetch(`/pruebasSprint/SprintsForProject/${proyectoId}`);
      const data = await res.json();
      
      // Ensure we get valid sprint data
      const validSprints = data.filter(sprint => 
        sprint && sprint.id !== undefined && sprint.id !== null
      );
      
      // Log valid sprints for debugging
      console.log("Fetched sprints:", validSprints);
      
      setSprints(validSprints);
      
      // Initialize all sprints as selected, using Number() to ensure IDs are numeric
      const initialSelectedSprints = new Set(
        validSprints
          .map(sprint => Number(sprint.id))
          .filter(id => !isNaN(id)) // Filter out any NaN values
      );
      
      setSelectedSprints(initialSelectedSprints);
      console.log("Initial selected sprint IDs:", Array.from(initialSelectedSprints));
      
    } catch (err) {
      console.error("Failed to fetch sprints", err);
    }
  }, []);

  useEffect(() => {
  const init = async () => {
    const proyectoId = await fetchProyectos();
  };
  init();
}, []);

  useEffect(() => {
    if (selectedProyecto) {
      fetchTasks(selectedProyecto);
      fetchSprints(selectedProyecto);
      fetchIntegrantes(selectedProyecto);
    }
  }, [selectedProyecto]);


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

  const sprintTaskCounts = {};
  const filtered = Object.fromEntries(
    Object.entries(allTasks).map(([columnKey, columnTasks]) => [
      columnKey,
      columnTasks.filter((task) => {
        const sprintId = Number(task.idSprint);
        const encargadoId = task.idEncargado;

        if (isNaN(sprintId) || !selectedSprints.has(sprintId)) {
          return false;
        }

        // If selectedIntegrante is null or empty string, show all
        if (!selectedIntegrante || selectedIntegrante === "null") {
          return true;
        }

        return String(encargadoId) === String(selectedIntegrante);
      }),
    ])
  );

  Object.values(allTasks).forEach((columnTasks) => {
    columnTasks.forEach((task) => {
      const sid = Number(task.idSprint);
      if (!isNaN(sid)) {
        sprintTaskCounts[sid] = (sprintTaskCounts[sid] || 0) + 1;
      }
    });
  });

  setTasks(filtered);
  setDebugSprintInfo({
      selectedSprints: Array.from(selectedSprints),
      filteredTaskCount: Object.values(filtered).flat().length,
      allTasksCount: Object.values(allTasks).flat().length,
    });
  }, [selectedSprints, allTasks, selectedIntegrante]);


  // Function to handle sprint selection/deselection
  const handleSprintToggle = (sprintId, isChecked) => {
    // Ensure sprintId is a number
    const numericSprintId = Number(sprintId);
    
    // Check if it's a valid number
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

  // Completely avoiding the use of findColumn() during drag end since it's causing issues
  const findColumn = (itemId) => {
    if (itemId === "pending" || itemId === "doing" || itemId === "done") {
      return itemId;
    }
    
    for (const colId of ["pending", "doing", "done"]) {
      if (tasks[colId].some(task => task.id === itemId)) {
        return colId;
      }
    }
    
    return null;
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
              value={selectedProyecto}
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
              value={selectedIntegrante}
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
                id: Number(sprint.id), // Ensure numeric IDs
                name: sprint.nombre || `Sprint ${sprint.id}` // Fallback name if none exists
              }))}
              onSelect={handleSprintToggle}
              initialChecked={true}
            />
            
            {/* Debug info - remove in production */}
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          measuring={{
            droppable: {
              strategy: 'always'
            }
          }}
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
    </div>
  );
};

export default DashManager;
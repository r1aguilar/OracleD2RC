import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './components/SortableItem';
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

const DashDev = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({ pending: [], doing: [], done: [] });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = useCallback(async () => {
    // Obtener datos completos del usuario
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.id;
  
    if (!userId) {
      console.error("No se encontró ID de usuario");
      navigate("/login");
      return;
    }
  
    try {
      const response = await fetch(`http://160.34.212.100/pruebas/TareasUsuario/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al cargar tareas");
      }
  
      const data = await response.json();
      const newTasks = { pending: [], doing: [], done: [] };
  
      data.forEach((task) => {
        const formattedTask = {
          id: `task-${task.idTarea}`,
          rawId: task.idTarea,
          type: task.prioridad === 1 ? "Low" : task.prioridad === 2 ? "Medium" : "High",
          title: task.nombre,
          description: task.descripcion,
          idColumna: task.idColumna,
          idEncargado: task.idEncargado,
          idProyecto: task.idProyecto,
          idSprint: task.idSprint,
          fechaInicio: task.fechaInicio,
          fechaVencimiento: task.fechaVencimiento,
          prioridad: task.prioridad
        };
  
        if (task.idColumna === 1) newTasks.pending.push(formattedTask);
        else if (task.idColumna === 2) newTasks.doing.push(formattedTask);
        else if (task.idColumna === 3) newTasks.done.push(formattedTask);
      });
  
      setTasks(newTasks);
    } catch (err) {
      console.error("Error cargando tareas:", err);
      
      // Redirigir a login si el error es 401 (No autorizado)
      if (err.message.includes("401")) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
  
    if (!over || active.id === over.id) return;
  
    // 1. Identificar columnas involucradas
    let sourceColumn, destinationColumn;
    Object.entries(tasks).forEach(([column, items]) => {
      if (items.some(item => item.id === active.id)) sourceColumn = column;
      if (items.some(item => item.id === over.id)) destinationColumn = column;
    });
  
    if (!sourceColumn || !destinationColumn) return;
  
    // 2. Actualización optimista en el estado local
    const sourceItems = [...tasks[sourceColumn]];
    const taskIndex = sourceItems.findIndex(item => item.id === active.id);
    const [movedTask] = sourceItems.splice(taskIndex, 1);
    
    const updatedTask = { 
      ...movedTask, 
      idColumna: columnMap[destinationColumn] 
    };
  
    const destItems = [...tasks[destinationColumn]];
    destItems.splice(destItems.findIndex(item => item.id === over.id), 0, updatedTask);
  
    setTasks({
      ...tasks,
      [sourceColumn]: sourceItems,
      [destinationColumn]: destItems
    });
  
    // 3. Actualización en el backend usando el endpoint correcto
    try {
      const response = await fetch(`http://160.34.212.100/pruebas/updateTarea/${movedTask.rawId}`, {
        method: "PUT", // Usando PUT como especifica tu @PutMapping
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idTarea: movedTask.rawId,
          idColumna: columnMap[destinationColumn],
          nombre: movedTask.title,
          descripcion: movedTask.description,
          prioridad: movedTask.prioridad === "High" ? 3 : 
                   movedTask.prioridad === "Medium" ? 2 : 1,
          idEncargado: movedTask.idEncargado,
          idProyecto: movedTask.idProyecto,
          // Incluye todos los campos que tu entidad Tarea requiere
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar tarea");
      }
  
      const updatedData = await response.json();
      console.log("✅ Tarea actualizada:", updatedData);
    } catch (error) {
      console.error("❌ Error al actualizar tarea:", error.message);
      // Revertir cambios si falla
      setTasks(prevTasks => ({
        ...prevTasks,
        [sourceColumn]: [...prevTasks[sourceColumn], movedTask],
        [destinationColumn]: prevTasks[destinationColumn].filter(t => t.id !== movedTask.id)
      }));
    }
  };

  const totalTasks = tasks.pending.length + tasks.doing.length + tasks.done.length;
  const progress = totalTasks > 0 ? Math.round((tasks.done.length / totalTasks) * 100) : 0;

  if (isLoading) {
    return <div className="text-white text-center mt-10">Cargando tareas...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#1a1a1a]">
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white"
        onClick={() => setIsMobileOpen(true)}
      >
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
            <select className="bg-[#2a2a2a] text-white rounded px-4 py-2 text-sm">
              <option>Sprints</option>
              <option>Sprint 1</option>
              <option>Sprint 2</option>
              <option>Sprint 3</option>
            </select>
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
          onDragEnd={handleDragEnd}
        >
          <main className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.entries(tasks).map(([columnId, columnTasks]) => (
              <section
                key={columnId}
                className="bg-[#2a2a2a] text-white rounded-lg p-4 flex flex-col"
              >
                <h2 className="text-lg font-semibold mb-2 capitalize">
                  {columnId} ({columnTasks.length})
                </h2>
                <SortableContext
                  items={columnTasks}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 flex-1 min-h-[100px]">
                    {columnTasks.map((task) => (
                      <SortableItem key={task.id} id={task.id}>
                        <div className="bg-[#1a1a1a] rounded-lg p-4 shadow-md border border-neutral-700">
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${tagColors[task.type]}`}>
                            {task.type}
                          </span>
                          <h3 className="font-semibold text-white mt-2">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {task.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(task.fechaVencimiento).toLocaleDateString()}
                          </p>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </section>
            ))}

            <section className="bg-[#2a2a2a] text-white rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Progress</h2>
              <div className="w-full flex items-center justify-center mb-4 relative">
                <ResponsiveContainer width="100%" height={120}>
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={10}
                    data={[{ name: "Progress", value: progress, fill: "#ff1f1f" }]}
                  >
                    <RadialBar
                      minAngle={15}
                      background
                      clockWise
                      dataKey="value"
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <span className="absolute text-xl font-bold text-white">
                  {progress}%
                </span>
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
        </DndContext>
      </div>
    </div>
  );
};

export default DashDev;
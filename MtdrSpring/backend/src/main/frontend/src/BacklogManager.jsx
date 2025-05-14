import React, { useEffect, useState, useCallback } from "react";
import SidebarManager from "./components/SidebarManager";
import { Plus } from "lucide-react";
import { Bell, UserCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragOverlay} from "@dnd-kit/core";
import SprintColumn from "./components/SprintColumn";
import TaskChip from "./components/TaskChip";



const BacklogManager = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [integrantes, setIntegrantes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [selectedIntegrante, setSelectedIntegrante] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const sensors = useSensors(useSensor(PointerSensor));
  const [activeTaskId, setActiveTaskId] = useState(null);

  const handleDragStart = (event) => {
    setActiveTaskId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!active || !over) return;

    const draggedTask = active.data.current?.task;
    const targetSprintId = over.id;

    if (draggedTask.idSprint === targetSprintId) return;

    const targetSprint = sprints.find((s) => s.id === targetSprintId);

    const updatedTask = {
      ...draggedTask,
      idSprint: targetSprintId,
      fechaInicio: targetSprint?.fechaInicio || null,
      fechaVencimiento: targetSprint?.fechaFin || null,
    };

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === draggedTask.id ? updatedTask : t))
    );

    // ✅ Log for verification
    console.log("Task updated after drag:", updatedTask);
  };


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
        const newTasks = [];
  
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
          newTasks.push(taskObj);
        });
  
        setTasks(newTasks);
        setAllTasks(newTasks);  // Save full list
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
    if (!selectedIntegrante || selectedIntegrante === "null") {
      // Show all tasks if no integrante is selected
      setTasks(allTasks);
      return;
    }

    const filtered = allTasks.filter(
      (task) => String(task.idEncargado) === String(selectedIntegrante)
    );

    setTasks(filtered);
  }, [selectedIntegrante, allTasks]);


  const handleAddSprint = () => {
    const newId = sprints.length + 1;
    const newSprint = {
      id: newId,
      idProyecto: selectedProyecto,
      nombre: `Sprint ${newId}`,
      descripcion: `Sprint ${newId}`,
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: "-",
      completado: "In progress",
      deleted: 0
    };
    setSprints([...sprints, newSprint]);
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      <SidebarManager isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />

      <div className="flex-1 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <header className="flex flex-wrap items-center justify-between py-4 gap-4">
          <h1 className="text-white text-2xl font-semibold">Backlog</h1>
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
          <div className="space-y-6">
            {sprints.map((sprint) => (
              <SprintColumn key={sprint.id} sprint={sprint}>
                {tasks
                  .filter((task) => task.idSprint === sprint.id)
                  .map((task) => (
                    <TaskChip key={task.id} task={task} />
                  ))}
              </SprintColumn>
            ))}

            <button
              onClick={handleAddSprint}
              className="flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-full border border-neutral-600"
            >
              <Plus size={18} /> Create new sprint
            </button>

            <SprintColumn
              sprint={{
                id: null,
                nombre: "Backlog",
                fechaInicio: "-",
                fechaFin: "-",
              }}
            >
              {tasks
                .filter((task) => task.idSprint === null)
                .map((task) => (
                  <TaskChip key={task.id} task={task} />
                ))}
            </SprintColumn>
          </div>

          <DragOverlay>
            {activeTaskId ? (
              <div className="bg-[#1a1a1a] text-white rounded-full px-4 py-1 text-sm shadow border border-neutral-700">
                {tasks.find((task) => task.id === activeTaskId)?.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );

};

export default BacklogManager;

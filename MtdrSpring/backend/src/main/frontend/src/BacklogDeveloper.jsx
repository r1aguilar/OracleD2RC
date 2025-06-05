import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import { Bell, UserCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragOverlay} from "@dnd-kit/core";
import SprintColumn from "./components/SprintColumn";
import TaskChip from "./components/TaskChip";
import CreateTaskDeveloperModal from "./components/CreateTaskDeveloperModal";


const BacklogDeveloper = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [isChangingSprintStatus, setIsChangingSprintStatus] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createTaskSprintId, setCreateTaskSprintId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));
  const [activeTaskId, setActiveTaskId] = useState(null);
  var completadoFlag = true;

  const handleDragStart = (event) => {
    setActiveTaskId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    const draggedTask = active.data.current?.task;
    const targetSprintId = over.id;

    // Don't do anything if dropped on the same sprint
    if (draggedTask.idSprint === targetSprintId) return;

    const originalSprintId = draggedTask.idSprint;
    const targetSprint = sprints.find((s) => s.id === targetSprintId);
    const sourceSprint = sprints.find((s) => s.id === draggedTask.idSprint);

      // Block if either sprint is completed
    if (targetSprint?.completado || sourceSprint?.completado) return;

    const updatedTask = {
      ...draggedTask,
      idSprint: targetSprintId,
      fechaInicio: targetSprint?.fechaInicio || null,
      fechaVencimiento: targetSprint?.fechaFin || null,
    };

    // Optimistically update the task in UI
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === draggedTask.id ? updatedTask : t))
    );

    try {
      const response = await fetch(`/pruebas/updateTarea/${draggedTask.rawId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idTarea: draggedTask.rawId,
          idEncargado: draggedTask.idEncargado,
          idProyecto: draggedTask.idProyecto,
          idColumna: draggedTask.idColumna,
          idSprint: targetSprintId,
          nombre: draggedTask.title,
          descripcion: draggedTask.description,
          prioridad: draggedTask.prioridad,
          fechaInicio: targetSprint?.fechaInicio || null,
          fechaVencimiento: targetSprint?.fechaFin || null,
          fechaCompletado: draggedTask.fechaCompletado,
          storyPoints: draggedTask.storyPoints,
          tiempoReal: draggedTask.tiempoReal,
          tiempoEstimado: draggedTask.tiempoEstimado,
          aceptada: draggedTask.aceptada,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      console.log("Task updated successfully in backend");
    } catch (error) {
      console.error("Failed to update task:", error);

      // Roll back the UI if the update failed
      const revertedTask = {
        ...draggedTask,
        idSprint: originalSprintId,
        fechaInicio: draggedTask.fechaInicio,
        fechaVencimiento: draggedTask.fechaVencimiento,
      };

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === draggedTask.id ? revertedTask : t))
      );
    }
  };


  const fetchTasks = useCallback(async () => {
    const userId = JSON.parse(localStorage.getItem("userId"));
    if (!userId) return;
    try {
      const res = await fetch(`/pruebas/TareasCompletasUsuario/${userId}`);
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
          aceptada: task.aceptada,
          type: task.prioridad === 1 ? "Low" : task.prioridad === 2 ? "Medium" : "High",
        };
        newTasks.push(taskObj);
      });

      setTasks(newTasks);
      setAllTasks(newTasks);  // Save full list
      console.log(newTasks);
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

  const fetchProyecto = useCallback(async () => {
    const userId = JSON.parse(localStorage.getItem("userId"));
    if (!userId) return;
    try {
      const res = await fetch(`/pruebasProy/ProyectoUsuario/${userId}`);
      const data = await res.json();
      
      // Log valid sprints for debugging
      console.log("Fetched proyecto:", data);
      
      setSelectedProyecto(data);
      
    } catch (err) {
      console.error("Failed to fetch proyecto", err);
    }
  }, []);

  useEffect(() => {
      const init = async () => {
        await fetchProyecto();
        await fetchSprints();
        await fetchTasks();
      };
      init();
    }, []);

  const handleOpenCreateTaskModel = (sprintId) => {
    console.log("Changing createTaskSprintId")
    setCreateTaskSprintId(sprintId.id);
    setIsCreatingTask(true);
  }

  const handleAddTask = async (newTask) => {
    const taskPayload = {
      idEncargado: JSON.parse(localStorage.getItem("userId")),
      idProyecto: newTask.idProyecto,
      idColumna: newTask.idColumna,
      idSprint: newTask.idSprint,
      nombre: newTask.nombre,
      descripcion: newTask.descripcion,
      prioridad: newTask.prioridad,
      fechaInicio: newTask.fechaInicio,
      fechaVencimiento: newTask.fechaVencimiento,
      storyPoints: newTask.storyPoints,
      tiempoReal: newTask.tiempoReal,
      tiempoEstimado: newTask.tiempoEstimado,
      aceptada: 0,
    };

    try {
      const response = await fetch("/pruebas/Tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskPayload),
      });

      if (!response.ok) throw new Error("Failed to add task");

      const idTarea = response.headers.get("location");
      if (!idTarea) throw new Error("No idTarea returned in response headers");

      await fetchTasks();
    } catch (e) {
      console.error("Error adding task:", e);
    }
  };


  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />

      <div className="flex-1 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <header className="flex flex-wrap items-center justify-between py-4 gap-4">
          <h1 className="text-white text-2xl font-semibold">Backlog</h1>
          <div className="flex flex-wrap gap-3 items-center">
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
            {sprints.map((sprint, index) => {
              const isLastSprint = sprint.completado === false && completadoFlag;
              if(isLastSprint){completadoFlag = false;}

              return (
                <SprintColumn
                  key={sprint.id}
                  sprint={sprint}
                  activeTaskId={activeTaskId}
                  isLastSprint={isLastSprint}
                  isDisabled={sprint.completado}
                  isChangingStatus={isChangingSprintStatus}
                  setIsCreatingTask={handleOpenCreateTaskModel}
                  isManager={false}
                >
                  {tasks
                    .filter((task) => task.idSprint === sprint.id)
                    .map((task) => (
                      <TaskChip
                        key={task.id}
                        task={task}
                        isDropTarget={activeTaskId && activeTaskId === task.id}
                      />
                    ))}
                </SprintColumn>
              );
            })}

            <SprintColumn
              sprint={{
                id: null,
                nombre: "Backlog",
                fechaInicio: "-",
                fechaFin: "-",
                completado: false,
                deleted: false
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

          {isCreatingTask && (
            <CreateTaskDeveloperModal
              sprint={createTaskSprintId}
              idProy={selectedProyecto}
              sprints={sprints}
              onClose={() => setIsCreatingTask(false)}
              onSave={async (newTask) => {
                await handleAddTask(newTask); // Assume it's async
                setIsCreatingTask(false);
              }}
            />
          )}

        </DndContext>
      </div>
    </div>
  );

};

export default BacklogDeveloper;
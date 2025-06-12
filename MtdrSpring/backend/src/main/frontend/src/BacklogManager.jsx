import React, { useEffect, useState, useCallback } from "react";
import SidebarManager from "./components/SidebarManager";
import { Plus } from "lucide-react";
import { Bell, UserCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import SprintColumn from "./components/SprintColumn";
import CreateSprintModal from "./components/CreateSprintModal";
import TaskChip from "./components/TaskChip";
import CreateTaskManagerModal from "./components/CreateTaskManagerModal";

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
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isChangingSprintStatus, setIsChangingSprintStatus] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createTaskSprintId, setCreateTaskSprintId] = useState(null);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [verification, setVerification] = useState(null);

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

    var bodyToSend = JSON.stringify({
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
      fechaCompletado: draggedTask.fechaCompletado || null,
      storyPoints: draggedTask.storyPoints,
      tiempoReal: draggedTask.tiempoReal,
      tiempoEstimado: draggedTask.tiempoEstimado,
      aceptada: draggedTask.aceptada,
    });

    console.log(bodyToSend);

    try {
      const response = await fetch(
        `/pruebas/updateTarea/${draggedTask.rawId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: bodyToSend,
        }
      );

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

  const fetchProyectos = useCallback(async () => {
    const userId = JSON.parse(localStorage.getItem("userId"));
    if (!userId) return;
    try {
      const res = await fetch(`/pruebasProy/ProyectosForManager/${userId}`);
      const data = await res.json();

      // Ensure we get valid sprint data
      const validProys = data.filter(
        (proy) => proy && proy.id !== undefined && proy.id !== null
      );

      // Log valid sprints for debugging
      console.log("Fetched proyectos:", validProys);

      setProyectos(validProys);
      console.log(validProys[0].id);
      setSelectedProyecto(validProys[0].id);

      console.log("Initial selected proyecto IDs:", validProys[0].id);

      return validProys[0].id;
    } catch (err) {
      console.error("Failed to fetch proyectos", err);
    }
  }, []);

  const fetchIntegrantes = useCallback(
    async (proyectoId = selectedProyecto) => {
      if (!proyectoId) return;
      try {
        const res = await fetch(`/pruebasProy/UsuariosProyecto/${proyectoId}`);
        const data = await res.json();

        // Ensure we get valid sprint data
        const validUsers = data.filter(
          (user) => user && user.id !== undefined && user.id !== null
        );

        // Log valid sprints for debugging
        console.log("Fetched users:", validUsers);

        setIntegrantes(validUsers);
        setSelectedIntegrante(null);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    },
    []
  );

  const fetchTasks = useCallback(
    async (proyectoId = selectedProyecto) => {
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
            type:
              task.prioridad === 1
                ? "Low"
                : task.prioridad === 2
                ? "Medium"
                : "High",
          };
          newTasks.push(taskObj);
        });

        setTasks(newTasks);
        setAllTasks(newTasks); // Save full list
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const fetchSprints = useCallback(async (proyectoId = selectedProyecto) => {
    if (!proyectoId) return;

    try {
      const res = await fetch(`/pruebasSprint/SprintsForProject/${proyectoId}`);
      const data = await res.json();

      // Ensure we get valid sprint data
      const validSprints = data.filter(
        (sprint) => sprint && sprint.id !== undefined && sprint.id !== null
      );

      // Log valid sprints for debugging
      console.log("Fetched sprints:", validSprints);

      setSprints(validSprints);
    } catch (err) {
      console.error("Failed to fetch sprints", err);
    }
  }, []);

  const checkTokenAndFetchData = async () => {
    try {
      const response = await fetch("/pruebasUser/validarTokenManager", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // or however you store it
        },
      });

      if (!response.ok) throw new Error("Token validation request failed");

      const isValid = await response.json();
      if (!isValid) {
        navigate("/login");
        return;
      }
      console.log("Verification completed");
      setVerification(true);
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkTokenAndFetchData();
    };
    init();
  }, [checkTokenAndFetchData]);

  useEffect(() => {
    const init = async () => {
      const proyectoId = await fetchProyectos();
    };
    init();
  }, [verification]);

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

  // Inside BacklogManager component
  const handleSprintStatusChange = async (sprintId, newStatus) => {
    const sprint = sprints.find((s) => s.id === sprintId);
    if (!newStatus || isChangingSprintStatus) return;

    setIsChangingSprintStatus(true);

    const sprintPayload = {
      idSprint: sprint.id,
      idProyecto: sprint.idProyecto,
      nombre: sprint.nombre,
      descripcion: sprint.descripcion,
      fechaInicio: sprint.fechaInicio,
      fechaFin: sprint.fechaFin,
      completado: true,
      deleted: false,
    };

    try {
      const response = await fetch(
        `/pruebasSprint/CompleteSprint/${sprintId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sprintPayload),
        }
      );

      if (!response.ok) throw new Error("Failed to complete sprint");

      // Refresh sprints and tasks
      await fetchSprints(selectedProyecto);
      await fetchTasks(selectedProyecto);

      console.log("Sprint completed and data refreshed");
    } catch (error) {
      console.error("Error completing sprint:", error);
    } finally {
      setIsChangingSprintStatus(false);
    }
  };

  const handleAddSprint = async (newSprint) => {
    const sprintPayload = {
      idSprint: newSprint.id,
      idProyecto: newSprint.idProyecto,
      nombre: newSprint.nombre,
      descripcion: newSprint.descripcion,
      fechaInicio: newSprint.fechaInicio,
      fechaFin: newSprint.fechaFin,
      completado: false,
      deleted: false,
    };

    try {
      const response = await fetch("/pruebasSprint/Sprints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sprintPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to add sprint");
      }

      // If response is OK, add sprint to local state
      setSprints([...sprints, newSprint]);
    } catch (error) {
      console.error("Error adding sprint:", error);
      // Optionally: show a UI notification to the user
    }
  };

  const handleOpenCreateTaskModel = (sprintId) => {
    console.log("Changing createTaskSprintId");
    setCreateTaskSprintId(sprintId.id);
    setIsCreatingTask(true);
  };

  const handleAddTask = async (newTask) => {
    const taskPayload = {
      idEncargado: newTask.idEncargado,
      idProyecto: newTask.idProyecto,
      idColumna: newTask.idColumna,
      idSprint: newTask.idSprint,
      nombre: newTask.nombre,
      descripcion: newTask.descripcion,
      prioridad: newTask.prioridad,
      fechaInicio: newTask.fechaInicio,
      fechaVencimiento: newTask.fechaVencimiento,
      fechaCompletado: newTask.fechaCompletado,
      storyPoints: newTask.storyPoints,
      tiempoReal: newTask.tiempoReal,
      tiempoEstimado: newTask.tiempoEstimado,
      aceptada: 1,
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

      const formattedTask = {
        id: `task-${Number(idTarea)}`,
        rawId: Number(idTarea),
        idEncargado: newTask.idEncargado,
        idProyecto: newTask.idProyecto,
        idColumna: newTask.idColumna,
        idSprint: newTask.idSprint,
        title: newTask.nombre,
        description: newTask.descripcion,
        fechaInicio: newTask.fechaInicio,
        fechaVencimiento: newTask.fechaVencimiento,
        fechaCompletado: null,
        storyPoints: newTask.storyPoints,
        tiempoReal: newTask.tiempoReal,
        tiempoEstimado: newTask.tiempoEstimado,
        prioridad: newTask.prioridad,
        aceptada: 1,
        type:
          newTask.prioridad === 1
            ? "Low"
            : newTask.prioridad === 2
            ? "Medium"
            : "High",
      };

      setTasks((prev) => [...prev, formattedTask]);
      setAllTasks((prev) => [...prev, formattedTask]);
    } catch (e) {
      console.error("Error adding task:", e);
    }
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      <SidebarManager
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

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
              const isLastSprint =
                sprint.completado === false && completadoFlag;
              if (isLastSprint) {
                completadoFlag = false;
              }

              return (
                <SprintColumn
                  key={sprint.id}
                  sprint={sprint}
                  activeTaskId={activeTaskId}
                  isLastSprint={isLastSprint}
                  onStatusChange={handleSprintStatusChange}
                  isDisabled={sprint.completado}
                  isChangingStatus={isChangingSprintStatus}
                  setIsCreatingTask={handleOpenCreateTaskModel}
                  isManager={true}
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

            <button
              onClick={() => setIsCreateSprintModalOpen(true)}
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
                completado: false,
                deleted: false,
              }}
              activeTaskId={activeTaskId}
              setIsCreatingTask={handleOpenCreateTaskModel}
              isManager={true}
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

          {isCreateSprintModalOpen && (
            <CreateSprintModal
              sprints={sprints}
              onClose={() => setIsCreateSprintModalOpen(false)}
              onSave={(newSprint) => {
                handleAddSprint(newSprint);
                setIsCreateSprintModalOpen(false);
              }}
            />
          )}

          {isCreatingTask && (
            <CreateTaskManagerModal
              sprint={createTaskSprintId}
              idProy={selectedProyecto}
              sprints={sprints}
              integrantes={integrantes}
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

export default BacklogManager;

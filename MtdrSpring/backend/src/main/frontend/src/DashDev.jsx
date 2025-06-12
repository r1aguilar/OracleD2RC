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
import { Bell, UserCircle, Menu, Lock } from "lucide-react";
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
        isOver ? "border-red-500 bg-[#252525]" : "border-gray-600"
      }`}
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
      items={tasks.map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      {tasks.map((task) => {
        const sprint = sprints.find((s) => s.id === task.idSprint);
        const isLocked = sprint?.completado === true;

        return (
          <SortableItem key={task.id} id={task.id} disabled={isLocked}>
            <div
              className={`bg-[#1a1a1a] rounded-lg p-4 shadow-md border border-neutral-700 transition-colors ${
                isLocked ? "opacity-70" : "cursor-pointer hover:border-red-500"
              }`}
              onClick={() => !isLocked && onTaskClick(task)}
            >
              <span
                className={`text-xs px-2 py-1 rounded-full text-white ${
                  tagColors[task.type]
                }`}
              >
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
                    <span
                      className="text-xs text-gray-400"
                      title="Sprint completado"
                    >
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
      className={`bg-[#2a2a2a] text-white rounded-lg p-4 flex flex-col h-[calc(100vh-200px)] ${
        isOver ? "ring-2 ring-red-500 bg-[#3a3a3a]" : ""
      }`}
      data-column-id={id}
    >
      <h2 className="text-lg font-semibold mb-2 capitalize flex-shrink-0">
        {title} ({tasksCount})
      </h2>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {children}
      </div>
    </section>
  );
};
const DashDev = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({ pending: [], doing: [], done: [] });
  const [allTasks, setAllTasks] = useState({
    pending: [],
    doing: [],
    done: [],
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [overColumnId, setOverColumnId] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprints, setSelectedSprints] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [pendingTaskMove, setPendingTaskMove] = useState(null);
  const [realHours, setRealHours] = useState("");
  const [verification, setVerification] = useState(null);

  const formatToOffsetDateTime = (dateString) => {
    const date = new Date(dateString);
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, "0");
    const hours = pad(offset / 60);
    const minutes = pad(offset % 60);
    const localOffset = `${sign}${hours}:${minutes}`;
    return `${dateString}T00:00:00${localOffset}`;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function getCurrentDateWithMinusSixOffset() {
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, "0");

    // Calculate the adjusted time for -06:00 offset
    let adjustedDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    const year = adjustedDate.getUTCFullYear();
    const month = pad(adjustedDate.getUTCMonth() + 1);
    const day = pad(adjustedDate.getUTCDate());
    const hours = pad(adjustedDate.getUTCHours());
    const minutes = pad(adjustedDate.getUTCMinutes());
    const seconds = pad(adjustedDate.getUTCSeconds());

    // Return formatted string with fixed -06:00 timezone offset
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-06:00`;
  }

  const fetchTasks = useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.id;
    if (!userId) return navigate("/login");

    try {
      const res = await fetch(`/pruebas/TareasUsuario/${userId}`);
      if (!res.ok) throw new Error("Error al cargar tareas");

      const data = await res.json();
      console.log(data);
      const newTasks = { pending: [], doing: [], done: [] };

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
          type:
            task.prioridad === 1
              ? "Low"
              : task.prioridad === 2
              ? "Medium"
              : "High",
        };
        const column = columnNames[task.idColumna];
        if (column) {
          newTasks[column].push(taskObj);
        }
      });

      setTasks(newTasks);
      setAllTasks(newTasks);
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
      console.log(data);

      const validSprints = data.filter(
        (sprint) => sprint && sprint.id !== undefined && sprint.id !== null
      );

      setSprints(validSprints);

      const firstIncompleteSprint = validSprints.find(
        (sprint) => sprint.completado === false
      );

      const initialSelectedSprints = new Set(
        firstIncompleteSprint ? [Number(firstIncompleteSprint.id)] : []
      );

      console.log(initialSelectedSprints);

      setSelectedSprints(initialSelectedSprints);
    } catch (err) {
      console.error("Failed to fetch sprints", err);
    }
  }, []);

  const checkTokenAndFetchData = async () => {
    try {
      const response = await fetch("/pruebasUser/validarTokenDeveloper", {
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
    if (verification === true) {
      fetchTasks();
      fetchSprints();
    }
  }, [verification]);

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
        }),
      ])
    );

    setTasks(filtered);
  }, [selectedSprints, allTasks]);

  const handleSprintToggle = (sprintId, isChecked) => {
    const numericSprintId = Number(sprintId);
    if (isNaN(numericSprintId)) return;

    setSelectedSprints((prev) => {
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
      if (tasks[colId].some((task) => task.id === itemId)) {
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
    Object.keys(newState).forEach((col) => {
      newState[col] = newState[col].map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      );
    });
    return newState;
  };

  const handleSaveTask = async (updatedTask) => {
    try {
      // Validación del sprint
      const taskSprint = sprints.find(
        (s) => Number(s.id) === Number(updatedTask.idSprint)
      );
      if (taskSprint) {
        const dueDate = new Date(updatedTask.fechaVencimiento);
        const startDate = new Date(taskSprint.fechaInicio);
        const endDate = new Date(taskSprint.fechaFin);

        if (dueDate < startDate || dueDate > endDate) {
          throw new Error(
            `La fecha debe estar entre ${startDate.toLocaleDateString()} y ${endDate.toLocaleDateString()}`
          );
        }
      }

      // Validación de horas reales si está en done
      if (updatedTask.idColumna === 3) {
        const horasReales = parseInt(updatedTask.tiempoReal);
        if (isNaN(horasReales) || horasReales < 0) {
          throw new Error(
            "Las horas reales deben ser un número entero positivo"
          );
        }
      }

      // Asegurar que los campos numéricos sean números
      const prioridad = Number(updatedTask.prioridad) || 1;
      const tiempoReal =
        updatedTask.idColumna === 3
          ? Number(updatedTask.tiempoReal) || null
          : updatedTask.tiempoReal || null;

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
          fechaCompletado: updatedTask.fechaCompletado,
        }),
        storyPoints: updatedTask.storyPoints,
        tiempoReal: tiempoReal,
        tiempoEstimado: updatedTask.tiempoEstimado,
        aceptada: updatedTask.aceptada,
      };

      console.log("Enviando datos al servidor:", payload); // Para depuración

      const response = await fetch(
        `/pruebas/updateTarea/${updatedTask.rawId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const responseData = await response.json();

      // Actualizar estado local
      const updatedTaskData = {
        ...updatedTask,
        prioridad: responseData.prioridad || prioridad,
        tiempoReal: responseData.tiempoReal || tiempoReal,
        fechaVencimiento:
          responseData.fechaVencimiento || updatedTask.fechaVencimiento,
        title: responseData.nombre || updatedTask.title,
        description: responseData.descripcion || updatedTask.description,
      };

      setTasks((prev) => updateTaskState(prev, updatedTaskData));
      setAllTasks((prev) => updateTaskState(prev, updatedTaskData));

      return responseData;
    } catch (error) {
      console.error("Error al guardar:", error);
      throw error;
    }
  };

  const handleDeleteTask = async (deletedTask) => {
    try {
      const response = await fetch(
        `/pruebas/deleteTarea/${deletedTask.rawId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      const deletedFlag = await response.json();

      if (deletedFlag === true) {
        // Refetch task lists
        fetchTasks();
      } else {
        console.warn("Deletion did not return true. Response:", deletedFlag);
      }
    } catch (error) {
      console.error("Error al borrar:", error);
      throw error;
    }
  };

  const handleDragStart = ({ active }) => {
    const column = findColumn(active.id);
    if (!column) return;

    const task = tasks[column].find((t) => t.id === active.id);
    setActiveId(active.id);
    setActiveTask(task || null);
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

    // Remove the premature state update that was causing the issue
    // Just track which column we're over for visual feedback
  };

  const handleDragEnd = async ({ active, over }) => {
    setOverColumnId(null);

    if (!active || !over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    const sourceColumn = findColumn(active.id);
    let targetColumn = null;

    if (["pending", "doing", "done"].includes(over.id)) {
      targetColumn = over.id;
    } else {
      for (const col of ["pending", "doing", "done"]) {
        if (tasks[col].some((task) => task.id === over.id)) {
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

    const originalTask =
      tasks[sourceColumn]?.find((task) => task.id === active.id) || activeTask;
    if (!originalTask) {
      console.error("Original task not found:", active.id);
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    // Check if moving to "done" column
    if (targetColumn === "done" && sourceColumn !== "done") {
      // Show hours input modal
      setPendingTaskMove({
        originalTask,
        sourceColumn,
        targetColumn,
      });
      setRealHours(originalTask.tiempoReal?.toString() || "");
      setShowHoursModal(true);
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    if (sourceColumn === targetColumn) {
      // Handle reordering within the same column
      if (over.id !== targetColumn) {
        const activeIndex = tasks[sourceColumn].findIndex(
          (task) => task.id === active.id
        );
        const overIndex = tasks[targetColumn].findIndex(
          (task) => task.id === over.id
        );
        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
          setTasks((prev) => ({
            ...prev,
            [sourceColumn]: arrayMove(
              prev[sourceColumn],
              activeIndex,
              overIndex
            ),
          }));
          setAllTasks((prev) => ({
            ...prev,
            [sourceColumn]: arrayMove(
              prev[sourceColumn],
              activeIndex,
              overIndex
            ),
          }));
        }
      }
    } else {
      // Handle moving between columns (not to done)
      const targetColumnId = columnMap[targetColumn];

      const updatedTask = {
        ...originalTask,
        idColumna: targetColumnId,
        tiempoReal: targetColumn === "done" ? originalTask.tiempoReal : null,
      };

      // Update both tasks and allTasks state
      setTasks((prev) => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(
          (task) => task.id !== active.id
        ),
        [targetColumn]: [...prev[targetColumn], updatedTask],
      }));

      setAllTasks((prev) => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(
          (task) => task.id !== active.id
        ),
        [targetColumn]: [...prev[targetColumn], updatedTask],
      }));

      // Update the server
      try {
        const response = await fetch(
          `/pruebas/updateTarea/${originalTask.rawId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
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
              fechaCompletado:
                targetColumn === "done"
                  ? getCurrentDateWithMinusSixOffset()
                  : null,
              storyPoints: originalTask.storyPoints,
              tiempoReal:
                targetColumn === "done" ? originalTask.tiempoReal : null,
              tiempoEstimado: originalTask.tiempoEstimado,
              aceptada: originalTask.aceptada,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to update task:", error);
        // Revert the state on error
        fetchTasks();
      }
    }

    setActiveId(null);
    setActiveTask(null);
  };

  const handleCancelHours = () => {
    setShowHoursModal(false);
    setPendingTaskMove(null);
    setRealHours("");
  };

  const handleSaveHours = async () => {
    if (!pendingTaskMove) return;

    const hours = parseFloat(realHours);
    if (isNaN(hours) || hours < 0) {
      alert("Please enter a valid number of hours");
      return;
    }

    const { originalTask, sourceColumn, targetColumn } = pendingTaskMove;
    const targetColumnId = columnMap[targetColumn];

    const updatedTask = {
      ...originalTask,
      idColumna: targetColumnId,
      tiempoReal: hours,
    };

    // Update both tasks and allTasks state
    setTasks((prev) => ({
      ...prev,
      [sourceColumn]: prev[sourceColumn].filter(
        (task) => task.id !== originalTask.id
      ),
      [targetColumn]: [...prev[targetColumn], updatedTask],
    }));

    setAllTasks((prev) => ({
      ...prev,
      [sourceColumn]: prev[sourceColumn].filter(
        (task) => task.id !== originalTask.id
      ),
      [targetColumn]: [...prev[targetColumn], updatedTask],
    }));

    var bodyToSend = JSON.stringify({
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
      fechaCompletado: getCurrentDateWithMinusSixOffset(),
      storyPoints: originalTask.storyPoints,
      tiempoReal: hours,
      tiempoEstimado: originalTask.tiempoEstimado,
      aceptada: originalTask.aceptada,
    });

    console.log(bodyToSend);

    // Update the server
    try {
      const response = await fetch(
        `/pruebas/updateTarea/${originalTask.rawId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: bodyToSend,
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      // Revert the state on error
      fetchTasks();
    }

    // Close modal and reset state
    setShowHoursModal(false);
    setPendingTaskMove(null);
    setRealHours("");
  };

  const progress =
    tasks.done.length + tasks.pending.length + tasks.doing.length > 0
      ? Math.round(
          (tasks.done.length /
            (tasks.done.length + tasks.pending.length + tasks.doing.length)) *
            100
        )
      : 0;

  if (isLoading)
    return (
      <div className="text-white text-center mt-10">Cargando tareas...</div>
    );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#1a1a1a]">
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={28} />
      </button>
      <Sidebar
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <header className="flex flex-wrap items-center justify-between py-4 gap-4">
          <h1 className="text-white text-2xl font-semibold">Dashboard</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <Dropdown
              label="Sprints"
              options={sprints.map((sprint) => ({
                id: Number(sprint.id),
                name: sprint.nombre || `Sprint ${sprint.id}`,
              }))}
              onSelect={handleSprintToggle}
              initialChecked={true}
            />
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          measuring={{ droppable: { strategy: "always" } }}
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

            <section className="bg-[#2a2a2a] text-white rounded-lg p-4 flex flex-col h-[calc(100vh-200px)]">
              <h2 className="text-lg font-semibold mb-4 flex-shrink-0">
                Progress
              </h2>
              <div className="flex-1 flex items-center justify-center relative min-h-0">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-full h-full max-w-[min(100%,100vh)] max-h-[min(100%,100vw)] aspect-square">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="60%"
                        outerRadius="90%"
                        barSize={15}
                        data={[
                          {
                            name: "Progress",
                            value: progress,
                            fill: "#ff1f1f",
                          },
                        ]}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <RadialBar
                          minAngle={15}
                          background={{ fill: "#444" }}
                          clockWise
                          dataKey="value"
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <DragOverlay>
            {activeId && activeTask && (
              <div className="bg-[#1a1a1a] rounded-lg p-4 shadow-md border border-neutral-700 opacity-80">
                <span
                  className={`text-xs px-2 py-1 rounded-full text-white ${
                    tagColors[activeTask.type]
                  }`}
                >
                  {activeTask.type}
                </span>
                <h3 className="font-semibold text-white mt-2">
                  {activeTask.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {activeTask.description}
                </p>
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
          onDelete={handleDeleteTask}
        />
      )}

      {showHoursModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">
              Input Real Hours
            </h2>
            <p className="text-gray-300 mb-4">
              Please enter the actual hours spent on task:{" "}
              <span className="font-medium">
                {pendingTaskMove?.originalTask?.title}
              </span>
            </p>

            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Real Hours *
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={realHours}
                onChange={(e) => setRealHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                placeholder="Enter hours (e.g., 2.5)"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelHours}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHours}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashDev;

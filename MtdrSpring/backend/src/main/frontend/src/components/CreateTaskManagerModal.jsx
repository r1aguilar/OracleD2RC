import React, { useState, useEffect } from "react";

const CreateTaskManagerModal = ({ sprints, integrantes, onClose, onSave, onDelete }) => {
  const [editedTask, setEditedTask] = useState({ ...task });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sprintInfo, setSprintInfo] = useState(null);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [error, setError] = useState(null);

  // Determine if the task is in "done" status (column 3)
  const isDone = task.idColumna === 3;

  var task = {
  }

  useEffect(() => {
    // Initialize editedTask with default start date from sprint
    if (task?.idSprint && sprints?.length > 0) {
      const foundSprint = sprints.find(s => Number(s.id) === Number(task.idSprint));
      if (foundSprint) {
        setSprintInfo(foundSprint);
        // Set start and end dates for the date picker
        if (foundSprint.fechaInicio && foundSprint.fechaFin) {
          const startDate = new Date(foundSprint.fechaInicio);
          const endDate = new Date(foundSprint.fechaFin);
          setMinDate(startDate.toISOString().split('T')[0]);
          setMaxDate(endDate.toISOString().split('T')[0]);

          // Ensure due date is within sprint range
          const currentDueDate = new Date(task.fechaVencimiento);
          if (currentDueDate < startDate || currentDueDate > endDate) {
            const correctedDate = currentDueDate < startDate ? startDate : endDate;
            setEditedTask(prev => ({
              ...prev,
              fechaVencimiento: correctedDate.toISOString(),
              fechaInicio: startDate.toISOString() // Set default start date
            }));
          } else {
            setEditedTask(prev => ({
              ...prev,
              fechaInicio: startDate.toISOString() // Set default start date
            }));
          }
        }
      }
    }
  }, [task, sprints]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHoursChange = (e) => {
    const { value } = e.target;
    // Validate positive integer
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setEditedTask(prev => ({
        ...prev,
        tiempoEstimado: value === '' ? '' : parseInt(value)
      }));
    }
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    const date = new Date(value);
    const timezoneOffset = -360; // -6 hours in minutes
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset() + timezoneOffset);
    const isoStringWithOffset = date.toISOString().replace('Z', '-06:00');

    setEditedTask(prev => ({
      ...prev,
      fechaVencimiento: isoStringWithOffset
    }));
  };

  const handlePriorityChange = (priority) => {
    setEditedTask(prev => ({
      ...prev,
      prioridad: Number(priority),
      type: priority === 1 ? "Low" : priority === 2 ? "Medium" : "High"
    }));
  };

  const handleSprintChange = (e) => {
    const sprintId = Number(e.target.value);
    const selectedSprint = sprints.find(s => Number(s.id) === sprintId);
    setEditedTask(prev => ({
      ...prev,
      idSprint: sprintId
    }));

    if (selectedSprint) {
      const startDate = new Date(selectedSprint.fechaInicio);
      const endDate = new Date(selectedSprint.fechaFin);
      setMinDate(startDate.toISOString().split('T')[0]);
      setMaxDate(endDate.toISOString().split('T')[0]);
      setSprintInfo(selectedSprint);

      // Adjust due date and start date if necessary
      const currentDueDate = new Date(editedTask.fechaVencimiento);
      const correctedDueDate = currentDueDate < startDate ? startDate : (currentDueDate > endDate ? endDate : currentDueDate);
      setEditedTask(prev => ({
        ...prev,
        fechaInicio: startDate.toISOString(),
        fechaVencimiento: correctedDueDate.toISOString()
      }));
    }
  };

  const handleDeveloperChange = (e) => {
    setEditedTask(prev => ({
      ...prev,
      idEncargado: Number(e.target.value) || null
    }));
  };

  const handleDeleteTask = async (e) => {
      e.preventDefault();
      setError(null);
      setIsDeleting(true);

      try {
        await onDelete(editedTask);
        onClose();
      } catch (err) {
        console.error("Error deleting task:", err);
        setError(err.message || "Error deleting Task, try again.");
      } finally {
        setIsDeleting(false);
      }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // Validate sprint
      if (editedTask.idSprint) {
        const selectedSprint = sprints.find(s => Number(s.id) === Number(editedTask.idSprint));
        if (selectedSprint) {
          const dueDate = new Date(editedTask.fechaVencimiento);
          const startDate = new Date(selectedSprint.fechaInicio);
          const endDate = new Date(selectedSprint.fechaFin);

          if (dueDate < startDate || dueDate > endDate) {
            throw new Error(`La fecha debe estar entre ${startDate.toLocaleDateString()} y ${endDate.toLocaleDateString()}`);
          }
        }
      }

      // Validate estimated hours
      const horasEstimadas = parseInt(editedTask.tiempoEstimado);
      if (isNaN(horasEstimadas) || horasEstimadas < 0) {
        throw new Error("El tiempo estimado debe ser un número entero positivo");
      }

      // Validate developer assignment
      if (!editedTask.idEncargado) {
        throw new Error("Debe asignar un desarrollador a la tarea");
      }

      await onSave(editedTask);
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
      setError(err.message || "Error al guardar los cambios. Verifica los datos e intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Not Accepted Task Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-900 text-red-100 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                name="title"
                value={editedTask.title}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                value={editedTask.description}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editedTask.fechaInicio ? new Date(editedTask.fechaInicio).toISOString().split('T')[0] : ''}
                  readOnly
                  className="w-full bg-[#333] border border-gray-600 rounded px-3 py-2 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={editedTask.fechaVencimiento ? new Date(editedTask.fechaVencimiento).toISOString().split('T')[0] : ''}
                  onChange={handleDateChange}
                  min={minDate}
                  max={maxDate}
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                  required
                />
                {sprintInfo && (
                  <p className="text-xs text-gray-400 mt-1">
                    Sprint: {sprintInfo.nombre} ({minDate} a {maxDate})
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Time (hours)</label>
                <input
                  type="number"
                  name="tiempoEstimado"
                  value={editedTask.tiempoEstimado || ''}
                  onChange={handleHoursChange}
                  min="0"
                  step="1"
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Story Points</label>
                <input
                  type="number"
                  name="storyPoints"
                  value={editedTask.storyPoints || ''}
                  onChange={handleHoursChange}
                  min="0"
                  step="1"
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePriorityChange(1)}
                  className={`px-3 py-1 rounded-full text-xs ${editedTask.prioridad === 1 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => handlePriorityChange(2)}
                  className={`px-3 py-1 rounded-full text-xs ${editedTask.prioridad === 2 ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => handlePriorityChange(3)}
                  className={`px-3 py-1 rounded-full text-xs ${editedTask.prioridad === 3 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  High
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sprint</label>
              <select
                name="idSprint"
                value={editedTask.idSprint || ''}
                onChange={handleSprintChange}
                className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                required
              >
                <option value="">Select Sprint</option>
                {sprints
                  .filter(sprint => sprint.completado === false)
                  .map(sprint => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.nombre || `Sprint ${sprint.id}`}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Developer</label>
              <select
                name="idEncargado"
                value={editedTask.idEncargado || ''}
                onChange={handleDeveloperChange}
                className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                readOnly
                required
              >
                <option value="">Select Developer</option>
                {integrantes.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nombre}
                  </option>
                ))}
              </select>
            </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleDeleteTask}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                 {isDeleting ? 'Deleting ...' : 'Delete Task'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Saving ...' : 'Accept Task'}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskManagerModal;
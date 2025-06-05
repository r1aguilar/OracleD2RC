import React, { useState, useEffect } from "react";

const CreateTaskManagerModal = ({ sprint, idProy, sprints, integrantes, onClose, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [sprintInfo, setSprintInfo] = useState(null);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [error, setError] = useState(null);

  var task = {
    idEncargado: null,
    idProyecto: sprints[0]?.idProyecto || idProy,
    idColumna: 1,
    idSprint: sprint,
    nombre: null,
    descripcion: null,
    prioridad: 1,
    fechaInicio: null,
    fechaVencimiento: null,
    storyPoints: null,
    tiempoReal: null,
    tiempoEstimado: null,
    aceptada: 1,
  }

  const [editedTask, setEditedTask] = useState({ ...task });

  const toUTC6EndOfDay = (dateString) => {
    const date = new Date(`${dateString}T23:59:59`);
    const utc6OffsetMinutes = -6 * 60;
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset() + utc6OffsetMinutes);
    return date.toISOString().replace('Z', '-06:00');
  };

  useEffect(() => {
    if (!sprint || !sprints?.length) return;

    console.log("Checking for " + sprint)
    const foundSprint = sprints.find(s => Number(s.id) === Number(sprint));
    if (!foundSprint) return;

    setSprintInfo(foundSprint);

    if (foundSprint.fechaInicio && foundSprint.fechaFin) {
      const startDate = new Date(foundSprint.fechaInicio);
      const endDate = new Date(foundSprint.fechaFin);
      setMinDate(startDate.toISOString().split('T')[0]);
      setMaxDate(endDate.toISOString().split('T')[0]);

      setEditedTask(prev => {
        const dueDate = new Date(prev.fechaVencimiento || endDate.toISOString());

        const correctedDate =
          dueDate < startDate ? startDate :
          dueDate > endDate ? endDate :
          dueDate;

        return {
          ...prev,
          fechaInicio: startDate.toISOString(),
          fechaVencimiento: correctedDate.toISOString()
        };
      });
    }
  }, [sprint, sprints]);

  useEffect(() => {
    console.log("Edited Task updated:", editedTask);
  }, [editedTask]);

  const formatToOffsetDateTime = (dateString) => {
    return `${dateString}T00:00:00-06:00`;
  };

  const formatToOffsetDateTimeEnd = (dateString) => {
    return `${dateString}T23:59:59-06:00`;
  };

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
    setEditedTask(prev => ({
      ...prev,
      fechaVencimiento: formatToOffsetDateTimeEnd(value)
    }));
  };

  const handlePriorityChange = (priority) => {
    setEditedTask(prev => ({
      ...prev,
      prioridad: Number(priority),
      type: priority === 1 ? "Low" : priority === 2 ? "Medium" : "High"
    }));
  };

  const handleDeveloperChange = (e) => {
    setEditedTask(prev => ({
      ...prev,
      idEncargado: Number(e.target.value) || null
    }));
  };

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
          <h2 className="text-xl font-semibold text-white">Create Task</h2>
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
                name="nombre"
                value={editedTask.nombre}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                name="descripcion"
                value={editedTask.descripcion}
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
                  disabled={!editedTask.idSprint}
                  className={`w-full border rounded px-3 py-2 cursor-not-allowed bg-[#333] text-gray-400 border-gray-600`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={editedTask.fechaVencimiento ? new Date(editedTask.fechaVencimiento).toISOString().split('T')[0] : ''}
                  onChange={editedTask.idSprint ? handleDateChange : undefined}
                  min={editedTask.fechaInicio ? new Date(editedTask.fechaInicio).toISOString().split('T')[0] : minDate}
                  max={maxDate}
                  disabled={!editedTask.idSprint}
                  className={`w-full border rounded px-3 py-2 ${
                    editedTask.idSprint
                      ? 'bg-[#1a1a1a] text-white border-gray-600'
                      : 'bg-[#333] text-gray-400 cursor-not-allowed border-gray-600'
                  }`}
                  required={!!editedTask.idSprint}
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
                  onChange={handleChange}
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
              <input
                type="text"
                name="idSprint"
                value={
                  (() => {
                    const sprintObj = sprints.find(s => Number(s.id) === Number(editedTask.idSprint));
                    return sprintObj ? sprintObj.nombre : "Backlog";
                  })()
                }
                disabled
                readOnly
                className="w-full bg-[#333] border text-gray-400 cursor-not-allowed rounded px-3 py-2 border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Developer</label>
              <select
                name="idEncargado"
                value={editedTask.idEncargado || ''}
                onChange={handleDeveloperChange}
                className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
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
                {isSaving ? 'Saving ...' : 'Create Task'}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskManagerModal;
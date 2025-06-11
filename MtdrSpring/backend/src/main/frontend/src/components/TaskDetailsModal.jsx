import React, { useState, useEffect } from "react";

const TaskDetailsModal = ({ task, sprints, onClose, onSave, onDelete }) => {
  const [editedTask, setEditedTask] = useState({ ...task });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sprintInfo, setSprintInfo] = useState(null);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [error, setError] = useState(null);

  // Determinar si la tarea está en estado "done" (columna 3)
  const isDone = task.idColumna === 3;

  useEffect(() => {
    console.log(editedTask);
    if (task?.idSprint && sprints?.length > 0) {
      const foundSprint = sprints.find(s => Number(s.id) === Number(task.idSprint));
      if (foundSprint) {
        setSprintInfo(foundSprint);
        
        if (foundSprint.fechaInicio && foundSprint.fechaFin) {
          // Convertir a formato YYYY-MM-DD para los inputs de fecha
          const startDate = new Date(foundSprint.fechaInicio);
          const endDate = new Date(foundSprint.fechaFin);
          
          setMinDate(foundSprint.fechaInicio.split('T')[0]);
          setMaxDate(foundSprint.fechaFin.split('T')[0]);
          
          // Validar fecha actual
          const currentDueDate = new Date(task.fechaVencimiento);
          if (currentDueDate < startDate || currentDueDate > endDate) {
            const correctedDate = currentDueDate < startDate ? startDate : endDate;
            setEditedTask(prev => ({
              ...prev,
              fechaVencimiento: `${correctedDate}T23:59:59-06:00`
            }));
          }
        }
      }
    }
  }, [task, sprints]);

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
    // Validar que sea un número entero positivo
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setEditedTask(prev => ({
        ...prev,
        tiempoReal: value === '' ? '' : parseInt(value)
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
      prioridad: Number(priority), // Asegurar que sea número
      type: priority === 1 ? "Low" : priority === 2 ? "Medium" : "High"
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
      // Validación adicional de fecha
      if (sprintInfo) {
        const dueDate = new Date(editedTask.fechaVencimiento);
        const startDate = new Date(sprintInfo.fechaInicio);
        const endDate = new Date(sprintInfo.fechaFin);
        
        if (dueDate < startDate || dueDate > endDate) {
          throw new Error(`La fecha debe estar entre ${startDate.toLocaleDateString()} y ${endDate.toLocaleDateString()}`);
        }
      }

      // Validación de horas reales si está en done
      if (isDone) {
        const horasReales = parseInt(editedTask.tiempoReal);
        if (isNaN(horasReales) || horasReales < 0) {
          throw new Error("Las horas reales deben ser un número entero positivo");
        }
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
          <h2 className="text-xl font-semibold text-white">Task Details</h2>
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
                disabled={isDone}
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
                disabled={isDone}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={task.fechaInicio ? task.fechaInicio.split('T')[0] : ''}
                  readOnly
                  className="w-full bg-[#333] border border-gray-600 rounded px-3 py-2 text-gray-400 cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={task.fechaVencimiento ? task.fechaVencimiento.split('T')[0] : ''}
                  readOnly
                  className="w-full bg-[#333] border border-gray-600 rounded px-3 py-2 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Time (hours)</label>
                <input
                  type="number"
                  value={task.tiempoEstimado || 'N/A'}
                  readOnly
                  className="w-full bg-[#333] border border-gray-600 rounded px-3 py-2 text-gray-400 cursor-not-allowed"
                  disabled={isDone}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Real Hours {!isDone && '(Just for completed tasks)'}
                </label>
                <input
                  type="number"
                  name="tiempoReal"
                  value={editedTask.tiempoReal || ''}
                  onChange={handleHoursChange}
                  min="0"
                  step="1"
                  className={`w-full border rounded px-3 py-2 ${
                    isDone 
                      ? 'bg-[#1a1a1a] border-gray-600 text-white' 
                      : 'bg-[#333] border-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  readOnly
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
                  disabled={isDone}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => handlePriorityChange(2)}
                  className={`px-3 py-1 rounded-full text-xs ${editedTask.prioridad === 2 ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                  disabled={isDone}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => handlePriorityChange(3)}
                  className={`px-3 py-1 rounded-full text-xs ${editedTask.prioridad === 3 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  disabled={isDone}
                >
                  High
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleDeleteTask}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting ...' : 'Delete Task'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              disabled={isDone || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
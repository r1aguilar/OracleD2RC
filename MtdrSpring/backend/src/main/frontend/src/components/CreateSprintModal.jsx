import React, { useState, useEffect } from "react";

const CreateSprintModal = ({ sprints, onClose, onSave }) => {
  const lastSprint = sprints[sprints.length - 1];
  const [newSprint, setNewSprint] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [minStartDate, setMinStartDate] = useState("");
  const [minEndDate, setMinEndDate] = useState("");
  const [maxEndDate, setMaxEndDate] = useState("");

  // Update minStartDate based on last sprint
  useEffect(() => {
    if (lastSprint?.fechaFin) {
      const lastStart = new Date(lastSprint.fechaFin);
      lastStart.setDate(lastStart.getDate() + 1);
      setMinStartDate(lastStart.toISOString().split("T")[0]);
    }
  }, [sprints]);

  // Update minEndDate whenever fechaInicio changes
  useEffect(() => {
    if (newSprint.fechaInicio) {
      const startDate = new Date(newSprint.fechaInicio);
      
      // minEndDate = fechaInicio
      setMinEndDate(startDate.toISOString().split("T")[0]);

      // maxEndDate = fechaInicio + 14 days
      const maxDate = new Date(startDate);
      maxDate.setDate(maxDate.getDate() + 14);
      setMaxEndDate(maxDate.toISOString().split("T")[0]);
    } else {
      setMinEndDate("");
      setMaxEndDate("");
    }
  }, [newSprint.fechaInicio]);

  const formatToOffsetDateTime = (dateString) => {
    return `${dateString}T00:00:00-06:00`;
  };

  const formatToOffsetDateTimeEnd = (dateString) => {
    return `${dateString}T23:59:59-06:00`;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSprint(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const start = new Date(newSprint.fechaInicio);
      const end = new Date(newSprint.fechaFin);

      /* if (start >= end) {
        throw new Error("La fecha de fin debe ser al menos 7 días después de la fecha de inicio.");
      } */

      const payload = {
        ...newSprint,
        fechaInicio: formatToOffsetDateTime(newSprint.fechaInicio),
        fechaFin: formatToOffsetDateTimeEnd(newSprint.fechaFin),
        completado: false,
        deleted: false,
        idProyecto: lastSprint?.idProyecto || null
      };

      console.log("Sending sprint: ", payload)

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("Error saving sprint:", err);
      setError(err.message || "Error al guardar. Verifica los datos e intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Detalles del Sprint</h2>
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={newSprint.nombre}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={newSprint.descripcion}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={newSprint.fechaInicio}
                  min={minStartDate}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  name="fechaFin"
                  value={newSprint.fechaFin}
                  min={minEndDate}
                  max={maxEndDate}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>
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
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSprintModal;

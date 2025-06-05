import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onCreate, isLoading }) => {
  const [projectData, setProjectData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectData.nombre.trim()) {
      setError('El nombre del proyecto es requerido');
      return;
    }

    try {
      await onCreate(projectData);
    } catch (err) {
      // El error ya se maneja en ProfileManager
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2b2b2b] rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Crear Nuevo Proyecto</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                name="nombre"
                value={projectData.nombre}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg bg-[#1a1a1a] text-white"
                placeholder="Nombre del proyecto"
                disabled={isLoading}
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={projectData.descripcion}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg bg-[#1a1a1a] text-white min-h-[100px]"
                placeholder="Descripción del proyecto"
                disabled={isLoading}
                maxLength={500}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin">↻</span>
              ) : (
                <Save size={18} />
              )}
              {isLoading ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
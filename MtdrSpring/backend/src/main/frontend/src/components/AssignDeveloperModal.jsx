import React from 'react';
import { X, Plus } from 'lucide-react';

const AssignDeveloperModal = ({ isOpen, onClose, developers, onAssign, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2b2b2b] rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Asignar Desarrollador</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {developers.length > 0 ? (
            developers.map((dev) => (
              <div key={dev.id} className="bg-[#1a1a1a] p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-semibold">{dev.nombre}</div>
                  <div className="text-sm text-gray-400">
                    {dev.correo || 'Sin email'} | {dev.telefono || 'Sin teléfono'}
                  </div>
                </div>
                <button
                  onClick={() => onAssign(dev.id)}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full text-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <Plus size={14} />
                  {isLoading ? 'Asignando...' : 'Asignar'}
                </button>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-4">No hay desarrolladores disponibles</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignDeveloperModal;
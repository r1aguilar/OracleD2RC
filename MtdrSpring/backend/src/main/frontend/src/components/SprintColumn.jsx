import React from "react";
import { useDroppable } from "@dnd-kit/core";

const SprintColumn = ({ sprint, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: sprint.id
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-[#2a2a2a] rounded p-4 transition-all duration-300 ease-in-out ${
        isOver ? "border-red-500" : "border-neutral-700"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg text-white">{sprint.nombre}</h2>
        <div className="flex gap-6 text-sm text-white">
          <span>Start: {sprint.fechaInicio.substring(0, 10)}</span>
          <span>End: {sprint.fechaFin.substring(0, 10)}</span>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap items-center">
        {children}
      </div>
    </div>
  );
};

export default SprintColumn;

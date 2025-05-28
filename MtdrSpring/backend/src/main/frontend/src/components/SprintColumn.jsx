import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import CreateTaskDeveloperModal from "./CreateTaskDeveloperModal";

const SprintColumn = ({
  sprint,
  children,
  activeTaskId,
  isLastSprint,
  onStatusChange,
  isDisabled,
  isChangingStatus
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: sprint.id,
    disabled: isDisabled,
  });

  const handleStatusChange = (e) => {
    const newStatus = e.target.value === "1" ? true : false;
    onStatusChange?.(sprint.id, newStatus);
  };

  const enhancedChildren = React.Children.map(children, (child) =>
    React.cloneElement(child, {
      isOver,
      activeTaskId,
    })
  );

  return (
    <div
      ref={setNodeRef}
      className={`bg-[#2a2a2a] rounded p-4 border transition-all duration-300 ease-in-out ${
        isOver && activeTaskId ? "border-red-500" : "border-neutral-700"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg text-white">{sprint.nombre}</h2>
        <div className="flex gap-6 text-sm text-white items-center">
          <span>Start: {sprint.fechaInicio?.substring(0, 10)}</span>
          <span>End: {sprint.fechaFin?.substring(0, 10)}</span>
          <span>
            Status:{" "}
            {isLastSprint && sprint.completado === false ? (
              <select
                className="bg-[#1a1a1a] border border-neutral-600 px-2 py-1 rounded text-white text-sm"
                value={sprint.completado}
                onChange={handleStatusChange}
                disabled={isChangingStatus}
              >
                <option value="">In Progress</option>
                <option value="1">Completed</option>
              </select>
            ) : sprint.completado === false ? "In Progress" : "Completed"}
          </span>
          {!sprint.completado && (
            <button
              onClick={() => console.log("TODO: open task modal")}
              className="flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-full border border-neutral-600"
            >
              <Plus size={12} /> Create new task
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-3 flex-wrap items-center">{enhancedChildren}</div>
    </div>
  );
};


export default SprintColumn;

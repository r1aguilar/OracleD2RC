import { useDraggable } from "@dnd-kit/core";
import { Lock } from "lucide-react";

const TaskChip = ({ task, isOver, activeTaskId }) => {
  const isAccepted = task.aceptada !== 0;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: !isAccepted, // correct: disable dragging if not accepted
  });

  const shouldDim = isOver && activeTaskId === task.id;

  const baseClass = isAccepted
    ? "bg-[#1a1a1a] text-white rounded-full px-4 py-1 text-sm shadow border border-neutral-700 transition-opacity"
    : "bg-[#333] text-gray-400 rounded-full px-4 py-1 text-sm shadow border border-gray-600 transition-opacity";

  return (
    <div
      ref={setNodeRef}
      {...(isAccepted ? attributes : {})}
      {...(isAccepted ? listeners : {})}
      className={`${baseClass} ${isDragging || shouldDim ? "opacity-50" : "opacity-100"} flex items-center gap-2`}
      style={{ whiteSpace: "nowrap" }}
    >
      <span>{task.title}</span>
      {!isAccepted && <Lock size={16} />}
    </div>
  );
};

export default TaskChip;

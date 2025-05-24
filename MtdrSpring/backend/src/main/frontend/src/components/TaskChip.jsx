import { useDraggable } from "@dnd-kit/core";

const TaskChip = ({ task, isOver, activeTaskId }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const shouldDim = isOver && activeTaskId === task.id;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`bg-[#1a1a1a] text-white rounded-full px-4 py-1 text-sm shadow border border-neutral-700 transition-opacity ${
        isDragging || shouldDim ? "opacity-50" : "opacity-100"
      }`}
      style={{ whiteSpace: "nowrap" }}
    >
      {task.title}
    </div>
  );
};


export default TaskChip;


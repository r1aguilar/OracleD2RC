import { useDraggable } from "@dnd-kit/core";

const TaskChip = ({ task }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task }
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      // When dragging, hide the original element so only the DragOverlay is visible.
      className={`bg-[#1a1a1a] text-white rounded-full px-4 py-1 text-sm shadow border border-neutral-700 transition-colors ${
        isDragging ? "opacity-0" : "opacity-100"
      }`}
      style={{ whiteSpace: "nowrap" }}
    >
      {task.title}
    </div>
  );
};

export default TaskChip;

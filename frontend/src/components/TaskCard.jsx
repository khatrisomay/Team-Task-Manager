import { CalendarDays, Trash2, UserRound } from "lucide-react";

const priorityStyles = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-red-50 text-red-700 border-red-200"
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
};

const TaskCard = ({ task, canChangeStatus, onStatusChange, onDelete, draggable = false, onDragStart }) => {
  const overdue = task.status !== "Done" && new Date(task.deadline) < new Date();

  return (
    <article
      className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-soft"
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold leading-snug">{task.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description || "No description"}</p>
        </div>
        {onDelete && (
          <button className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-md border px-2 py-1 font-medium ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
        {overdue && <span className="rounded-md bg-red-100 px-2 py-1 font-medium text-red-700">Overdue</span>}
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          <span>{task.assignedTo?.name || "Unassigned"}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>{formatDate(task.deadline)}</span>
        </div>
      </div>

      {canChangeStatus && (
        <select className="input mt-4" value={task.status} onChange={(event) => onStatusChange(task._id, event.target.value)}>
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
      )}
    </article>
  );
};

export default TaskCard;

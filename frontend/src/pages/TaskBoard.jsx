import { ArrowLeft, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/axios";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import TaskCard from "../components/TaskCard";
import { useAuth } from "../context/AuthContext";

const statuses = ["Todo", "In Progress", "Done"];
const initialTaskForm = {
  title: "",
  description: "",
  deadline: "",
  priority: "Medium",
  assignedTo: ""
};

const TaskBoard = () => {
  const { projectId } = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [filters, setFilters] = useState({ search: "", priority: "", status: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const groupedTasks = useMemo(() => {
    return statuses.reduce((groups, status) => {
      groups[status] = tasks.filter((task) => task.status === status);
      return groups;
    }, {});
  }, [tasks]);

  const fetchBoard = async () => {
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams({ projectId });
      if (filters.search) {
        params.set("search", filters.search);
      }
      if (filters.priority) {
        params.set("priority", filters.priority);
      }
      if (filters.status) {
        params.set("status", filters.status);
      }

      const [projectRes, taskRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks?${params.toString()}`)
      ]);

      setProject(projectRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load task board");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [projectId]);

  const createTask = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError("");

    try {
      const { data } = await api.post("/tasks", {
        ...taskForm,
        projectId
      });
      setTasks((current) => [data.task, ...current]);
      setTaskForm(initialTaskForm);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create task");
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (taskId, status) => {
    const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
    setTasks((current) => current.map((task) => (task._id === taskId ? data.task : task)));
  };

  const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    setTasks((current) => current.filter((task) => task._id !== taskId));
  };

  const onDropStatus = async (event, status) => {
    const taskId = event.dataTransfer.getData("taskId");
    const task = tasks.find((item) => item._id === taskId);

    if (task && task.status !== status) {
      await updateStatus(taskId, status);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900" to="/projects">
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
          <h1 className="text-2xl font-bold">{project?.name || "Task Board"}</h1>
          <p className="mt-1 text-sm text-slate-500">{project?.description || "Manage tasks by status."}</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search tasks"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
          </div>
          <select className="input" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
            <option value="">All priorities</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <select className="input" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">All statuses</option>
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <button className="btn btn-secondary" onClick={fetchBoard}>
            Apply
          </button>
        </div>
      </section>

      {isAdmin && (
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            Assign Task
          </h2>
          <form className="grid gap-4 xl:grid-cols-6" onSubmit={createTask}>
            <input
              className="input xl:col-span-2"
              placeholder="Title"
              value={taskForm.title}
              onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
              required
            />
            <input
              className="input xl:col-span-2"
              placeholder="Description"
              value={taskForm.description}
              onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
            />
            <input
              className="input"
              type="date"
              value={taskForm.deadline}
              onChange={(event) => setTaskForm({ ...taskForm, deadline: event.target.value })}
              required
            />
            <select className="input" value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <select
              className="input xl:col-span-2"
              value={taskForm.assignedTo}
              onChange={(event) => setTaskForm({ ...taskForm, assignedTo: event.target.value })}
              required
            >
              <option value="">Assign to member</option>
              {project?.members?.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
            <button className="btn btn-primary xl:col-span-4" disabled={creating}>
              {creating ? "Assigning..." : "Create Task"}
            </button>
          </form>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-3">
        {statuses.map((status) => (
          <div
            key={status}
            className="min-h-96 rounded-md border border-slate-200 bg-slate-100/60 p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onDropStatus(event, status)}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{status}</h2>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500">
                {groupedTasks[status]?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {(groupedTasks[status] || []).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  canChangeStatus
                  onStatusChange={updateStatus}
                  onDelete={isAdmin ? () => deleteTask(task._id) : undefined}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("taskId", task._id)}
                />
              ))}
              {!groupedTasks[status]?.length && (
                <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default TaskBoard;

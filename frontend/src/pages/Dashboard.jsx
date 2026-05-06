import { CheckCircle2, Clock3, ListTodo, TimerOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";

const statuses = ["Todo", "In Progress", "Done"];

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get("/dashboard");
      setDashboard(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const updateStatus = async (taskId, status) => {
    const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
    setDashboard((current) => {
      const allTasks = statuses.flatMap((key) => current.groupedTasks[key] || []);
      const updatedTasks = allTasks.map((task) => (task._id === taskId ? data.task : task));

      return {
        ...current,
        summary: {
          ...current.summary,
          completedTasks: updatedTasks.filter((task) => task.status === "Done").length,
          pendingTasks: updatedTasks.filter((task) => task.status !== "Done").length,
          overdueTasks: updatedTasks.filter((task) => task.status !== "Done" && new Date(task.deadline) < new Date()).length
        },
        groupedTasks: statuses.reduce((groups, key) => {
          groups[key] = updatedTasks.filter((task) => task.status === key);
          return groups;
        }, {})
      };
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Track workload, progress, and overdue tasks.</p>
        </div>
        <Link className="btn btn-secondary" to="/projects">
          View Projects
        </Link>
      </div>

      <ErrorMessage message={error} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tasks" value={dashboard?.summary?.totalTasks} icon={ListTodo} />
        <StatCard label="Completed" value={dashboard?.summary?.completedTasks} icon={CheckCircle2} tone="green" />
        <StatCard label="Pending" value={dashboard?.summary?.pendingTasks} icon={Clock3} tone="amber" />
        <StatCard label="Overdue" value={dashboard?.summary?.overdueTasks} icon={TimerOff} tone="red" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {statuses.map((status) => (
          <div key={status} className="rounded-md border border-slate-200 bg-slate-100/60 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{status}</h2>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500">
                {dashboard?.groupedTasks?.[status]?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {(dashboard?.groupedTasks?.[status] || []).map((task) => (
                <TaskCard key={task._id} task={task} canChangeStatus onStatusChange={updateStatus} />
              ))}
              {!dashboard?.groupedTasks?.[status]?.length && (
                <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  No tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;

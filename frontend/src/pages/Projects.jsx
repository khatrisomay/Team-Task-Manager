import { Plus, Trash2, UserPlus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", members: [] });
  const [memberPicker, setMemberPicker] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedMembers = useMemo(
    () => members.filter((member) => form.members.includes(member._id)),
    [members, form.members]
  );

  const fetchData = async () => {
    setError("");
    try {
      const [projectRes, memberRes] = await Promise.all([
        api.get("/projects"),
        isAdmin ? api.get("/users?role=Member") : Promise.resolve({ data: { users: [] } })
      ]);

      setProjects(projectRes.data.projects);
      setMembers(memberRes.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createProject = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { data } = await api.post("/projects", form);
      setProjects((current) => [data.project, ...current]);
      setForm({ name: "", description: "", members: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const addMember = async (projectId) => {
    const userId = memberPicker[projectId];
    if (!userId) {
      return;
    }

    const { data } = await api.post(`/projects/${projectId}/members`, { userId });
    setProjects((current) => current.map((project) => (project._id === projectId ? data.project : project)));
    setMemberPicker((current) => ({ ...current, [projectId]: "" }));
  };

  const removeMember = async (projectId, memberId) => {
    const { data } = await api.delete(`/projects/${projectId}/members/${memberId}`);
    setProjects((current) => current.map((project) => (project._id === projectId ? data.project : project)));
  };

  const deleteProject = async (projectId) => {
    await api.delete(`/projects/${projectId}`);
    setProjects((current) => current.filter((project) => project._id !== projectId));
  };

  const toggleFormMember = (memberId) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(memberId)
        ? current.members.filter((id) => id !== memberId)
        : [...current.members, memberId]
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isAdmin ? "Create projects and manage team members." : "Projects where you are assigned as a member."}
        </p>
      </div>

      <ErrorMessage message={error} />

      {isAdmin && (
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            New Project
          </h2>
          <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]" onSubmit={createProject}>
            <div>
              <label className="label" htmlFor="project-name">
                Name
              </label>
              <input
                className="input mt-1"
                id="project-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="project-description">
                Description
              </label>
              <input
                className="input mt-1"
                id="project-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            <button className="btn btn-primary self-end" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </button>
          </form>

          <div className="mt-4">
            <p className="label mb-2">Initial members</p>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <button
                  key={member._id}
                  type="button"
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    form.members.includes(member._id)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                  onClick={() => toggleFormMember(member._id)}
                >
                  {member.name}
                </button>
              ))}
              {!members.length && <span className="text-sm text-slate-500">No member accounts yet</span>}
            </div>
            {!!selectedMembers.length && (
              <p className="mt-2 text-xs text-slate-500">
                Selected: {selectedMembers.map((member) => member.name).join(", ")}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <article key={project._id} className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">{project.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{project.description || "No description"}</p>
              </div>
              {isAdmin && (
                <button className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => deleteProject(project._id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <UsersRound className="h-4 w-4" />
                Members
              </div>
              <div className="flex flex-wrap gap-2">
                {project.members.map((member) => (
                  <span key={member._id} className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-sm">
                    {member.name}
                    {isAdmin && (
                      <button className="text-slate-400 hover:text-red-600" onClick={() => removeMember(project._id, member._id)}>
                        x
                      </button>
                    )}
                  </span>
                ))}
                {!project.members.length && <span className="text-sm text-slate-500">No members added</span>}
              </div>
            </div>

            {isAdmin && (
              <div className="mt-4 flex gap-2">
                <select
                  className="input"
                  value={memberPicker[project._id] || ""}
                  onChange={(event) => setMemberPicker({ ...memberPicker, [project._id]: event.target.value })}
                >
                  <option value="">Select member</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
                <button className="btn btn-secondary" onClick={() => addMember(project._id)}>
                  <UserPlus className="h-4 w-4" />
                  Add
                </button>
              </div>
            )}

            <Link className="btn btn-primary mt-5" to={`/projects/${project._id}/tasks`}>
              Open Task Board
            </Link>
          </article>
        ))}
      </section>

      {!projects.length && (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No projects found
        </div>
      )}
    </div>
  );
};

export default Projects;

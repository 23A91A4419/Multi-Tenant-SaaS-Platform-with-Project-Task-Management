import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ================= FETCH PROJECTS ================= */
  async function fetchProjects() {
    try {
      const res = await api.get("/projects");
      const projectsData = res.data?.data?.projects || [];

      const withCounts = await Promise.all(
        projectsData.map(async (p) => {
          try {
            const t = await api.get(`/projects/${p.id}/tasks`);
            return { ...p, taskCount: t.data.data.tasks.length };
          } catch {
            return { ...p, taskCount: 0 };
          }
        })
      );

      setProjects(withCounts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* ================= MODAL ================= */
  function openCreate() {
    setEditProject(null);
    setForm({ name: "", description: "", status: "active" });
    setShowModal(true);
  }

  function openEdit(project) {
    setEditProject(project);
    setForm({
      name: project.name,
      description: project.description || "",
      status: project.status,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditProject(null);
  }

  /* ================= CREATE PROJECT ================= */
  async function createProject() {
    try {
      await api.post("/projects", {
        name: form.name,
        description: form.description,
        status: form.status.toLowerCase(),
      });

      fetchProjects();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Create failed");
    }
  }

  /* ================= UPDATE PROJECT ================= */
  async function updateProject() {
    try {
      await api.put(`/projects/${editProject.id}`, {
        name: form.name,
        description: form.description,
        status: form.status.toLowerCase(),
      });

      fetchProjects();
      closeModal();
    } catch {
      alert("Update failed");
    }
  }

  /* ================= DELETE PROJECT ================= */
  async function deleteProject(id) {
    if (!window.confirm("Delete this project?")) return;

    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Delete failed");
    }
  }

  /* ================= FILTER ================= */
  const filteredProjects = projects.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === "all" || p.status === statusFilter;

    return matchSearch && matchStatus;
  });

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Projects</h2>

      {/* SEARCH + FILTER */}
      <div style={{ display: "flex", gap: 15, marginBottom: 15 }}>
        <input
          placeholder="Search by project name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <button onClick={openCreate}>+ Create New Project</button>

      <table width="100%" cellPadding="12">
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="center">Status</th>
            <th align="center">Tasks</th>
            <th align="center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProjects.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td align="center">{p.status}</td>
              <td align="center">{p.taskCount}</td>
              <td align="center">
                <button onClick={() => navigate(`/projects/${p.id}`)}>
                  View
                </button>{" "}
                <button onClick={() => openEdit(p)}>Edit</button>{" "}
                <button
                  style={{ color: "red" }}
                  onClick={() => deleteProject(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {filteredProjects.length === 0 && (
            <tr>
              <td colSpan="4" align="center">
                No projects found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ background: "#1e1e1e", padding: 20, width: 400 }}>
            <h3>{editProject ? "Edit Project" : "Create Project"}</h3>

            <input
              placeholder="Project Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            />

            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            <div style={{ textAlign: "right" }}>
              <button onClick={closeModal}>Cancel</button>{" "}
              <button
                onClick={editProject ? updateProject : createProject}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

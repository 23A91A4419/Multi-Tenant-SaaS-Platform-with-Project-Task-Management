import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  async function fetchProject() {
    const res = await api.get("/projects");
    const found = res.data.data.projects.find(p => p.id === projectId);
    setProject(found || null);
  }

  async function fetchTasks() {
    const res = await api.get(`/projects/${projectId}/tasks`);
    setTasks(res.data.data.tasks || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  async function addTask() {
    if (!title.trim()) return alert("Task title required");

    await api.post(`/projects/${projectId}/tasks`, {
      title,
      priority,
      dueDate: dueDate || null,
    });

    setTitle("");
    setPriority("medium");
    setDueDate("");
    fetchTasks();
  }

  async function updateTask(task, updates) {
    await api.put(`/projects/${projectId}/tasks/${task.id}`, {
      title: task.title,
      priority: updates.priority ?? task.priority,
      status: updates.status ?? task.status,
      dueDate: task.dueDate,
    });

    fetchTasks();
  }

  async function deleteTask(taskId) {
    if (!window.confirm("Delete task?")) return;
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <div style={{ padding: "30px 40px" }}>
      <h2>{project.name}</h2>
      <p><b>Status:</b> {project.status}</p>
      <p><b>Description:</b> {project.description || "-"}</p>

      <hr style={{ margin: "20px 0" }} />

      <h3>Add Task</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <button onClick={addTask}>Add</button>
      </div>

      <h3>Tasks</h3>

      <table className="tasks-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map(t => (
            <tr key={t.id}>
              <td>{t.title}</td>

              <td>
                <select value={t.priority}
                  onChange={e => updateTask(t, { priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </td>

              <td>
                <select value={t.status}
                  onChange={e => updateTask(t, { status: e.target.value })}>
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </td>

              <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}</td>

              <td>
                <button style={{ color: "red" }} onClick={() => deleteTask(t.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />
      <Link to="/projects">← Back to Projects</Link>
    </div>
  );
}
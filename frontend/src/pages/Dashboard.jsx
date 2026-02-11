import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

/* ================= STATUS NORMALIZER ================= */
function normalizeStatus(status) {
  if (!status) return "todo";

  const s = status.toLowerCase();

  if (s === "done") return "completed";
  if (s === "completed") return "completed";
  if (s === "in progress") return "in_progress";
  if (s === "in_progress") return "in_progress";

  return s; // todo
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchMyTasks();
  }, []);

  /* ================= DASHBOARD STATS ================= */
  async function fetchDashboardData() {
    try {
      const projectsRes = await api.get("/projects");
      const projects = projectsRes.data.data.projects || [];

      let totalTasks = 0;
      let completedTasks = 0;

      const projectsWithTaskCount = [];

      for (const project of projects) {
        const taskRes = await api.get(`/projects/${project.id}/tasks`);
        const tasks = taskRes.data.data.tasks || [];

        totalTasks += tasks.length;

        completedTasks += tasks.filter(
          (t) => normalizeStatus(t.status) === "completed"
        ).length;

        projectsWithTaskCount.push({
          ...project,
          taskCount: tasks.length,
        });
      }

      setStats({
        totalProjects: projects.length,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
      });

      const recent = [...projectsWithTaskCount]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentProjects(recent);
    } catch (err) {
      console.error("Dashboard stats error", err);
    }
  }

  /* ================= MY TASKS ================= */
  async function fetchMyTasks() {
    try {
      setLoadingTasks(true);

      const projectsRes = await api.get("/projects");
      const projects = projectsRes.data.data.projects || [];

      let tasks = [];

      for (const project of projects) {
        const taskRes = await api.get(`/projects/${project.id}/tasks`);
        const projectTasks = taskRes.data.data.tasks || [];

        projectTasks.forEach((task) => {
          tasks.push({
            ...task,
            status: normalizeStatus(task.status),
            projectName: project.name,
          });
        });
      }

      setMyTasks(tasks);
    } catch (err) {
      console.error("My tasks error", err);
    } finally {
      setLoadingTasks(false);
    }
  }

  const filteredTasks =
    taskFilter === "all"
      ? myTasks
      : myTasks.filter((t) => t.status === taskFilter);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      {/* ================= STATS ================= */}
      <div className="stats-row">
        <div className="stat-card">
          Projects <br />
          <b>{stats.totalProjects}</b>
        </div>
        <div className="stat-card">
          Tasks <br />
          <b>{stats.totalTasks}</b>
        </div>
        <div className="stat-card">
          Completed <br />
          <b>{stats.completedTasks}</b>
        </div>
        <div className="stat-card">
          Pending <br />
          <b>{stats.pendingTasks}</b>
        </div>
      </div>

      {/* ================= RECENT PROJECTS ================= */}
      <h3>Recent Projects</h3>

      {recentProjects.length === 0 ? (
        <p>No projects yet</p>
      ) : (
        <ul>
          {recentProjects.map((p) => (
            <li key={p.id}>
              <Link
                to={`/projects/${p.id}`}
                style={{ color: "#6ca0ff", textDecoration: "none" }}
              >
                {p.name}
              </Link>{" "}
              — <span className="status-badge">{p.status}</span> •{" "}
              <span style={{ color: "#aaa" }}>{p.taskCount} tasks</span>
            </li>
          ))}
        </ul>
      )}

      {/* ================= MY TASKS ================= */}
      <h3 style={{ marginTop: "30px" }}>My Tasks</h3>

      <select
        value={taskFilter}
        onChange={(e) => setTaskFilter(e.target.value)}
        style={{ marginBottom: "10px" }}
      >
        <option value="all">All</option>
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {loadingTasks ? (
        <p>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.projectName}</td>
                <td>{task.priority || "medium"}</td>
                <td>
                  <span className={`task-status ${task.status}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </td>
                <td>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import api from "../api/api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    loadAllTasks();
  }, []);

  // ================= LOAD ALL TASKS =================
  async function loadAllTasks() {
    try {
      const projectRes = await api.get("/projects");
      const projects = projectRes.data?.data?.projects || [];

      let allTasks = [];

      for (const project of projects) {
        const taskRes = await api.get(`/projects/${project.id}/tasks`);
        const projectTasks = taskRes.data?.data?.tasks || [];

        allTasks.push(
          ...projectTasks.map((task) => ({
            ...task,
            projectId: project.id,
            projectName: project.name,
          }))
        );
      }

      setTasks(allTasks);
    } catch (err) {
      console.error(err);
      alert("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  // ================= UPDATE STATUS =================
  async function updateTaskStatus(task, newStatus) {
    try {
      await api.patch(
        `/projects/${task.projectId}/tasks/${task.id}/status`,
        { status: newStatus }
      );

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: newStatus } : t
        )
      );

      window.dispatchEvent(new Event("dashboard-refresh"));
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  }

  // ================= FILTER =================
  const filteredTasks = tasks.filter((t) => {
    const statusOk =
      statusFilter === "all" || t.status === statusFilter;

    const priorityOk =
      priorityFilter === "all" || t.priority === priorityFilter;

    return statusOk && priorityOk;
  });

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>All Tasks</h2>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed", // ✅ IMPORTANT
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #555" }}>
              <th style={{ padding: 8, textAlign: "left", width: "25%" }}>
                Title
              </th>
              <th style={{ padding: 8, textAlign: "left", width: "25%" }}>
                Project
              </th>
              <th style={{ padding: 8, textAlign: "center", width: "15%" }}>
                Priority
              </th>
              <th style={{ padding: 8, textAlign: "center", width: "20%" }}>
                Status
              </th>
              <th style={{ padding: 8, textAlign: "center", width: "15%" }}>
                Due
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} style={{ borderBottom: "1px solid #333" }}>
                <td
                  style={{
                    padding: 8,
                    textAlign: "left",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.title}
                </td>

                <td style={{ padding: 8, textAlign: "left" }}>
                  {task.projectName}
                </td>

                <td style={{ padding: 8, textAlign: "center" }}>
                  {task.priority}
                </td>

                <td style={{ padding: 8, textAlign: "center" }}>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      updateTaskStatus(task, e.target.value)
                    }
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>

                <td style={{ padding: 8, textAlign: "center" }}>
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
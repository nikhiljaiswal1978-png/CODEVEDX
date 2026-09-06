import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card } from "../components/ui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/analytics/overview")
      .then((r) => {
        console.log("Analytics:", r.data);
        setStats(r.data);
      })
      .catch((err) => {
        console.error("Analytics error:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load analytics"
        );
      });
  }, []);

  if (error) {
    return (
      <div className="analytics-page">
        <h1>Analytics</h1>

        <Card className="analytics-error">
          <h3>Unable to load analytics</h3>
          <p className="muted">{error}</p>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="analytics-page">
        <h1>Analytics</h1>
        <p className="muted">Loading analytics...</p>
      </div>
    );
  }

  const statusData = (stats.byStatus || []).map((s) => ({
    name: s._id || "Unknown",
    value: s.count,
  }));

  const priorityData = (stats.byPriority || []).map((s) => ({
    name: s._id || "Unknown",
    count: s.count,
  }));

  const totalStatusTasks = statusData.reduce(
    (total, item) => total + item.value,
    0
  );

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1>Analytics</h1>
          <p className="muted">
            Monitor task status, priorities and overall project activity.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid cols-4 analytics-summary">
        <Card className="analytics-stat">
          <span className="muted">Total Tasks</span>
          <strong>{totalStatusTasks}</strong>
        </Card>

        <Card className="analytics-stat">
          <span className="muted">Status Groups</span>
          <strong>{statusData.length}</strong>
        </Card>

        <Card className="analytics-stat">
          <span className="muted">Priority Groups</span>
          <strong>{priorityData.length}</strong>
        </Card>

        <Card className="analytics-stat">
          <span className="muted">Tracked Data</span>
          <strong>Live</strong>
        </Card>
      </div>

      <div style={{ height: 20 }} />

      {/* Charts */}
      <div className="grid cols-2 analytics-charts">
        {/* Task Status */}
        <Card className="analytics-chart-card">
          <div className="chart-header">
            <div>
              <h3>Task Status</h3>
              <p className="muted">
                Distribution of tasks by current status
              </p>
            </div>
          </div>

          {statusData.length === 0 ? (
            <div className="chart-empty">
              No task status data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={3}
                  label
                >
                  {statusData.map((_, i) => (
                    <Cell
                      key={`status-${i}`}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#161a23",
                    border: "1px solid #222836",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Priority */}
        <Card className="analytics-chart-card">
          <div className="chart-header">
            <div>
              <h3>Tasks by Priority</h3>
              <p className="muted">
                Number of tasks in each priority level
              </p>
            </div>
          </div>

          {priorityData.length === 0 ? (
            <div className="chart-empty">
              No priority data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={priorityData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  stroke="#222836"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  stroke="#9ca3af"
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#161a23",
                    border: "1px solid #222836",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />

                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  barSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
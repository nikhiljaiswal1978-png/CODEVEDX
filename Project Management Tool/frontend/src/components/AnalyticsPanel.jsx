import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card } from "./ui";
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

export default function AnalyticsPanel({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    api
      .get(`/analytics/project/${projectId}`)
      .then((response) => {
        console.log("Project analytics:", response.data);
        setData(response.data);
      })
      .catch((err) => {
        console.error("Project analytics error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load project analytics."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  if (loading) {
    return (
      <div className="analytics-panel-loading">
        <div className="analytics-panel-spinner"></div>
        <span>Loading project analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="analytics-panel-error">
        <h3>Analytics unavailable</h3>
        <p className="muted">{error}</p>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const status = (data.byStatus || []).map((item) => ({
    name: item._id || "Unknown",
    value: item.count,
  }));

  const workload = (data.byUser || []).map((item) => ({
    name: item._id?.name || "Unassigned",
    count: item.count,
  }));

  const totalTasks = status.reduce(
    (total, item) => total + item.value,
    0
  );

  return (
    <div className="analytics-panel">
      {/* Header */}
      <div className="analytics-panel-header">
        <div>
          <h2>Project Analytics</h2>
          <p className="muted">
            Task distribution and team workload
          </p>
        </div>

        <div className="analytics-panel-total">
          <span className="muted">Total Tasks</span>
          <strong>{totalTasks}</strong>
        </div>
      </div>

      {/* Charts */}
      <div className="analytics-panel-grid">
        {/* Status Breakdown */}
        <Card className="analytics-panel-card">
          <div className="analytics-panel-card-header">
            <div>
              <h3>Status Breakdown</h3>
              <p className="muted">
                Tasks grouped by their current status
              </p>
            </div>
          </div>

          {status.length === 0 ? (
            <div className="analytics-panel-empty">
              No status data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={status}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  label
                >
                  {status.map((_, index) => (
                    <Cell
                      key={`status-${index}`}
                      fill={COLORS[index % COLORS.length]}
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

        {/* Workload */}
        <Card className="analytics-panel-card">
          <div className="analytics-panel-card-header">
            <div>
              <h3>Workload by User</h3>
              <p className="muted">
                Number of tasks assigned to each user
              </p>
            </div>
          </div>

          {workload.length === 0 ? (
            <div className="analytics-panel-empty">
              No workload data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={workload}
                margin={{
                  top: 10,
                  right: 15,
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
                  tick={{ fontSize: 11 }}
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
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
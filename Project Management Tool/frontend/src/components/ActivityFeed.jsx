import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, Badge } from "./ui";
import { formatDistanceToNow } from "date-fns";

const tone = (action) =>
  ({
    created: "ok",
    updated: "info",
    deleted: "danger",
    commented: "brand",
    uploaded: "warn",
    "status-change": "info",
  }[action] || "default");

export default function ActivityFeed({ projectId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    api
      .get(`/activity/project/${projectId}`)
      .then((r) => {
        setLogs(Array.isArray(r.data) ? r.data : []);
      })
      .catch((err) => {
        console.error("Activity feed error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load activity"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  return (
    <Card className="activity-card">
      <div className="activity-header">
        <div>
          <h3>Activity</h3>
          <p className="muted">
            Recent activity for this project
          </p>
        </div>

        {logs.length > 0 && (
          <span className="activity-count">
            {logs.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="activity-empty">
          <div className="activity-loader"></div>
          <span>Loading activity...</span>
        </div>
      ) : error ? (
        <div className="activity-empty activity-error">
          <span>{error}</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="activity-empty">
          <div className="activity-empty-icon">✓</div>
          <strong>No activity yet</strong>
          <span className="muted">
            Project activity will appear here.
          </span>
        </div>
      ) : (
        <div className="activity-list">
          {logs.map((log) => {
            const userName = log.user?.name || "Unknown User";
            const initial =
              userName[0]?.toUpperCase() || "U";

            return (
              <div
                key={log._id}
                className="activity-item"
              >
                <div className="activity-avatar">
                  {initial}
                </div>

                <div className="activity-body">
                  <div className="activity-message">
                    <strong>{userName}</strong>{" "}
                    <span>{log.message}</span>
                  </div>

                  <div className="activity-meta">
                    <Badge tone={tone(log.action)}>
                      {formatAction(log.action)}
                    </Badge>

                    <span className="activity-time">
                      {log.createdAt
                        ? formatDistanceToNow(
                            new Date(log.createdAt),
                            {
                              addSuffix: true,
                            }
                          )
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function formatAction(action) {
  if (!action) return "Activity";

  return action
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}
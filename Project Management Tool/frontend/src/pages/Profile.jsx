import React from "react";
import { User, Mail, Shield, Briefcase } from "lucide-react";
import { Card, Badge } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="card">
        <p className="muted">Loading profile...</p>
      </div>
    );
  }

  const initial = user.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p className="muted">
            View your account information and role.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <Card className="profile-main-card">
          <div className="profile-cover"></div>

          <div className="profile-content">
            <div className="profile-avatar">
              {initial}
            </div>

            <div className="profile-name-section">
              <h2>{user.name || "User"}</h2>

              <Badge tone="brand">
                {user.role || "Employee"}
              </Badge>
            </div>

            <div className="profile-details">
              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <User size={18} />
                </div>

                <div>
                  <span className="profile-label">Full Name</span>
                  <strong>{user.name || "Not available"}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <Mail size={18} />
                </div>

                <div>
                  <span className="profile-label">Email Address</span>
                  <strong>{user.email || "Not available"}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <Shield size={18} />
                </div>

                <div>
                  <span className="profile-label">Account Role</span>
                  <strong>
                    {user.role
                      ? user.role.charAt(0).toUpperCase() +
                        user.role.slice(1)
                      : "Employee"}
                  </strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <Briefcase size={18} />
                </div>

                <div>
                  <span className="profile-label">Account Status</span>
                  <strong className="status-active">
                    Active
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Summary */}
        <Card className="profile-summary-card">
          <h3>Account Summary</h3>

          <div className="summary-item">
            <span>Account</span>
            <strong>Active</strong>
          </div>

          <div className="summary-item">
            <span>Role</span>
            <Badge tone="brand">
              {user.role || "Employee"}
            </Badge>
          </div>

          <div className="summary-item">
            <span>Email</span>
            <strong className="summary-email">
              {user.email}
            </strong>
          </div>
        </Card>
      </div>
    </div>
  );
}
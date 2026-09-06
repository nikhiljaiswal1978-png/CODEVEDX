import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios.js";

const AdminRefunds = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const loadComplaints = async () => {
      const { data } = await api.get("/refunds/admin/all");
      setComplaints(data);
    };

    loadComplaints();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/refunds/admin/${id}`, {
      status,
      adminRemark:
        status === "approved"
          ? "Refund approved"
          : "Refund rejected",
    });

    const { data } = await api.get("/refunds/admin/all");
    setComplaints(data);
  };

  return (
    <div className="page-shell">
          <div className="admin-header">

                <div>
                    <h1>Refund Complaints</h1>
        <div className="admin-nav">
          <Link to="/admin" className="admin-tab">Overview</Link>
          <Link to="/admin/products" className="admin-tab">Products</Link>
          <Link to="/admin/orders" className="admin-tab">Orders</Link>
          <Link to="/admin/users" className="admin-tab ">Users</Link>
          <Link to="/admin/refunds" className="admin-tab active">Refund Complaints</Link>
          </div>
           </div>
            </div>

      <div className="refund-list">

        {complaints.map((complaint) => (
          <div
            className="refund-card"
            key={complaint._id}
          >

            <div>
              <h3>{complaint.productName}</h3>

              <p>
                Customer: {complaint.user?.name}
              </p>

              <p>
                Reason: {complaint.reason}
              </p>

              <p>
                {complaint.description}
              </p>

              <span
                className={`refund-status ${complaint.status}`}
              >
                {complaint.status}
              </span>
            </div>

            {complaint.status === "pending" && (
              <div className="refund-buttons">

                <button
                  className="btn-primary"
                  onClick={() =>
                    updateStatus(
                      complaint._id,
                      "approved"
                    )
                  }
                >
                  Approve
                </button>

                <button
                  className="btn-outline danger-outline"
                  onClick={() =>
                    updateStatus(
                      complaint._id,
                      "rejected"
                    )
                  }
                >
                  Reject
                </button>

              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
};

export default AdminRefunds;
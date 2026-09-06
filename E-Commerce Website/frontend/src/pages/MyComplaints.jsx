import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const MyComplaints=()=>{
  const [complaints,setComplaints]=useState([]);
  const [error,setError]=useState("");

  useEffect(()=>{
    api.get("/refunds/my")
      .then(({data})=>setComplaints(data.complaints||[]))
      .catch(e=>setError(e.response?.data?.message||"Could not load complaints."));
  },[]);

  const statusClass=s=>`complaint-status complaint-status-${s||"pending"}`;

  return(
    <div className="page-shell">
      <div className="complaints-page-header">
        <div>
          <h1>My Complaints</h1>
          <p className="muted">Track your refund complaints.</p>
        </div>
        <Link to="/orders" className="btn-outline">View Orders</Link>
      </div>

      {error&&<p className="error-banner">{error}</p>}

      {!error&&!complaints.length&&(
        <div className="empty-complaints">
          <h2>No complaints yet</h2>
          <p className="muted">You haven't raised any complaints.</p>
          <Link to="/orders" className="btn-primary">View Orders</Link>
        </div>
      )}

      <div className="complaints-list">
        {complaints.map(c=>{
          const orderId=c.order?._id||c.order;
          return(
            <div className="complaint-list-card" key={c._id}>
              <div className="complaint-list-top">
                <div>
                  <h2>{c.productName}</h2>
                  <p className="muted">ID: {c._id}</p>
                </div>
                <span className={statusClass(c.status)}>
                  {c.status}
                </span>
              </div>

              <p><strong>Reason:</strong> {c.reason}</p>
              <p><strong>Problem:</strong> {c.description}</p>

              {c.adminRemark&&(
                <p className="admin-remark-box">
                  <strong>Admin:</strong> {c.adminRemark}
                </p>
              )}

              <Link
                to={`/orders/${orderId}/complaint/${c._id}`}
                className="btn-primary"
              >
                View Complaint
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyComplaints;

import { useEffect,useState } from "react";
import { Link,useParams } from "react-router-dom";
import api from "../api/axios.js";

const ComplaintDetails=()=>{
  const {orderId,complaintId}=useParams();
  const [c,setC]=useState(null),[error,setError]=useState("");

  useEffect(()=>{
    api.get(`/refunds/${complaintId}`)
      .then(({data})=>setC(data.complaint||data))
      .catch(e=>setError(e.response?.data?.message||"Could not load complaint."));
  },[complaintId]);

  if(error)return(
    <div className="page-shell">
      <p className="error-banner">{error}</p>
      <Link to={`/orders/${orderId}`} className="btn-outline">Back</Link>
    </div>
  );

  if(!c)return <div className="page-shell"><p>Loading...</p></div>;

  return(
    <div className="page-shell narrow">
      <Link to={`/orders/${orderId}`} className="back-link">
        ← Back to Order
      </Link>

      <div className="complaint-success-card">
        <div className="complaint-success-icon">✓</div>
        <h1>Complaint Raised Successfully</h1>
        <p className="muted">Complaint ID: {c._id}</p>
      </div>

      <div className="complaint-details-card">
        <h2>{c.productName}</h2>

        <p>
          <strong>Reason:</strong> {c.reason}
        </p>

        <p>
          <strong>Description:</strong> {c.description}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span className={`complaint-status complaint-status-${c.status}`}>
            {c.status}
          </span>
        </p>

        {c.adminRemark&&(
          <div className="admin-remark-box">
            <strong>Admin Remark</strong>
            <p>{c.adminRemark}</p>
          </div>
        )}

        <p className="muted">
          Raised: {new Date(c.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="complaint-actions">
        <Link to={`/orders/${orderId}`} className="btn-primary">
          Back to Order
        </Link>

        <Link to="/complaints" className="btn-outline">
          My Complaints
        </Link>
      </div>
    </div>
  );
};

export default ComplaintDetails;

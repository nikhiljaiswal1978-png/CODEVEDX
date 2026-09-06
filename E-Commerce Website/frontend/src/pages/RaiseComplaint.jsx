import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios.js";

const REASONS = [
  "Damaged Product",
  "Wrong Product",
  "Missing Parts",
  "Defective Product",
  "Other",
];

const RaiseComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [productId, setProductId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError("");

        const { data } = await api.get(`/orders/${id}`);

        setOrder(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load this order."
        );
      }
    };

    fetchOrder();
  }, [id]);

  const submitComplaint = async (e) => {
    e.preventDefault();

    setError("");

    const cleanDescription = description.trim();

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (!REASONS.includes(reason)) {
      setError("Please select a valid reason.");
      return;
    }

    if (!cleanDescription) {
      setError("Please describe the problem.");
      return;
    }

    if (cleanDescription.length < 10) {
      setError(
        "Description must contain at least 10 characters."
      );
      return;
    }

    if (cleanDescription.length > 1000) {
      setError(
        "Description cannot exceed 1000 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/refunds", {
        orderId: order._id,
        productId,
        reason,
        description: cleanDescription,
      });

      const complaint = data.complaint || data;

      if (!complaint?._id) {
        throw new Error(
          "Complaint was created but its ID was not returned."
        );
      }

      navigate(
        `/orders/${order._id}/complaint/${complaint._id}`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not submit complaint."
      );
    } finally {
      setLoading(false);
    }
  };

  if (error && !order) {
    return (
      <div className="page-shell narrow">
        <p className="error-banner">{error}</p>

        <Link to="/orders" className="btn-outline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-shell">
        <p className="muted">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="page-shell narrow">
      <Link
        to={`/orders/${order._id}`}
        className="back-link"
      >
        ← Back to Order
      </Link>

      <h1>Raise Refund Complaint</h1>

      <p className="muted">
        Select the product and describe the problem to
        submit your refund complaint.
      </p>

      {error && (
        <p className="error-banner">
          {error}
        </p>
      )}

      <form
        className="complaint-form"
        onSubmit={submitComplaint}
      >
        <label htmlFor="product">
          Select Product
        </label>

        <select
          id="product"
          value={productId}
          onChange={(e) =>
            setProductId(e.target.value)
          }
          required
          disabled={loading}
        >
          <option value="">
            Choose product
          </option>

          {order.items?.map((item) => (
            <option
              key={item._id || item.product}
              value={item.product}
            >
              {item.name}
            </option>
          ))}
        </select>

        <label htmlFor="reason">
          Complaint Reason
        </label>

        <select
          id="reason"
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          required
          disabled={loading}
        >
          <option value="">
            Select reason
          </option>

          {REASONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label htmlFor="description">
          Describe the Problem
        </label>

        <textarea
          id="description"
          rows="6"
          maxLength={1000}
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          placeholder="Explain the problem with the product..."
          required
          disabled={loading}
        />

        <small className="muted">
          {description.length}/1000 characters
        </small>

        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Submitting..."
            : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
};

export default RaiseComplaint;

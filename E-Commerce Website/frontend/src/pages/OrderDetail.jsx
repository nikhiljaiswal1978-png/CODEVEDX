
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";

const STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const stepsCompleted = (status) =>
  ({ pending: 1, paid: 2, shipped: 3, delivered: 4 }[status] || 0);

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this order.");
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order? This can't be undone.")) return;
    setActionError(""); setActionLoading(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not cancel this order.");
    } finally { setActionLoading(false); }
  };

  const handleConfirmDelivery = async () => {
    setActionError(""); setActionLoading(true);
    try {
      const { data } = await api.put(`/orders/${id}/confirm-delivery`);
      setOrder(data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not update this order.");
    } finally { setActionLoading(false); }
  };

  const handleDownloadInvoice = async () => {
    setActionError(""); setActionLoading(true);
    try {
      const response = await api.get(`/orders/${id}/invoice`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url; link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not download invoice.");
    } finally { setActionLoading(false); }
  };

  const handleRefund = async () => {
    const reason = window.prompt("Please enter the reason for requesting a refund:");
    if (reason === null) return;
    if (!reason.trim()) return setActionError("Please provide a refund reason.");

    setActionError(""); setActionLoading(true);
    try {
      const { data } = await api.post(`/orders/${id}/refund`, { reason: reason.trim() });
      setOrder(data.order || data);
      alert("Refund request submitted successfully.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not submit refund request.");
    } finally { setActionLoading(false); }
  };

  if (error) return (
    <div className="page-shell">
      <p className="error-banner">{error}</p>
      <Link to="/orders" className="btn-outline">Back to orders</Link>
    </div>
  );

  if (!order) return <div className="page-shell"><p className="muted">Loading…</p></div>;

  const isCancelled = order.status === "cancelled";
  const canCancel = ["pending", "paid"].includes(order.status);
  const canConfirmDelivery = order.status === "shipped";
  const canDownloadInvoice = !isCancelled && order.status !== "pending";
  const canRaiseComplaint = order.status === "delivered";
  const canRequestRefund =
    order.status === "delivered" &&
    !["requested", "approved", "processed"].includes(order.refundStatus);
  const completed = stepsCompleted(order.status);
  const placedDate = new Date(order.createdAt);
  const paidDate = order.paidAt ? new Date(order.paidAt) : null;

  return (
    <div className="page-shell">
      <Link to="/orders" className="back-link">&larr; Back to orders</Link>

      <div className="order-detail-header">
        <div>
          <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="muted">
            Placed on {placedDate.toLocaleDateString(undefined, {
              year: "numeric", month: "long", day: "numeric"
            })} at {placedDate.toLocaleTimeString(undefined, {
              hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
        <span className={`status-badge ${isCancelled ? "cancelled" : "paid"}`}>
          {order.status}
        </span>
      </div>

      {isCancelled ? (
        <div className="cancelled-banner">This order was cancelled.</div>
      ) : (
        <div className="order-timeline">
          {STEPS.map((step, i) => {
            const stepIndex = i + 1, isDone = stepIndex <= completed, isCurrent = stepIndex === completed;
            return (
              <div className="timeline-step-wrap" key={step.key}>
                <div className={`timeline-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                  <span className="timeline-dot">{isDone ? "✓" : stepIndex}</span>
                  <span className="timeline-label">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`timeline-connector ${stepIndex < completed ? "done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isCancelled && (
        <div className="order-actions">
          {actionError && <p className="error-banner">{actionError}</p>}
          <div className="order-actions-row">
            {canDownloadInvoice && (
              <button className="btn-invoice" disabled={actionLoading} onClick={handleDownloadInvoice}>
                📄 Download Invoice
              </button>
            )}

            {canConfirmDelivery && (
              <button className="btn-primary" disabled={actionLoading} onClick={handleConfirmDelivery}>
                {actionLoading ? "Updating…" : "I've received this order"}
              </button>
            )}

            {canRequestRefund && (
              <button className="btn-refund" disabled={actionLoading} onClick={handleRefund}>
                💰 Request Refund
              </button>
            )}

            {order.refundStatus === "requested" && (
              <span className="refund-status">Refund requested</span>
            )}

            {canRaiseComplaint && (
              <Link to={`/orders/${order._id}/complaint`} className="btn-complaint">
                📝 Raise Complaint
              </Link>
            )}

            {canCancel && (
              <button className="btn-outline danger-outline" disabled={actionLoading} onClick={handleCancel}>
                {actionLoading ? "Cancelling…" : "Cancel order"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="order-detail-grid">
        <div className="detail-block">
          <h3>Items ({order.items.length})</h3>
          <div className="detail-items">
            {order.items.map((item) => (
              <div className="order-line-item" key={item._id || item.product}>
                <img src={item.image} alt={item.name} />
                <div className="order-line-info">
                  <p className="order-line-name">{item.name}</p>
                  <p className="muted">Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}</p>
                </div>
                <span className="line-total">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-block">
          <h3>Shipping address</h3>
          {order.shippingAddress ? (
            <address className="shipping-address">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </address>
          ) : <p className="muted">No address on file.</p>}
        </div>

        <div className="detail-block">
          <h3>Payment</h3>
          {order.paymentMethod === "cod" ? (
            <div className="payment-summary">
              <p><strong>Cash on delivery</strong></p>
              <p className="muted">
                {order.isPaid
                  ? `Collected on ${paidDate?.toLocaleDateString() || ""}`
                  : "Payment due when the order arrives"}
              </p>
            </div>
          ) : (
            <div className="payment-summary">
              <p><strong>Card ending in {order.paymentResult?.last4 || "····"}</strong></p>
              <p className="muted">
                {order.isPaid
                  ? `Charged on ${paidDate?.toLocaleDateString() || ""}`
                  : "Not yet charged"}
              </p>
            </div>
          )}
        </div>

        <div className="detail-block">
          <h3>Order total</h3>
          <div className="summary-row">
            <span>Items</span>
            <span>₹{Number(order.itemsPrice || 0).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>
              {Number(order.shippingPrice || 0) === 0
                ? "Free"
                : `₹${Number(order.shippingPrice).toFixed(2)}`}
            </span>
          </div>
          {order.codFee > 0 && (
            <div className="summary-row">
              <span>Cash on delivery fee</span>
              <span>₹{Number(order.codFee).toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{Number(order.totalPrice || 0).toFixed(2)}</span>
          </div>
        </div>

        {order.refundStatus && order.refundStatus !== "none" && (
          <div className="detail-block">
            <h3>Refund status</h3>
            <p>
              <strong>
                {order.refundStatus.charAt(0).toUpperCase() + order.refundStatus.slice(1)}
              </strong>
            </p>
            {order.refundReason && <p className="muted">Reason: {order.refundReason}</p>}
          </div>
        )}

        {order.complaint?.message && (
          <div className="detail-block">
            <h3>Complaint</h3>
            <p>{order.complaint.message}</p>
            <p className="muted">Status: {order.complaint.status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;

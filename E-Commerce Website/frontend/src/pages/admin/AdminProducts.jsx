import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  brand: "",
  image: "",
  stock: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { limit: 100 } });
      setProducts(data.products);
    } catch (err) {
      setError("Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      brand: p.brand,
      image: p.image,
      stock: p.stock,
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page-shell">
      <div className="admin-header">
        <h1>Admin dashboard</h1>
        <div className="admin-nav">
          <Link
            to="/admin"
            className="admin-tab"
          >
            Overview
          </Link>
          <Link
            to="/admin/products"
            className="admin-tab active"
          >
            Products
          </Link>
          <Link
            to="/admin/orders"
            className="admin-tab"
          >
            Orders
          </Link>
          <Link
            to="/admin/users"
            className="admin-tab"
          >
            Users
          </Link>
          <Link to="/admin/refunds" className="admin-tab">
            Refund Complaints
          </Link>
        </div>
      </div>

      <div className="admin-toolbar">
        <h3>Products ({products.length})</h3>
        <button className="btn-primary" onClick={startCreate}>
          + Add product
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h4>{editingId ? "Edit product" : "New product"}</h4>
          <div className="form-row">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <textarea
            required
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="form-row">
            <input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              required
              type="number"
              min="0"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div className="form-row">
            <input
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
            <input
              required
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </div>
          <div className="admin-form-actions">
            <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="btn-primary" type="submit">
              {editingId ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><img src={p.image} alt={p.name} className="admin-thumb" /></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price.toFixed(2)}</td>
                <td className={p.stock <= 5 ? "low-stock" : ""}>{p.stock}</td>
                <td className="admin-actions">
                  <button className="link-btn" onClick={() => startEdit(p)}>Edit</button>
                  <button className="link-btn danger" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProducts;
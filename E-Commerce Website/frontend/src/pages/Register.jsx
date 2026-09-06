import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const specialRegex = /[!@#$%^&*(),.?":{}|<>_\-\\[\]`~;'+=]/;

    if (!form.name.trim())
      newErrors.name = "Full name is required.";
    else if (form.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters.";
    else if (!nameRegex.test(form.name.trim()))
      newErrors.name = "Enter a valid full name using letters only.";

    if (!form.email.trim())
      newErrors.email = "Email is required.";
    else if (!emailRegex.test(form.email.trim()))
      newErrors.email = "Enter a valid email address.";

    if (!form.password)
      newErrors.password = "Password is required.";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(form.password))
      newErrors.password = "Password must contain at least one uppercase letter.";
    else if (!/[a-z]/.test(form.password))
      newErrors.password = "Password must contain at least one lowercase letter.";
    else if (!/[0-9]/.test(form.password))
      newErrors.password = "Password must contain at least one number.";
    else if (!specialRegex.test(form.password))
      newErrors.password = "Password must contain at least one special character.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register(
        form.name.trim(),
        form.email.trim(),
        form.password
      );
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell narrow">
      <h1>Create an account</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          required
          name="name"
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          autoComplete="name"
        />
        {errors.name && <p className="field-error">{errors.name}</p>}

        <input
          required
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
        />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <input
          required
          name="password"
          type="password"
          placeholder="Password"
          minLength={8}
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="field-error">{errors.password}</p>
        )}

        <p className="password-hint">
          Password must contain:
          <br />
          • At least 8 characters
          <br />
          • One uppercase letter
          <br />
          • One lowercase letter
          <br />
          • One number
          <br />
          • One special character
        </p>

        {error && <p className="error-banner">{error}</p>}

        <button
          type="submit"
          className="btn-primary full-width"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Register;

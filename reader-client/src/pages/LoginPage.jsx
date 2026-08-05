import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { loginUser } from "../services/api.js";


function LoginPage() {

  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await loginUser(form);
      login(data);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app">
      <Link className="back-link" to="/">
        ← Regresar al blog
      </Link>

      <form className="auth-form" onSubmit={handleSubmit}>
        <p className="eyebrow">Cuenta</p>
        <h1>Iniciar sesión</h1>

        {location.state?.message && (
            <p className="form-success">
                {location.state.message}
            </p>
            )}

        {error && <p className="form-error">{error}</p>}

        <label>
          Correo electrónico
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <p>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api.js";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
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
      await registerUser(form);
      navigate("/login", {
        state: {
          message: "Cuenta creada. Ya puedes iniciar sesión.",
        },
      });
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
        <p className="eyebrow">Nueva cuenta</p>
        <h1>Crear cuenta</h1>

        {error && <p className="form-error">{error}</p>}

        <label>
          Nombre de usuario
          <input
            type="text"
            name="username"
            minLength="3"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>

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
            minLength="8"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creando cuenta..." : "Registrarme"}
        </button>

        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
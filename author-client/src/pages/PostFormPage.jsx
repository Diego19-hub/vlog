import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  createPost,
  getAuthorPost,
  updatePost,
} from "../services/api.js";

function PostFormPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const isEditing = Boolean(postId);

  const [form, setForm] = useState({
    title: "",
    content: "",
    published: false,
  });

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadPost() {
      try {
        const post = await getAuthorPost(
          postId,
          token,
          controller.signal,
        );

        setForm({
          title: post.title,
          content: post.content,
          published: post.published,
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPost();

    return () => controller.abort();
  }, [isEditing, postId, token]);

  function handleChange(event) {
    const { name, value, checked, type } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isEditing) {
        await updatePost(
          postId,
          {
            title: form.title,
            content: form.content,
          },
          token,
        );
      } else {
        await createPost(form, token);
      }

      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="page-status">Cargando publicación...</p>;
  }

  return (
    <main className="author-app">
      <Link className="back-link" to="/">
        ← Regresar al panel
      </Link>

      <form className="post-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Blog API</p>
          <h1>
            {isEditing
              ? "Editar publicación"
              : "Nueva publicación"}
          </h1>
        </div>

        {error && <p className="form-error">{error}</p>}

        <label>
          Título
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength="150"
            required
          />
        </label>

        <label>
          Contenido
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows="14"
            required
          />
        </label>

        {!isEditing && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
            />
            Publicar inmediatamente
          </label>
        )}

        <button type="submit" disabled={submitting}>
          {submitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear publicación"}
        </button>
      </form>
    </main>
  );
}

export default PostFormPage;
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  changePostStatus,
  deletePost,
  getAuthorPosts
} from "../services/api.js";

import { Link } from "react-router-dom";

function DashboardPage() {
  const { token, user, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      try {
        const data = await getAuthorPosts(
          token,
          controller.signal,
        );

        setPosts(data);
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

    loadPosts();

    return () => controller.abort();
  }, [token]);

  async function handleStatusChange(post) {
    setError("");
    setUpdatingId(post.id);

    try {
      const updatedPost = await changePostStatus(
        post.id,
        !post.published,
        token,
      );

      setPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          currentPost.id === updatedPost.id
            ? {
                ...currentPost,
                published: updatedPost.published,
                updatedAt: updatedPost.updatedAt,
              }
            : currentPost,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId(null);
    }
  }
  async function handleDelete(post) {
  const confirmed = window.confirm(
    `¿Seguro que quieres eliminar "${post.title}"? Esta acción no se puede deshacer.`,
  );

  if (!confirmed) {
    return;
  }

  setError("");
  setDeletingId(post.id);

  try {
    await deletePost(post.id, token);

    setPosts((currentPosts) =>
      currentPosts.filter(
        (currentPost) => currentPost.id !== post.id,
      ),
    );
  } catch (requestError) {
    setError(requestError.message);
  } finally {
    setDeletingId(null);
  }
}

  return (
    <main className="author-app">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Blog API</p>
          <h1>Publicaciones</h1>
          <p>Sesión iniciada como {user.username}</p>
        </div>

        <button type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </header>
      <Link className="primary-link" to="/posts/new">
        + Nueva publicación
      </Link>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p>Cargando publicaciones...</p>
      ) : posts.length === 0 ? (
        <p>Todavía no has creado publicaciones.</p>
      ) : (
        <section className="author-posts">
          {posts.map((post) => (
            <article className="author-post-card" key={post.id}>
              <div className="post-card-header">
                <span
                  className={
                    post.published
                      ? "status-badge published"
                      : "status-badge draft"
                  }
                >
                  {post.published ? "Publicado" : "Borrador"}
                </span>

                <span>
                  {post._count.comments} comentarios
                </span>
              </div>

              <h2>{post.title}</h2>
              <p>{post.content}</p>

              <footer>
                <span>
                  Actualizado{" "}
                  {new Date(post.updatedAt).toLocaleDateString(
                    "es-MX",
                  )}
                </span>

              <div className="post-actions">

                <Link
                className="edit-link"
                to={`/posts/${post.id}/comments`}
              >
                Comentarios ({post._count.comments})
              </Link>
                <Link
                  className="edit-link"
                  to={`/posts/${post.id}/edit`}
                >
                  Editar
                </Link>

                <button
                  className="delete-button"
                  type="button"
                  disabled={deletingId === post.id}
                  onClick={() => handleDelete(post)}
                >
                  {deletingId === post.id ? "Eliminando..." : "Eliminar"}
                </button>

                <button
                  type="button"
                  disabled={updatingId === post.id}
                  onClick={() => handleStatusChange(post)}
                >
                  {updatingId === post.id
                    ? "Actualizando..."
                    : post.published
                      ? "Convertir en borrador"
                      : "Publicar"}
                </button>
              </div>
              </footer>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default DashboardPage;
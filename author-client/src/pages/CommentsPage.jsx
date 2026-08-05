import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  deleteComment,
  getAuthorPost,
  updateComment,
} from "../services/api.js";

function CommentsPage() {
  const { postId } = useParams();
  const { token } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPost() {
      try {
        const data = await getAuthorPost(
          postId,
          token,
          controller.signal,
        );

        setPost(data);
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
  }, [postId, token]);

  function startEditing(comment) {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditContent("");
  }

  async function handleUpdate(event, commentId) {
    event.preventDefault();

    if (!editContent.trim()) {
      setError("El comentario no puede estar vacío");
      return;
    }

    setSavingId(commentId);
    setError("");

    try {
      const updatedComment = await updateComment(
        postId,
        commentId,
        editContent,
        token,
      );

      setPost((currentPost) => ({
        ...currentPost,
        comments: currentPost.comments.map((comment) =>
          comment.id === updatedComment.id
            ? updatedComment
            : comment,
        ),
      }));

      cancelEditing();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(comment) {
    const confirmed = window.confirm(
      `¿Eliminar el comentario de ${comment.author.username}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(comment.id);
    setError("");

    try {
      await deleteComment(postId, comment.id, token);

      setPost((currentPost) => ({
        ...currentPost,
        comments: currentPost.comments.filter(
          (currentComment) =>
            currentComment.id !== comment.id,
        ),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="page-status">Cargando comentarios...</p>;
  }

  if (!post) {
    return (
      <p className="page-status form-error">
        {error || "Publicación no encontrada"}
      </p>
    );
  }

  return (
    <main className="author-app">
      <Link className="back-link" to="/">
        ← Regresar al panel
      </Link>

      <header>
        <p className="eyebrow">Comentarios</p>
        <h1>{post.title}</h1>
        <p>{post.comments.length} comentarios</p>
      </header>

      {error && <p className="form-error">{error}</p>}

      <section className="comment-management">
        {post.comments.length === 0 ? (
          <p>Esta publicación no tiene comentarios.</p>
        ) : (
          post.comments.map((comment) => (
            <article
              className="managed-comment"
              key={comment.id}
            >
              <header>
                <strong>{comment.author.username}</strong>
                <span>
                  {new Date(
                    comment.createdAt,
                  ).toLocaleString("es-MX")}
                </span>
              </header>

              {editingId === comment.id ? (
                <form
                  onSubmit={(event) =>
                    handleUpdate(event, comment.id)
                  }
                >
                  <textarea
                    rows="4"
                    value={editContent}
                    onChange={(event) =>
                      setEditContent(event.target.value)
                    }
                    required
                  />

                  <div className="comment-actions">
                    <button
                      type="submit"
                      disabled={savingId === comment.id}
                    >
                      {savingId === comment.id
                        ? "Guardando..."
                        : "Guardar"}
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p>{comment.content}</p>

                  <div className="comment-actions">
                    <button
                      type="button"
                      onClick={() => startEditing(comment)}
                    >
                      Editar
                    </button>

                    <button
                      className="delete-button"
                      type="button"
                      disabled={deletingId === comment.id}
                      onClick={() => handleDelete(comment)}
                    >
                      {deletingId === comment.id
                        ? "Eliminando..."
                        : "Eliminar"}
                    </button>
                  </div>
                </>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default CommentsPage;
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  createComment,
  getPublishedPostById,
} from "../services/api.js";

function PostDetailPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { token, user } = useAuth();

    const [commentContent, setCommentContent] = useState("");
    const [commentError, setCommentError] = useState("");
    const [submittingComment, setSubmittingComment] =
    useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPost() {
      try {
        const data = await getPublishedPostById(
          postId,
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
  }, [postId]);

  async function handleCommentSubmit(event) {
  event.preventDefault();

  if (!commentContent.trim()) {
    setCommentError("Escribe un comentario");
    return;
  }

  setCommentError("");
  setSubmittingComment(true);

  try {
    const newComment = await createComment(
      postId,
      commentContent,
      token,
    );

    setPost((currentPost) => ({
      ...currentPost,
      comments: [newComment, ...currentPost.comments],
    }));

    setCommentContent("");
    } catch (requestError) {
        setCommentError(requestError.message);
    } finally {
        setSubmittingComment(false);
    }
    }

  if (loading) {
    return <p className="status">Cargando publicación...</p>;
  }

  if (error) {
    return <p className="status error">{error}</p>;
  }

  return (
    <div className="app">
      <Link className="back-link" to="/">
        ← Regresar a publicaciones
      </Link>

      <article className="post-detail">
        <p className="eyebrow">
          {new Date(post.createdAt).toLocaleDateString("es-MX")}
        </p>

        <h1>{post.title}</h1>
        <p className="post-author">Por {post.author.username}</p>
        <div className="post-content">{post.content}</div>
      </article>

      <section className="comments">
        <h2>Comentarios ({post.comments.length})</h2>

        {user ? (
  <form
    className="comment-form"
    onSubmit={handleCommentSubmit}
  >
    <label htmlFor="comment">
      Comentar como {user.username}
    </label>

    <textarea
      id="comment"
      value={commentContent}
      onChange={(event) =>
        setCommentContent(event.target.value)
      }
      rows="4"
      maxLength="1000"
      placeholder="Escribe tu comentario..."
      required
    />

    {commentError && (
      <p className="form-error">{commentError}</p>
    )}

    <button type="submit" disabled={submittingComment}>
      {submittingComment
        ? "Publicando..."
        : "Publicar comentario"}
    </button>
    </form>
    ) : (
    <p className="login-notice">
        <Link to="/login">Inicia sesión</Link> para comentar.
    </p>
    )}      

        {post.comments.length === 0 ? (
          <p>Todavía no hay comentarios.</p>
        ) : (
          post.comments.map((comment) => (
            <article className="comment" key={comment.id}>
              <header>
                <strong>{comment.author.username}</strong>
                <span>
                  {new Date(
                    comment.createdAt,
                  ).toLocaleDateString("es-MX")}
                </span>
              </header>

              <p>{comment.content}</p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default PostDetailPage;
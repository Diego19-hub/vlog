import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedPosts } from "../services/api.js";
import "../App.css";
import { useAuth } from "../context/AuthContext.jsx";

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuth();

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      try {
        const publishedPosts = await getPublishedPosts(
          controller.signal,
        );

        setPosts(publishedPosts);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadPosts();

    return () => controller.abort();
  }, []);

  if (loading) {
    return <p className="status">Cargando publicaciones...</p>;
  }

  if (error) {
    return <p className="status error">{error}</p>;
  }

  return (
    <div className="app">
      <header className="header">
        <p className="eyebrow">Blog API</p>
        <h1>Ideas, desarrollo y aprendizaje</h1>
        <p>
          Publicaciones construidas con React, Express,
          PostgreSQL y Prisma.
        </p>

        <nav className="session-nav">
            {user ? (
                <>
                <span>Hola, {user.username}</span>
                <button type="button" onClick={logout}>
                    Cerrar sesión
                </button>
                </>
            ) : (
                <Link to="/login">Iniciar sesión</Link>
            )}
        </nav>
      </header>

      <main className="posts">
        {posts.length === 0 ? (
          <p className="status">
            Todavía no hay publicaciones disponibles.
          </p>
        ) : (
          posts.map((post) => (
            <Link
              to={`/posts/${post.id}`}
              key={post.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <article className="post-card">
                <span>
                  {new Date(post.createdAt).toLocaleDateString(
                    "es-MX",
                  )}
                </span>

                <h2>{post.title}</h2>
                <p>{post.content}</p>

                <footer>
                  <span>Por {post.author.username}</span>
                  <span>
                    {post._count.comments} comentarios
                  </span>
                </footer>
              </article>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}

export default App;
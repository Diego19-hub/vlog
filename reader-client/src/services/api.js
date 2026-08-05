const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function getPublishedPosts(signal) {
  const response = await fetch(`${API_URL}/api/posts`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("No fue posible obtener las publicaciones");
  }

  const data = await response.json();
  return data.posts;
}

export async function getPublishedPostById(id, signal) {
  const response = await fetch(
    `${API_URL}/api/posts/${id}`,
    { signal },
  );

  if (response.status === 404) {
    throw new Error("Publicación no encontrada");
  }

  if (!response.ok) {
    throw new Error("No fue posible obtener la publicación");
  }

  const data = await response.json();
  return data.post;
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No fue posible iniciar sesión");
  }

  return data;
}

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No fue posible registrarse");
  }

  return data;
}

export async function createComment(postId, content, token) {
  const response = await fetch(
    `${API_URL}/api/posts/${postId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No fue posible crear el comentario",
    );
  }

  return data.comment;
}
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function loginAuthor(credentials) {
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

  if (data.user.role !== "AUTHOR") {
    throw new Error("Esta cuenta no tiene permisos de autor");
  }

  return data;
}

export async function getAuthorPosts(token, signal) {
  const response = await fetch(`${API_URL}/api/posts/author`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No fue posible obtener las publicaciones",
    );
  }

  return data.posts;
}

export async function changePostStatus(id, published, token) {
  const response = await fetch(
    `${API_URL}/api/posts/${id}/publish`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ published }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No fue posible cambiar el estado",
    );
  }

  return data.post;
}

export async function getAuthorPost(id, token, signal) {
  const response = await fetch(
    `${API_URL}/api/posts/author/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No fue posible obtener la publicación",
    );
  }

  return data.post;
}

export async function createPost(postData, token) {
  const response = await fetch(`${API_URL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No fue posible crear la publicación",
    );
  }

  return data.post;
}

export async function updatePost(id, postData, token) {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No fue posible actualizar la publicación",
    );
  }

  return data.post;
}

export async function deletePost(id, token) {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No fue posible eliminar la publicación",
    );
  }

  return data;
}
export async function updateComment(
  postId,
  commentId,
  content,
  token,
) {
  const response = await fetch(
    `${API_URL}/api/posts/${postId}/comments/${commentId}`,
    {
      method: "PUT",
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
      data.message || "No fue posible editar el comentario",
    );
  }

  return data.comment;
}

export async function deleteComment(
  postId,
  commentId,
  token,
) {
  const response = await fetch(
    `${API_URL}/api/posts/${postId}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No fue posible eliminar el comentario",
    );
  }

  return data;
}
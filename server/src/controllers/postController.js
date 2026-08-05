import prisma from "../config/prisma.js";

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getPublishedPosts(req, res) {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  res.status(200).json({ posts });
}

export async function getPublishedPostById(req, res) {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      message: "ID de publicación inválido",
    });
  }

  const post = await prisma.post.findFirst({
    where: {
      id,
      published: true,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    return res.status(404).json({
      message: "Publicación no encontrada",
    });
  }

  res.status(200).json({ post });
}

export async function getAuthorPosts(req, res) {
  const posts = await prisma.post.findMany({
    where: {
      authorId: req.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  res.status(200).json({ posts });
}

export async function getAuthorPostById(req, res) {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      message: "ID de publicación inválido",
    });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      comments: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  if (!post) {
    return res.status(404).json({
      message: "Publicación no encontrada",
    });
  }

  if (post.authorId !== req.user.id) {
    return res.status(403).json({
      message: "No puedes consultar esta publicación",
    });
  }

  res.status(200).json({ post });
}

export async function createPost(req, res) {
  const { title, content, published = false } = req.body;

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({
      message: "El título y contenido son obligatorios",
    });
  }

  if (typeof published !== "boolean") {
    return res.status(400).json({
      message: "published debe ser true o false",
    });
  }

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      published,
      authorId: req.user.id,
    },
  });

  res.status(201).json({
    message: "Publicación creada correctamente",
    post,
  });
}

export async function updatePost(req, res) {
  const id = parseId(req.params.id);
  const { title, content } = req.body;

  if (!id) {
    return res.status(400).json({
      message: "ID de publicación inválido",
    });
  }

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({
      message: "El título y contenido son obligatorios",
    });
  }

  const existingPost = await prisma.post.findUnique({
    where: { id },
  });

  if (!existingPost) {
    return res.status(404).json({
      message: "Publicación no encontrada",
    });
  }

  if (existingPost.authorId !== req.user.id) {
    return res.status(403).json({
      message: "No puedes modificar esta publicación",
    });
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      title: title.trim(),
      content: content.trim(),
    },
  });

  res.status(200).json({
    message: "Publicación actualizada correctamente",
    post,
  });
}

export async function changePublicationStatus(req, res) {
  const id = parseId(req.params.id);
  const { published } = req.body;

  if (!id) {
    return res.status(400).json({
      message: "ID de publicación inválido",
    });
  }

  if (typeof published !== "boolean") {
    return res.status(400).json({
      message: "published debe ser true o false",
    });
  }

  const existingPost = await prisma.post.findUnique({
    where: { id },
  });

  if (!existingPost) {
    return res.status(404).json({
      message: "Publicación no encontrada",
    });
  }

  if (existingPost.authorId !== req.user.id) {
    return res.status(403).json({
      message: "No puedes modificar esta publicación",
    });
  }

  const post = await prisma.post.update({
    where: { id },
    data: { published },
  });

  res.status(200).json({
    message: published
      ? "Publicación publicada correctamente"
      : "Publicación convertida en borrador",
    post,
  });
}

export async function deletePost(req, res) {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      message: "ID de publicación inválido",
    });
  }

  const existingPost = await prisma.post.findUnique({
    where: { id },
  });

  if (!existingPost) {
    return res.status(404).json({
      message: "Publicación no encontrada",
    });
  }

  if (existingPost.authorId !== req.user.id) {
    return res.status(403).json({
      message: "No puedes eliminar esta publicación",
    });
  }

  await prisma.post.delete({
    where: { id },
  });

  res.status(200).json({
    message: "Publicación eliminada correctamente",
  });
}
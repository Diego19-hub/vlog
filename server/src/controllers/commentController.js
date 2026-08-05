import prisma from "../config/prisma.js";

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function createComment(req, res) {
  const postId = parseId(req.params.postId);
  const { content } = req.body;

  if (!postId) {
    return res.status(400).json({
      message: "ID de publicación inválido",
    });
  }

  if (!content?.trim()) {
    return res.status(400).json({
      message: "El contenido del comentario es obligatorio",
    });
  }

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      published: true,
    },
  });

  if (!post) {
    return res.status(404).json({
      message: "Publicación no encontrada",
    });
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      authorId: req.user.id,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  res.status(201).json({
    message: "Comentario creado correctamente",
    comment,
  });
}

export async function updateComment(req, res) {
  const commentId = parseId(req.params.commentId);
  const { content } = req.body;

  if (!commentId) {
    return res.status(400).json({
      message: "ID de comentario inválido",
    });
  }

  if (!content?.trim()) {
    return res.status(400).json({
      message: "El contenido del comentario es obligatorio",
    });
  }

  const existingComment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!existingComment) {
    return res.status(404).json({
      message: "Comentario no encontrado",
    });
  }

  const canManage =
    existingComment.authorId === req.user.id ||
    req.user.role === "AUTHOR";

  if (!canManage) {
    return res.status(403).json({
      message: "No puedes editar este comentario",
    });
  }

  const comment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      content: content.trim(),
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  res.status(200).json({
    message: "Comentario actualizado correctamente",
    comment,
  });
}

export async function deleteComment(req, res) {
  const commentId = parseId(req.params.commentId);

  if (!commentId) {
    return res.status(400).json({
      message: "ID de comentario inválido",
    });
  }

  const existingComment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!existingComment) {
    return res.status(404).json({
      message: "Comentario no encontrado",
    });
  }

  const canManage =
    existingComment.authorId === req.user.id ||
    req.user.role === "AUTHOR";

  if (!canManage) {
    return res.status(403).json({
      message: "No puedes eliminar este comentario",
    });
  }

  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  res.status(200).json({
    message: "Comentario eliminado correctamente",
  });
}
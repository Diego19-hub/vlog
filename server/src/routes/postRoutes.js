import { Router } from "express";
import {
  changePublicationStatus,
  createPost,
  deletePost,
  getAuthorPostById,
  getAuthorPosts,
  getPublishedPostById,
  getPublishedPosts,
  updatePost,
} from "../controllers/postController.js";

import {
  requireAuth,
  requireAuthor,
} from "../middleware/authMiddleware.js";

const postRouter = Router();

postRouter.get("/", getPublishedPosts);

postRouter.get(
  "/author",
  requireAuth,
  requireAuthor,
  getAuthorPosts,
);

postRouter.get(
  "/author/:id",
  requireAuth,
  requireAuthor,
  getAuthorPostById,
);

postRouter.post(
  "/",
  requireAuth,
  requireAuthor,
  createPost,
);

postRouter.put(
  "/:id",
  requireAuth,
  requireAuthor,
  updatePost,
);

postRouter.patch(
  "/:id/publish",
  requireAuth,
  requireAuthor,
  changePublicationStatus,
);

postRouter.delete(
  "/:id",
  requireAuth,
  requireAuthor,
  deletePost,
);

postRouter.get("/:id", getPublishedPostById);

export default postRouter;
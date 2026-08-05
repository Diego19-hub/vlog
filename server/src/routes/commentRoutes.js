import { Router } from "express";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../controllers/commentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const commentRouter = Router({
  mergeParams: true,
});

commentRouter.post("/", requireAuth, createComment);

commentRouter.put(
  "/:commentId",
  requireAuth,
  updateComment,
);

commentRouter.delete(
  "/:commentId",
  requireAuth,
  deleteComment,
);

export default commentRouter;
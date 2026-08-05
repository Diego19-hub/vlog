import express from "express";
import cors from "cors";
import "dotenv/config";

import prisma from "./config/prisma.js";
import authRouter from "./routes/authRoutes.js";
import postRouter from "./routes/postRoutes.js";
import commentRouter from "./routes/commentRoutes.js";

import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origen no permitido por CORS"),
      );
    },
  }),
);

app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Blog API funcionando correctamente",
  });
});

app.get("/api/health", async (req, res) => {
  const users = await prisma.user.count();

  res.status(200).json({
    status: "ok",
    database: "connected",
    users,
  });
});

const allowedOrigins = (
  process.env.CLIENT_ORIGINS || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Demasiados intentos. Inténtalo nuevamente más tarde.",
  },
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/posts", postRouter);

app.use(
  "/api/posts/:postId/comments",
  commentRouter,
);
app.use((error, req, res, next) => {
  console.error(error);

  if (error.message === "Origen no permitido por CORS") {
    return res.status(403).json({
      message: error.message,
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "La solicitud supera el tamaño permitido",
    });
  }

  return res.status(500).json({
    message: "Error interno del servidor",
  });
});


app.use((req, res) => {
  return res.status(404).json({
    message: "Ruta no encontrada",
  });
});

export default app;
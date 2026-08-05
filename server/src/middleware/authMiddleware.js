import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token requerido",
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: Number(payload.sub),
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
}

export function requireAuthor(req, res, next) {
  if (req.user.role !== "AUTHOR") {
    return res.status(403).json({
      message: "Esta acción requiere permisos de autor",
    });
  }

  next();
}
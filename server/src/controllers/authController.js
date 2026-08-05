import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );
}

export async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Username, email y password son obligatorios",
    });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({
      message: "El username debe tener al menos 3 caracteres",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "La contraseña debe tener al menos 8 caracteres",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "El email o username ya está registrado",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return res.status(201).json({
    message: "Usuario registrado correctamente",
    user,
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email y password son obligatorios",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Credenciales incorrectas",
    });
  }

  const validPassword = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!validPassword) {
    return res.status(401).json({
      message: "Credenciales incorrectas",
    });
  }

  const token = createToken(user);

  return res.status(200).json({
    message: "Sesión iniciada correctamente",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}

export async function getCurrentUser(req, res) {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "Usuario no encontrado",
    });
  }

  return res.status(200).json({ user });
}
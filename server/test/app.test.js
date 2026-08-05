import test, { after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

test("GET / responde que la API funciona", async () => {
  const response = await request(app).get("/");

  assert.equal(response.status, 200);
  assert.equal(
    response.body.message,
    "Blog API funcionando correctamente",
  );
});

test("GET /api/health comprueba PostgreSQL", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.database, "connected");
  assert.equal(typeof response.body.users, "number");
});

test("GET /api/posts devuelve un arreglo", async () => {
  const response = await request(app).get("/api/posts");

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.posts));
});

test("POST /api/posts requiere autenticación", async () => {
  const response = await request(app)
    .post("/api/posts")
    .send({
      title: "Publicación sin autorización",
      content: "Este contenido no debe guardarse.",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.message, "Token requerido");
});

test("POST /api/auth/register valida campos obligatorios", async () => {
  const response = await request(app)
    .post("/api/auth/register")
    .send({});

  assert.equal(response.status, 400);
  assert.equal(
    response.body.message,
    "Username, email y password son obligatorios",
  );
});

test("GET /api/posts/:id rechaza un ID inválido", async () => {
  const response = await request(app).get(
    "/api/posts/incorrecto",
  );

  assert.equal(response.status, 400);
  assert.equal(
    response.body.message,
    "ID de publicación inválido",
  );
});

test("Una ruta inexistente devuelve 404", async () => {
  const response = await request(app).get(
    "/api/ruta-inexistente",
  );

  assert.equal(response.status, 404);
  assert.equal(response.body.message, "Ruta no encontrada");
});

after(async () => {
  await prisma.$disconnect();
});
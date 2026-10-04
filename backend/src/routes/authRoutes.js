import { Router } from "express";
import { z } from "zod";
import { login, me, listUsers, createUser } from "../controllers/authController.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validateRequest.js";

const router = Router();

router.post(
  "/login",
  validate(z.object({
    body: z.object({
      email: z.string().email(),
      senha: z.string().min(6).max(100),
    }),
    params: z.object({}),
    query: z.object({}),
  })),
  login,
);

router.get("/me", authenticate, me);
router.get("/usuarios", authenticate, requireRole("GESTOR"), listUsers);

router.post(
  "/usuarios",
  authenticate,
  requireRole("GESTOR"),
  validate(z.object({
    body: z.object({
      nome: z.string().trim().min(2).max(100),
      email: z.string().email(),
      senha: z.string().min(6).max(100),
      perfil: z.enum(["ATENDENTE", "GESTOR"]).default("ATENDENTE"),
    }),
    params: z.object({}),
    query: z.object({}),
  })),
  createUser,
);

export default router;

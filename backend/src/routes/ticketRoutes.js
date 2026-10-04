import { Router } from "express";
import { z } from "zod";
import {
  issue,
  callNext,
  status,
  panel,
  snapshot,
  close,
} from "../controllers/ticketController.js";
import { authenticate, authenticateOrDemoAttendant } from "../middlewares/auth.js";
import { validate } from "../middlewares/validateRequest.js";

const router = Router();

router.post(
  "/emissao",
  validate(z.object({
    body: z.object({ tipo: z.enum(["SP", "SG", "SE"]) }),
    params: z.object({}),
    query: z.object({}),
  })),
  issue,
);

router.post(
  "/chamar-proximo",
  authenticateOrDemoAttendant,
  validate(z.object({
    body: z.object({
      guiche_id: z.coerce.number().int().positive(),
      atendente_id: z.coerce.number().int().positive().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
  })),
  callNext,
);

router.patch(
  "/:id/status",
  authenticateOrDemoAttendant,
  validate(z.object({
    body: z.object({
      acao: z.enum(["recall", "start", "finish", "absent"]),
      atendente_id: z.coerce.number().int().positive().optional(),
    }),
    params: z.object({ id: z.coerce.number().int().positive() }),
    query: z.object({}),
  })),
  status,
);

router.get("/painel", panel);
router.get("/snapshot", snapshot);
router.post("/encerrar", authenticate, close);

export default router;

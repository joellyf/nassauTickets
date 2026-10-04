import { Router } from "express";
import { z } from "zod";
import { report } from "../controllers/reportController.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validateRequest.js";

const router = Router();

router.get(
  "/",
  authenticate,
  requireRole("GESTOR"),
  validate(z.object({
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      period: z.enum(["day", "month"]).default("day"),
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }),
  })),
  report,
);

export default router;

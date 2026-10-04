import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { forbidden, unauthorized } from "../utils/httpError.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(unauthorized());
  }

  try {
    req.user = jwt.verify(header.slice(7), env.jwt.secret);
    next();
  } catch {
    next(unauthorized("Token inválido ou expirado."));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.perfil)) {
      return next(forbidden());
    }
    next();
  };
}

export function authenticateOrDemoAttendant(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return authenticate(req, res, next);

  const attendantId = Number(req.body?.atendente_id);
  if (Number.isInteger(attendantId) && attendantId > 0) {
    req.demoAttendantId = attendantId;
    return next();
  }

  return next(unauthorized());
}

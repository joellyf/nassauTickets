import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: env.corsOrigin.split(",").map((item) => item.trim()),
  credentials: true,
}));
app.use(express.json({ limit: "32kb" }));
app.use(pinoHttp());

app.use(rateLimit({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.max,
  standardHeaders: "draft-8",
  legacyHeaders: false,
}));

app.get("/", (req, res) => {
  res.json({ name: "nassauTickets API", version: "1.0.0" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/relatorios", reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

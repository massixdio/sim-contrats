import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@/config/env";
import { authRouter } from "@/modules/auth/auth.controller";
import { clientsRouter } from "@/modules/clients/clients.controller";
import { insurersRouter } from "@/modules/insurers/insurers.controller";
import { contractsRouter } from "@/modules/contracts/contracts.controller";
import { paymentsRouter } from "@/modules/payments/payments.controller";
import { dashboardRouter } from "@/modules/dashboard/dashboard.controller";
import { notFound } from "@/middlewares/notFound";
import { errorHandler } from "@/middlewares/errorHandler";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/insurers", insurersRouter);
app.use("/api/contracts", contractsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFound);
app.use(errorHandler);

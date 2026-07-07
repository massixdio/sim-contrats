import { Router } from "express";
import * as dashboardService from "./dashboard.service";
import { authenticate } from "@/middlewares/auth";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get("/stats", async (_req, res) => {
  const stats = await dashboardService.getDashboardStats();
  res.json(stats);
});

dashboardRouter.get("/upcoming-payments", async (_req, res) => {
  const payments = await dashboardService.getUpcomingPayments();
  res.json(payments);
});

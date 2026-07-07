import { Router } from "express";
import { updatePaymentSchema, listPaymentsQuerySchema } from "./payments.schema";
import * as paymentsService from "./payments.service";
import { authenticate } from "@/middlewares/auth";

export const paymentsRouter = Router();

paymentsRouter.use(authenticate);

paymentsRouter.get("/", async (req, res) => {
  const query = listPaymentsQuerySchema.parse(req.query);
  const payments = await paymentsService.listPayments(query);
  res.json(payments);
});

paymentsRouter.get("/:id", async (req, res) => {
  const payment = await paymentsService.getPayment(req.params.id);
  res.json(payment);
});

paymentsRouter.put("/:id", async (req, res) => {
  const input = updatePaymentSchema.parse(req.body);
  const payment = await paymentsService.updatePayment(req.params.id, input);
  res.json(payment);
});

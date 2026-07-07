import { Router } from "express";
import { createInsurerSchema, updateInsurerSchema } from "./insurers.schema";
import * as insurersService from "./insurers.service";
import { authenticate } from "@/middlewares/auth";

export const insurersRouter = Router();

insurersRouter.use(authenticate);

insurersRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const insurers = await insurersService.listInsurers(search);
  res.json(insurers);
});

insurersRouter.get("/:id", async (req, res) => {
  const insurer = await insurersService.getInsurer(req.params.id);
  res.json(insurer);
});

insurersRouter.post("/", async (req, res) => {
  const input = createInsurerSchema.parse(req.body);
  const insurer = await insurersService.createInsurer(input);
  res.status(201).json(insurer);
});

insurersRouter.put("/:id", async (req, res) => {
  const input = updateInsurerSchema.parse(req.body);
  const insurer = await insurersService.updateInsurer(req.params.id, input);
  res.json(insurer);
});

insurersRouter.delete("/:id", async (req, res) => {
  await insurersService.deleteInsurer(req.params.id);
  res.status(204).send();
});

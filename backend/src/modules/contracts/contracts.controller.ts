import { Router } from "express";
import { createContractSchema, updateContractSchema, listContractsQuerySchema } from "./contracts.schema";
import * as contractsService from "./contracts.service";
import { authenticate } from "@/middlewares/auth";

export const contractsRouter = Router();

contractsRouter.use(authenticate);

contractsRouter.get("/", async (req, res) => {
  const query = listContractsQuerySchema.parse(req.query);
  const contracts = await contractsService.listContracts(query);
  res.json(contracts);
});

contractsRouter.get("/:id", async (req, res) => {
  const contract = await contractsService.getContract(req.params.id);
  res.json(contract);
});

contractsRouter.post("/", async (req, res) => {
  const input = createContractSchema.parse(req.body);
  const contract = await contractsService.createContract(input, req.user?.sub);
  res.status(201).json(contract);
});

contractsRouter.put("/:id", async (req, res) => {
  const input = updateContractSchema.parse(req.body);
  const contract = await contractsService.updateContract(req.params.id, input);
  res.json(contract);
});

contractsRouter.delete("/:id", async (req, res) => {
  await contractsService.deleteContract(req.params.id);
  res.status(204).send();
});

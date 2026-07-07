import { Router } from "express";
import { createClientSchema, updateClientSchema } from "./clients.schema";
import * as clientsService from "./clients.service";
import { authenticate } from "@/middlewares/auth";

export const clientsRouter = Router();

clientsRouter.use(authenticate);

clientsRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const clients = await clientsService.listClients(search);
  res.json(clients);
});

clientsRouter.get("/:id", async (req, res) => {
  const client = await clientsService.getClient(req.params.id);
  res.json(client);
});

clientsRouter.post("/", async (req, res) => {
  const input = createClientSchema.parse(req.body);
  const client = await clientsService.createClient(input);
  res.status(201).json(client);
});

clientsRouter.put("/:id", async (req, res) => {
  const input = updateClientSchema.parse(req.body);
  const client = await clientsService.updateClient(req.params.id, input);
  res.json(client);
});

clientsRouter.delete("/:id", async (req, res) => {
  await clientsService.deleteClient(req.params.id);
  res.status(204).send();
});

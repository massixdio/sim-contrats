import { Router } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import * as authService from "./auth.service";
import { authenticate } from "@/middlewares/auth";
import { ApiError } from "@/utils/ApiError";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  res.status(201).json(result);
});

authRouter.post("/login", async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  res.json(result);
});

authRouter.get("/me", authenticate, async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await authService.getProfile(req.user.sub);
  res.json(profile);
});

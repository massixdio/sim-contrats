import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "@/utils/ApiError";
import { env } from "@/config/env";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Données invalides",
      details: err.flatten(),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Une ressource identique existe déjà" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Ressource introuvable" });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ message: "Cette ressource est liée à d'autres données et ne peut pas être supprimée" });
    }
  }

  console.error(err);
  return res.status(500).json({
    message: "Erreur interne du serveur",
    ...(env.nodeEnv === "development" && { stack: (err as Error).stack }),
  });
};

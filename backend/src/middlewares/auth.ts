import { RequestHandler } from "express";
import { verifyToken } from "@/utils/jwt";
import { ApiError } from "@/utils/ApiError";

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized();
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyToken(token);
  } catch {
    throw ApiError.unauthorized("Token invalide ou expiré");
  }
  next();
};

export function requireRole(...roles: Array<"ADMIN" | "AGENT">): RequestHandler {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden();
    }
    next();
  };
}

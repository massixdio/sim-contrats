import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/utils/password";
import { signToken } from "@/utils/jwt";
import { ApiError } from "@/utils/ApiError";
import { RegisterInput, LoginInput } from "./auth.schema";

function toPublicUser(user: { id: string; name: string; email: string; role: "ADMIN" | "AGENT" }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("Un utilisateur avec cet email existe déjà");
  }

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      role: input.role ?? "AGENT",
    },
  });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw ApiError.unauthorized("Identifiants invalides");
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw ApiError.unauthorized("Identifiants invalides");
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound("Utilisateur introuvable");
  }
  return toPublicUser(user);
}

import { api } from "./client";
import { User } from "@/types";

export interface AuthResponse {
  user: User;
  token: string;
}

export function login(email: string, password: string) {
  return api.post<AuthResponse>("/auth/login", { email, password }).then((res) => res.data);
}

export function register(name: string, email: string, password: string) {
  return api.post<AuthResponse>("/auth/register", { name, email, password }).then((res) => res.data);
}

export function getProfile() {
  return api.get<User>("/auth/me").then((res) => res.data);
}

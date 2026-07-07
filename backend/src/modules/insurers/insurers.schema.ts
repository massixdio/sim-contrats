import { z } from "zod";

export const createInsurerSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
});

export const updateInsurerSchema = createInsurerSchema.partial();

export type CreateInsurerInput = z.infer<typeof createInsurerSchema>;
export type UpdateInsurerInput = z.infer<typeof updateInsurerSchema>;

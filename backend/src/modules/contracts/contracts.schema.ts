import { z } from "zod";

const contractTypeEnum = z.enum(["AUTO", "HABITATION", "SANTE", "VIE", "RESPONSABILITE_CIVILE", "AUTRE"]);
const contractStatusEnum = z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"]);
const paymentFrequencyEnum = z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "ONE_TIME"]);

export const createContractSchema = z
  .object({
    contractNumber: z.string().min(1, "Numéro de contrat requis"),
    type: contractTypeEnum,
    status: contractStatusEnum.optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    premiumAmount: z.coerce.number().positive("Le montant doit être positif"),
    paymentFrequency: paymentFrequencyEnum,
    notes: z.string().optional(),
    clientId: z.string().uuid("Client invalide"),
    insurerId: z.string().uuid("Compagnie invalide"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"],
  });

export const updateContractSchema = z.object({
  contractNumber: z.string().min(1).optional(),
  type: contractTypeEnum.optional(),
  status: contractStatusEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  premiumAmount: z.coerce.number().positive().optional(),
  paymentFrequency: paymentFrequencyEnum.optional(),
  notes: z.string().optional(),
  clientId: z.string().uuid().optional(),
  insurerId: z.string().uuid().optional(),
});

export const listContractsQuerySchema = z.object({
  search: z.string().optional(),
  status: contractStatusEnum.optional(),
  type: contractTypeEnum.optional(),
  clientId: z.string().uuid().optional(),
  insurerId: z.string().uuid().optional(),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type ListContractsQuery = z.infer<typeof listContractsQuerySchema>;

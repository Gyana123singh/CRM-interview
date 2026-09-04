import { z } from "zod";

export const searchSchema = z.object({
  niche: z.string({
    required_error: "Business niche is required",
  }).min(1, "Business niche cannot be empty"),
  region: z.string({
    required_error: "Region is required",
  }).min(1, "Region cannot be empty"),
  platformFilter: z.string().optional().default("Any Platform"),
  count: z.preprocess(
    (val) => (val ? parseInt(val, 10) : 10),
    z.number().int().min(1).max(100).default(10)
  ),
});

export const saveLeadSchema = z.object({
  businessId: z.string({
    required_error: "Business ID is required",
  }).uuid("Invalid business ID format"),
  notes: z.string().optional(),
  leadListId: z.string().uuid().optional(),
});

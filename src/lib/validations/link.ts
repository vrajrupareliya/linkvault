import { url } from "inspector";
import z from "zod";
import { CampaignScalarFieldEnum } from "../../../generated/prisma/internal/prismaNamespace";

export const createLinkSchema = z.object({
    url: z.string().url("Must be a valid URL"),
    customSlug: z
        .string()
        .min(3)
        .max(20)
        .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only")
    .optional(),
  campaignId: z.string().cuid().optional(),        
});

export const updateLinkSchema = z.object({
    url: z.string().url("Must be a valid URL").optional(),
    campaignId: z.string().cuid().optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
import { z } from "zod";
import { isKnownCategory } from "@/lib/exchange/categories";
import { AVAILABILITY_REGIONS } from "@/lib/exchange/regions";
import { CERTIFICATION_CODES, LISTING_KINDS, ORG_KINDS } from "@/lib/exchange/types";

const regionEnum = z.enum(AVAILABILITY_REGIONS);

export const organizationOnboardSchema = z.object({
  legalName: z.string().min(2).max(200),
  tradeName: z.string().min(2).max(200).optional(),
  kind: z.enum(ORG_KINDS),
  registrationId: z.string().min(2).max(40),
  vatId: z.string().max(40).optional(),
  countryCode: z.string().length(2),
  website: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(40).optional(),
  contactPerson: z.string().min(2).max(120),
  availabilityRegions: z.array(regionEnum).min(1),
  sourceLocale: z.string().min(2).max(16),
  description: z.string().min(20).max(4000),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  acceptB2bOnly: z.literal(true),
  acceptNoPublicDrugs: z.literal(true),
  acceptNoPhi: z.literal(true),
});

export const listingCreateSchema = z
  .object({
    kind: z.enum(LISTING_KINDS),
    category: z.string().min(2).max(80),
    title: z.string().min(3).max(180),
    summary: z.string().min(20).max(400),
    description: z.string().min(40).max(8000),
    availabilityRegion: regionEnum,
    availabilityRegions: z.array(regionEnum).min(1).optional(),
    certifications: z.array(z.enum(CERTIFICATION_CODES)).default([]),
    certificationNotes: z.string().max(500).optional(),
    certificationNotApplicable: z.boolean().optional(),
    priceHint: z.string().max(80).optional(),
    currency: z.string().max(8).optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    documentationUrl: z.string().url().optional().or(z.literal("")),
    sourceLocale: z.string().min(2).max(16),
    organizationId: z.string().uuid().optional(),
    isPrescriptionMedicine: z.boolean().optional(),
    containsPhi: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (!isKnownCategory(value.category, value.kind)) {
      ctx.addIssue({ code: "custom", path: ["category"], message: "unknown_category" });
    }
    if (value.isPrescriptionMedicine) {
      ctx.addIssue({
        code: "custom",
        path: ["isPrescriptionMedicine"],
        message: "public_drug_sale_forbidden",
      });
    }
    if (value.containsPhi) {
      ctx.addIssue({ code: "custom", path: ["containsPhi"], message: "phi_forbidden" });
    }
    if (value.kind === "product" && !value.certificationNotApplicable && value.certifications.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["certifications"],
        message: "certification_required",
      });
    }
    if (value.kind !== "product" && value.certificationNotApplicable && !value.certificationNotes?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["certificationNotes"],
        message: "certification_justification_required",
      });
    }
  });

export const contactInquirySchema = z.object({
  listingSlug: z.string().min(2).max(160),
  buyerOrganization: z.string().min(2).max(200),
  buyerName: z.string().min(2).max(120),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().max(40).optional(),
  message: z.string().min(20).max(4000),
  locale: z.string().max(16).optional(),
  acceptTerms: z.literal(true),
  acceptNoPhi: z.literal(true),
});

export const listingQuerySchema = z.object({
  q: z.string().max(120).optional(),
  kind: z.enum([...LISTING_KINDS, "any"]).optional(),
  category: z.string().max(80).optional(),
  regions: z.array(regionEnum).optional(),
  locale: z.string().max(16).optional(),
  featured: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const adminDecisionSchema = z.object({
  listingId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().max(500).optional(),
});

export type OrganizationOnboardInput = z.infer<typeof organizationOnboardSchema>;
export type ListingCreateInput = z.infer<typeof listingCreateSchema>;
export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;

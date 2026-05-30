import { z } from "zod";
import { medicalSpecializations } from "./specializations";

export const registerSchema = z.object({
  email: z.string().email("Neplatný e-mail"),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků"),
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  role: z.enum(["reader", "expert"]),
  institution: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email("Neplatný e-mail"),
  password: z.string().min(1, "Heslo je povinné")
});

export const articleSectionSchema = z.object({
  id: z.string(),
  heading: z.string().min(1),
  content: z.string().min(1),
  highlights: z.array(z.string()).optional()
});

export const citationSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  authors: z.string().optional(),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  doi: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional()
});

export const articleInputSchema = z.object({
  title: z.string().min(5, "Nadpis musí mít alespoň 5 znaků"),
  summary: z.string().min(20, "Shrnutí musí mít alespoň 20 znaků"),
  sections: z.array(articleSectionSchema).min(1),
  clinicalSignificance: z.string().min(20),
  practiceRecommendations: z.string().min(20),
  citations: z.array(citationSchema).min(1, "Článek musí obsahovat alespoň jednu citaci"),
  tags: z.array(z.string()).default([]),
  icdCodes: z.array(z.string()).default([]),
  specialization: z.enum(medicalSpecializations as unknown as [string, ...string[]])
});

export const generateArticleSchema = z.object({
  topic: z.string().min(3),
  keywords: z.array(z.string()).default([]),
  specialization: z.enum(medicalSpecializations as unknown as [string, ...string[]])
});

export const ratingSchema = z.object({
  score: z.number().int().min(1).max(5)
});

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

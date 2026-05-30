import { z } from "zod";

export const analyticsEventSchema = z.object({
  name: z.enum(["visit", "engagement", "registration", "login", "article_view", "event_view", "calendar_click", "form_submission", "ab_exposure", "ab_conversion"]),
  role: z.enum(["doctor", "student", "scientist", "partner"]).optional(),
  segment: z.string().max(120).optional(),
  source: z.string().max(120).optional(),
  value: z.record(z.string(), z.unknown()).default({})
});
export type AnalyticsPayload = z.infer<typeof analyticsEventSchema>;

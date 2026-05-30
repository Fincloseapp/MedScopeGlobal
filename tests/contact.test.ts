import { describe, expect, it } from "vitest";
import { contactSubmissionSchema, eventSubmissionSchema } from "@/lib/contact";
describe("form validation", () => {
  it("accepts valid contact payloads", () => { const parsed = contactSubmissionSchema.safeParse({ name: "Eva Horáková", email: "EVA@EXAMPLE.COM", role: "doctor", topic: "Dotaz", message: "Prosím o více informací k platformě.", website: "" }); expect(parsed.success).toBe(true); expect(parsed.success && parsed.data.email).toBe("eva@example.com"); });
  it("rejects spam honeypot payloads", () => { const parsed = contactSubmissionSchema.safeParse({ name: "Bot", email: "bot@example.com", topic: "Spam", message: "Automated spam message", website: "https://spam.example" }); expect(parsed.success).toBe(false); });
  it("requires event end after start", () => { const parsed = eventSubmissionSchema.safeParse({ title: "Medical Forum", description: "A valid long event description for review.", region: "Česko", format: "online", specialization: "Kardiologie", startsAt: "2026-09-18T09:00:00+02:00", endsAt: "2026-09-18T08:00:00+02:00", organizer: "MedScope", contactEmail: "events@example.com", website: "" }); expect(parsed.success).toBe(false); });
});

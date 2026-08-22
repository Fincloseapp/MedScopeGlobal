import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export type VerificationStatus = "pending" | "verified" | "rejected" | "none";

export type VerificationMethod = "id_photo" | "license" | "facility_ico" | "work_email";

export type DoctorVerification = {
  status: VerificationStatus;
  methods: VerificationMethod[];
  licenseNumber?: string | null;
  facilityIco?: string | null;
  workEmail?: string | null;
  idPhotoPath?: string | null;
  idOcrSummary?: Record<string, unknown> | null;
  reviewerNote?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
};

const WORK_EMAIL_HINTS = [
  "nemocnice",
  "hospital",
  "klinika",
  "clinic",
  "fn.",
  "fakultni",
  "zdravotni",
  "medico",
  "med.",
];

function looksLikeWorkEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain || domain.includes("gmail.") || domain.includes("seznam.") || domain.includes("outlook.")) {
    return false;
  }
  return WORK_EMAIL_HINTS.some((h) => domain.includes(h)) || domain.endsWith(".cz");
}

/** Heuristic OCR stub — never blocks onboarding when OPENAI missing. */
export function stubIdOcr(fileName?: string | null): Record<string, unknown> {
  return {
    engine: "heuristic-stub",
    fileName: fileName ?? null,
    documentTypeGuess: "id_card_or_license",
    confidence: 0.35,
    note: "OCR stub — ruční / pozdější kontrola. OPENAI není vyžadováno.",
  };
}

export async function getDoctorVerification(userId: string): Promise<DoctorVerification> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { status: "none", methods: [] };
  }

  const { data } = await admin
    .from("mediktor_doctor_verifications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    const { data: user } = await admin
      .from("users")
      .select("verified_doctor, mediktor_verification_status, verification_status, clk_id")
      .eq("id", userId)
      .maybeSingle();
    if (user?.verified_doctor) {
      return { status: "verified", methods: ["license"] };
    }
    const raw = String(
      user?.mediktor_verification_status || user?.verification_status || "none"
    );
    const status: VerificationStatus =
      raw === "approved" || raw === "verified"
        ? "verified"
        : raw === "pending"
          ? "pending"
          : raw === "rejected"
            ? "rejected"
            : "none";
    return {
      status,
      methods: user?.clk_id ? ["license"] : [],
      licenseNumber: (user?.clk_id as string) ?? null,
    };
  }

  return {
    status: data.status as VerificationStatus,
    methods: (data.methods as VerificationMethod[]) ?? [],
    licenseNumber: data.license_number,
    facilityIco: data.facility_ico,
    workEmail: data.work_email,
    idPhotoPath: data.id_photo_path,
    idOcrSummary: data.id_ocr_summary as Record<string, unknown> | null,
    reviewerNote: data.reviewer_note,
    submittedAt: data.submitted_at,
    reviewedAt: data.reviewed_at,
  };
}

export async function submitDoctorVerification(opts: {
  userId: string;
  methods: VerificationMethod[];
  licenseNumber?: string | null;
  facilityIco?: string | null;
  workEmail?: string | null;
  idPhotoPath?: string | null;
  idFileName?: string | null;
}): Promise<
  | { ok: true; verification: DoctorVerification }
  | { ok: false; error: string; status: number }
> {
  if (!opts.methods.length) {
    return { ok: false, error: "Vyberte alespoň jeden způsob ověření.", status: 400 };
  }

  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { ok: false, error: "Služba dočasně nedostupná.", status: 503 };
  }

  let autoVerified = false;
  const notes: string[] = [];

  if (opts.methods.includes("license") && opts.licenseNumber?.trim()) {
    const lic = opts.licenseNumber.replace(/\s+/g, "");
    if (lic.length >= 5) {
      notes.push("licence_submitted");
    }
  }

  if (opts.methods.includes("facility_ico") && opts.facilityIco?.trim()) {
    const ico = opts.facilityIco.replace(/\s+/g, "");
    if (/^\d{8}$/.test(ico)) {
      notes.push("ico_format_ok");
    } else {
      return { ok: false, error: "IČO musí mít 8 číslic.", status: 400 };
    }
  }

  if (opts.methods.includes("work_email") && opts.workEmail?.trim()) {
    const email = opts.workEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Neplatný pracovní e-mail.", status: 400 };
    }
    if (looksLikeWorkEmail(email)) {
      notes.push("work_email_domain_ok");
      // Soft auto-verify for clear institutional domains; still pending review flag in metadata
      autoVerified = false;
    }
  }

  const idOcr = opts.methods.includes("id_photo")
    ? stubIdOcr(opts.idFileName)
    : null;

  const row = {
    user_id: opts.userId,
    status: "pending" as const,
    methods: opts.methods,
    license_number: opts.licenseNumber?.trim() || null,
    facility_ico: opts.facilityIco?.replace(/\s+/g, "") || null,
    work_email: opts.workEmail?.trim().toLowerCase() || null,
    id_photo_path: opts.idPhotoPath || null,
    id_ocr_summary: idOcr ? { ...idOcr, checks: notes } : { checks: notes },
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reviewed_at: autoVerified ? new Date().toISOString() : null,
  };

  const { error } = await admin.from("mediktor_doctor_verifications").upsert(row, {
    onConflict: "user_id",
  });

  if (error) {
    return { ok: false, error: error.message, status: 500 };
  }

  await admin
    .from("users")
    .update({
      mediktor_verification_status: "pending",
      verification_status: "pending",
      access_level: "physician",
    })
    .eq("id", opts.userId);

  // Soft-set clk_id only when provided
  if (opts.licenseNumber?.trim()) {
    await admin
      .from("users")
      .update({ clk_id: opts.licenseNumber.replace(/\s+/g, "") })
      .eq("id", opts.userId);
  }

  return {
    ok: true,
    verification: {
      status: "pending",
      methods: opts.methods,
      licenseNumber: row.license_number,
      facilityIco: row.facility_ico,
      workEmail: row.work_email,
      idPhotoPath: row.id_photo_path,
      idOcrSummary: row.id_ocr_summary,
      submittedAt: row.submitted_at,
    },
  };
}

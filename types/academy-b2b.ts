/** MedScope Academy B2B CME — Lékařská zóna types */

export type MedicalSpecialization =
  | "revmatologie"
  | "prakticke_lekarstvi"
  | "interna"
  | "chirurgie"
  | "pediatrie"
  | "gynekologie"
  | "neurologie"
  | "psychiatrie"
  | "anesteziologie"
  | "radiologie"
  | "dermatologie"
  | "ortopedie"
  | "kardiologie"
  | "onkologie"
  | "ostatni";

/** Full list for ČLK verification form. */
export const MEDICAL_SPECIALIZATIONS: ReadonlyArray<{
  value: MedicalSpecialization;
  label: string;
}> = [
  { value: "revmatologie", label: "Revmatologie" },
  { value: "prakticke_lekarstvi", label: "Praktické lékařství" },
  { value: "interna", label: "Interna" },
  { value: "chirurgie", label: "Chirurgie" },
  { value: "pediatrie", label: "Pediatrie" },
  { value: "gynekologie", label: "Gynekologie a porodnictví" },
  { value: "neurologie", label: "Neurologie" },
  { value: "psychiatrie", label: "Psychiatrie" },
  { value: "anesteziologie", label: "Anesteziologie a intenzivní medicína" },
  { value: "radiologie", label: "Radiologie" },
  { value: "dermatologie", label: "Dermatologie" },
  { value: "ortopedie", label: "Ortopedie" },
  { value: "kardiologie", label: "Kardiologie" },
  { value: "onkologie", label: "Onkologie" },
  { value: "ostatni", label: "Ostatní" },
] as const;

/** Public-facing accredited CME catalog focus (rheumatology-only). */
export const CME_FOCUS_SPECIALTY = {
  value: "revmatologie" as const,
  label: "Revmatologie",
};

export interface PhysicianProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  clk_id: string | null;
  specialization: MedicalSpecialization | string | null;
  verified_doctor: boolean;
}

export interface PartnerInstitution {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  contact_email: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Accredited B2B course fields layered on AcademyCourse */
export interface B2BCourseFields {
  accreditation_number: string | null;
  credits_count: number;
  partner_institution_id: string | null;
  requires_verified_doctor: boolean;
  passing_threshold: number;
}

export interface B2BCourse extends B2BCourseFields {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  cover_image_url: string | null;
  partner?: PartnerInstitution | null;
  modules?: CourseModule[];
}

export interface QuizQuestionOption {
  label: string;
  value: string;
}

export interface QuizBankQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options: QuizQuestionOption[];
  correct_answer: { value: string } | Record<string, unknown>;
  sort_order: number;
  explanation: string | null;
}

/** Client-safe question (no correct_answer) */
export interface QuizQuestionPublic {
  id: string;
  question_text: string;
  question_type: QuizBankQuestion["question_type"];
  options: QuizQuestionOption[];
  sort_order: number;
}

export interface QuizAttemptSession {
  attempt_id: string;
  quiz_id: string;
  attempt_number: number;
  attempts_count: number;
  max_attempts: number | null;
  passing_threshold: number;
  questions: QuizQuestionPublic[];
  video_unlocked: boolean;
}

export interface QuizAttemptSubmitInput {
  attempt_id: string;
  answers: Array<{ question_id: string; value: string }>;
}

export interface QuizAttemptSubmitResult {
  attempt_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  passing_threshold: number;
  correct_count: number;
  total_count: number;
  attempts_count: number;
  certificate_id?: string;
  certificate_code?: string;
}

export interface CmeCertificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_code: string;
  issued_at: string;
  clk_id: string | null;
  accreditation_number: string | null;
  credits_earned: number;
  partner_institution_id: string | null;
  physician_full_name: string | null;
  pdf_storage_path: string | null;
  metadata: Record<string, unknown>;
}

export interface CmeCertificatePdfData {
  physicianFullName: string;
  clkId: string;
  courseTitle: string;
  partnerInstitutionName: string;
  partnerLogoUrl?: string | null;
  accreditationNumber: string;
  creditsEarned: number;
  completionDate: Date;
  certificateCode: string;
}

export type ReportPeriod = "monthly" | "quarterly";

export interface ClkExportRow {
  firstName: string;
  lastName: string;
  clkId: string;
  courseTitle: string;
  accreditationNumber: string;
  completionDate: string;
}

export interface PartnerReportQuery {
  partnerInstitutionId: string;
  period: ReportPeriod;
  /** ISO date — start of period window (inclusive) */
  from: string;
  /** ISO date — end of period window (exclusive) */
  to: string;
  format?: "csv" | "xlsx";
}

export interface LessonWatchProgress {
  lesson_id: string;
  max_watched_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
}

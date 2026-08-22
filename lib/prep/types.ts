import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";

export type PrepDifficulty = "zaklad" | "stredni" | "narocne";
export type PrepMode = "learn" | "drill" | "mini" | "simulation" | "rapid" | "pexeso";
export type PrepScoring = "plus1" | "plusMinus";

export type PrepQuestion = {
  id: string;
  subject: PrepSubject;
  chapterId: string;
  topic: string;
  difficulty: PrepDifficulty;
  prompt: string;
  options: string[];
  /** 0-based; used when a single answer is correct */
  correctIndex: number;
  /** If set, more than one option may be correct (MUNI-like training). */
  correctIndices?: number[];
  explanation: string;
  /** Empty / omitted = suitable for every Czech LF. */
  faculties?: string[];
};

export type PrepChapter = {
  id: string;
  subject: PrepSubject;
  title: string;
  summary: string;
  studyHint: string;
  order: number;
};

export type PrepExamBlock = {
  subject: PrepSubject;
  count: number;
  minutes: number;
};

export type PrepFacultyProfile = {
  slug: string;
  shortName: string;
  name: string;
  city: string;
  accent: string;
  examStyle: string;
  emphasis: string[];
  simulation: {
    label: string;
    scoring: PrepScoring;
    passingPct: number;
    blocks: PrepExamBlock[];
    officialHint: string;
  };
};

export type PrepAttempt = {
  id: string;
  at: string;
  mode: PrepMode;
  facultySlug: string | null;
  title: string;
  subjects: PrepSubject[];
  correct: number;
  total: number;
  scorePct: number;
  durationSec: number;
  timedOut: boolean;
  weakTopics: string[];
};

export type PrepTopicStat = {
  topic: string;
  subject: PrepSubject;
  seen: number;
  correct: number;
};

export type PrepProgress = {
  version: 1;
  facultySlug: string | null;
  attempts: PrepAttempt[];
  topicStats: Record<string, PrepTopicStat>;
  completedChapters: string[];
  seenQuestionIds: string[];
};

export type GeneratedPrepTest = {
  id: string;
  title: string;
  mode: PrepMode;
  facultySlug: string | null;
  scoring: PrepScoring;
  passingPct: number;
  minutes: number | null;
  subjects: PrepSubject[];
  questions: PrepQuestion[];
};

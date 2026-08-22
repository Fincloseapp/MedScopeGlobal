import { PREP_QUESTIONS } from "@/lib/prep/questions";
import { getPrepFaculty, simulationTotals } from "@/lib/prep/faculties";
import type { GeneratedPrepTest, PrepMode, PrepQuestion } from "@/lib/prep/types";
import type { PrepDifficulty } from "@/lib/prep/types";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";
import { subjectLabel } from "@/lib/prijimacky/faculties-admissions";

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: string) {
  let h = hashSeed(seed) || 1;
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const arr = items.slice();
  const rnd = rng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickQuestions(opts: {
  subjects?: PrepSubject[];
  chapterId?: string;
  topic?: string;
  difficulty?: PrepDifficulty | "all";
  facultySlug?: string | null;
  limit: number;
  seed: string;
  preferUnseen?: string[];
  includeMulti?: boolean;
}): PrepQuestion[] {
  let pool = PREP_QUESTIONS.slice();
  if (opts.subjects?.length) {
    const set = new Set(opts.subjects);
    pool = pool.filter((q) => set.has(q.subject));
  }
  if (opts.chapterId) pool = pool.filter((q) => q.chapterId === opts.chapterId);
  if (opts.topic) pool = pool.filter((q) => q.topic === opts.topic);
  if (opts.difficulty && opts.difficulty !== "all") {
    pool = pool.filter((q) => q.difficulty === opts.difficulty);
  }
  if (!opts.includeMulti) {
    pool = pool.filter((q) => !q.correctIndices?.length);
  } else if (opts.facultySlug === "lf-mu") {
    const multi = pool.filter((q) => q.correctIndices?.length);
    const rest = pool.filter((q) => !q.correctIndices?.length);
    pool = [...multi, ...rest];
  }
  if (opts.facultySlug) {
    pool = pool.filter((q) => !q.faculties?.length || q.faculties.includes(opts.facultySlug!));
  }

  const unseen = opts.preferUnseen?.length ? new Set(opts.preferUnseen) : null;
  const primary = unseen ? pool.filter((q) => !unseen.has(q.id)) : pool;
  const fallback = unseen ? pool.filter((q) => unseen.has(q.id)) : [];
  const ordered = shuffleWithSeed([...primary, ...fallback], opts.seed);
  return ordered.slice(0, Math.min(opts.limit, ordered.length));
}

export function generatePrepTest(opts: {
  mode: PrepMode;
  subjects?: PrepSubject[];
  chapterId?: string;
  topic?: string;
  difficulty?: PrepDifficulty | "all";
  facultySlug?: string | null;
  count?: number;
  minutes?: number | null;
  seed: string;
  seenIds?: string[];
}): GeneratedPrepTest {
  const faculty = opts.facultySlug ? getPrepFaculty(opts.facultySlug) : undefined;

  if (opts.mode === "simulation" && faculty) {
    const totals = simulationTotals(faculty);
    const includeMulti = faculty.slug === "lf-mu";
    let questions: PrepQuestion[] = [];
    if (totals.mixed) {
      for (const subject of ["biologie", "chemie", "fyzika"] as PrepSubject[]) {
        questions = questions.concat(
          pickQuestions({
            subjects: [subject],
            limit: 18,
            seed: `${opts.seed}-${subject}`,
            facultySlug: faculty.slug,
            includeMulti,
            preferUnseen: opts.seenIds,
          })
        );
      }
    } else {
      for (const block of faculty.simulation.blocks) {
        questions = questions.concat(
          pickQuestions({
            subjects: [block.subject],
            limit: block.count,
            seed: `${opts.seed}-${block.subject}`,
            facultySlug: faculty.slug,
            includeMulti,
            preferUnseen: opts.seenIds,
          })
        );
      }
    }
    return {
      id: `sim-${faculty.slug}-${opts.seed}`,
      title: faculty.simulation.label,
      mode: "simulation",
      facultySlug: faculty.slug,
      scoring: faculty.simulation.scoring,
      passingPct: faculty.simulation.passingPct,
      minutes: totals.minutes,
      subjects: totals.mixed
        ? (["biologie", "chemie", "fyzika"] as PrepSubject[])
        : faculty.simulation.blocks.map((b) => b.subject),
      questions,
    };
  }

  const subjects = opts.subjects?.length
    ? opts.subjects
    : (["biologie", "chemie", "fyzika"] as PrepSubject[]);
  const count = opts.count ?? (opts.mode === "learn" ? 8 : opts.mode === "drill" ? 10 : 15);
  const questions = pickQuestions({
    subjects,
    chapterId: opts.chapterId,
    topic: opts.topic,
    difficulty: opts.difficulty ?? "all",
    facultySlug: opts.facultySlug,
    limit: count,
    seed: opts.seed,
    preferUnseen: opts.seenIds,
    includeMulti: false,
  });

  const title =
    opts.mode === "learn"
      ? "Mini test kapitoly"
      : opts.mode === "drill"
        ? `Drill · ${opts.topic ?? "téma"}`
        : opts.mode === "rapid"
          ? "Rychlý kvíz"
          : subjects.length === 3
            ? "Smíšený test B/C/F"
            : subjects.map(subjectLabel).join(" + ");

  const minutes =
    opts.minutes ??
    (opts.mode === "mini" || opts.mode === "simulation" ? Math.max(8, Math.round(questions.length * 0.9)) : null);

  return {
    id: `${opts.mode}-${opts.seed}`,
    title,
    mode: opts.mode,
    facultySlug: opts.facultySlug ?? null,
    scoring: "plus1",
    passingPct: 70,
    minutes,
    subjects,
    questions,
  };
}

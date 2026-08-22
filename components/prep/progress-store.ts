"use client";

import { useCallback, useEffect, useState } from "react";
import type { PrepAttempt, PrepProgress, PrepTopicStat } from "@/lib/prep/types";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";

const KEY = "medscope-prep-progress-v1";

const EMPTY: PrepProgress = {
  version: 1,
  facultySlug: null,
  attempts: [],
  topicStats: {},
  completedChapters: [],
  seenQuestionIds: [],
};

let boundUserId: string | null = null;

function storageKey(userId: string | null = boundUserId) {
  return userId ? `${KEY}:${userId}` : KEY;
}

function isPopulated(p: PrepProgress) {
  return Boolean(
    p.facultySlug ||
      p.attempts.length ||
      p.completedChapters.length ||
      Object.keys(p.topicStats).length
  );
}

function readKey(key: string): PrepProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as PrepProgress;
    if (parsed.version !== 1) return EMPTY;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function read(): PrepProgress {
  return readKey(storageKey());
}

function write(next: PrepProgress) {
  window.localStorage.setItem(storageKey(), JSON.stringify(next));
  window.dispatchEvent(new Event("medscope-prep-progress"));
}

/** Attach progress to the signed-in MedScopeGlobal user and migrate anonymous data once. */
export function bindPrepProgressUser(userId: string | null) {
  if (typeof window === "undefined") return;
  boundUserId = userId;
  if (userId) {
    const userData = readKey(storageKey(userId));
    const anon = readKey(KEY);
    if (!isPopulated(userData) && isPopulated(anon)) {
      window.localStorage.setItem(storageKey(userId), JSON.stringify(anon));
    }
  }
  window.dispatchEvent(new Event("medscope-prep-progress"));
}

export function usePrepProgress() {
  const [progress, setProgress] = useState<PrepProgress>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(read());
    setReady(true);
    const on = () => setProgress(read());
    window.addEventListener("medscope-prep-progress", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("medscope-prep-progress", on);
      window.removeEventListener("storage", on);
    };
  }, []);

  const save = useCallback((patch: Partial<PrepProgress> | ((p: PrepProgress) => PrepProgress)) => {
    setProgress((prev) => {
      const base = read();
      const next = typeof patch === "function" ? patch(base) : { ...base, ...patch };
      write(next);
      return next;
    });
  }, []);

  const setFaculty = useCallback(
    (slug: string | null) => {
      save({ facultySlug: slug });
    },
    [save]
  );

  const recordAttempt = useCallback(
    (
      attempt: PrepAttempt,
      questionIds: string[],
      topicDelta: Array<{ topic: string; subject: PrepSubject; ok: boolean }>
    ) => {
      save((p) => {
        const topicStats = { ...p.topicStats };
        for (const row of topicDelta) {
          const prev: PrepTopicStat = topicStats[row.topic] ?? {
            topic: row.topic,
            subject: row.subject,
            seen: 0,
            correct: 0,
          };
          topicStats[row.topic] = {
            ...prev,
            seen: prev.seen + 1,
            correct: prev.correct + (row.ok ? 1 : 0),
          };
        }
        const seen = new Set([...p.seenQuestionIds, ...questionIds]);
        return {
          ...p,
          attempts: [attempt, ...p.attempts].slice(0, 80),
          topicStats,
          seenQuestionIds: [...seen].slice(-800),
        };
      });
    },
    [save]
  );

  const completeChapter = useCallback(
    (chapterId: string) => {
      save((p) => ({
        ...p,
        completedChapters: p.completedChapters.includes(chapterId)
          ? p.completedChapters
          : [...p.completedChapters, chapterId],
      }));
    },
    [save]
  );

  return { progress, ready, setFaculty, recordAttempt, completeChapter, save };
}

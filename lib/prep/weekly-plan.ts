import { PREP_CHAPTERS } from "@/lib/prep/curriculum";
import type { PrepProgress } from "@/lib/prep/types";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";
import { subjectLabel } from "@/lib/prijimacky/faculties-admissions";

export type WeeklyTask = {
  id: string;
  day: string;
  title: string;
  why: string;
  href: string;
  minutes: number;
};

const DAYS = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

function weakestTopics(progress: PrepProgress, n: number): Array<{ topic: string; subject: PrepSubject }> {
  return Object.values(progress.topicStats)
    .filter((t) => t.seen >= 2)
    .sort((a, b) => a.correct / a.seen - b.correct / b.seen)
    .slice(0, n)
    .map((t) => ({ topic: t.topic, subject: t.subject }));
}

function nextChapter(progress: PrepProgress): (typeof PREP_CHAPTERS)[number] {
  return PREP_CHAPTERS.find((c) => !progress.completedChapters.includes(c.id)) ?? PREP_CHAPTERS[0];
}

export function buildWeeklyPlan(progress: PrepProgress, facultySlug: string | null): WeeklyTask[] {
  const weak = weakestTopics(progress, 3);
  const chapter = nextChapter(progress);
  const facultyQ = facultySlug ? `&faculty=${encodeURIComponent(facultySlug)}` : "";
  const simHref = facultySlug
    ? `/app/priprava?tab=testy&mode=simulation&faculty=${encodeURIComponent(facultySlug)}`
    : "/app/priprava?tab=testy&mode=simulation";

  const drill = (topic: string, subject: PrepSubject, day: string, id: string): WeeklyTask => ({
    id,
    day,
    title: `Drill: ${topic}`,
    why: `Nejvíc bodů teď ztrácíte v ${subjectLabel(subject).toLowerCase()} — ${topic.toLowerCase()}.`,
    href: `/app/priprava?tab=testy&mode=drill&topic=${encodeURIComponent(topic)}&subject=${subject}`,
    minutes: 12,
  });

  const tasks: WeeklyTask[] = [
    {
      id: "mon-learn",
      day: DAYS[0],
      title: `Kapitola: ${chapter.title}`,
      why: "Nejdřív krátký výklad, hned potom 8 otázek se zpětnou vazbou.",
      href: `/app/priprava?tab=uceni&chapter=${chapter.id}`,
      minutes: 20,
    },
    weak[0]
      ? drill(weak[0].topic, weak[0].subject, DAYS[1], "tue-drill")
      : {
          id: "tue-bio",
          day: DAYS[1],
          title: "Mini test biologie",
          why: "Bez statistiky začínáme od buňky a genetiky — základ každé LF.",
          href: `/app/priprava?tab=testy&mode=mini&subject=biologie&count=12${facultyQ}`,
          minutes: 15,
        },
    {
      id: "wed-chem",
      day: DAYS[2],
      title: "Chemie nanečisto",
      why: "Výpočty a pH se neudrží čtením — potřebují tempo.",
      href: `/app/priprava?tab=testy&mode=mini&subject=chemie&count=12${facultyQ}`,
      minutes: 15,
    },
    weak[1]
      ? drill(weak[1].topic, weak[1].subject, DAYS[3], "thu-drill")
      : {
          id: "thu-fyz",
          day: DAYS[3],
          title: "Fyzika — jednotky a vztahy",
          why: "Většina ztrát ve fyzice je ze záměny vzorce, ne z „těžké“ teorie.",
          href: `/app/priprava?tab=testy&mode=mini&subject=fyzika&count=12${facultyQ}`,
          minutes: 15,
        },
    {
      id: "fri-sim",
      day: DAYS[4],
      title: facultySlug ? "Simulace vaší fakulty" : "Smíšená simulace B/C/F",
      why: "Jednou týdně celý odpočet. Po odevzdání uvidíte slabá místa na další týden.",
      href: simHref,
      minutes: 50,
    },
    {
      id: "sat-game",
      day: DAYS[5],
      title: "Pexeso pojmů + rychlý kvíz",
      why: "Nízká zátěž, vysoké udržení názvosloví.",
      href: "/app/priprava?tab=hry",
      minutes: 15,
    },
    {
      id: "sun-review",
      day: DAYS[6],
      title: weak[2] ? `Opakování: ${weak[2].topic}` : "Volné opakování kapitoly",
      why: "Neděle je na mezery, ne na novou látku.",
      href: weak[2]
        ? `/app/priprava?tab=testy&mode=drill&topic=${encodeURIComponent(weak[2].topic)}&subject=${weak[2].subject}`
        : `/app/priprava?tab=uceni&chapter=${chapter.id}`,
      minutes: 15,
    },
  ];

  return tasks;
}

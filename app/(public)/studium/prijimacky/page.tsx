import Link from "next/link";

import type { Metadata } from "next";

import { ArrowRight, GraduationCap } from "lucide-react";

import { CourseCard } from "@/components/academy/course-card";

import { CZ_MEDICAL_FACULTIES } from "@/lib/v25/universities-data";

import { getCourseVideoFlags, listPublishedCourses } from "@/lib/academy/db";



export const metadata: Metadata = {

  title: "Přijímačky na medicínu",

  description: "Přehled přijímaček na české lékařské fakulty — odkazy na oficiální informace a přípravné kurzy Academy.",

};



export const revalidate = 120;



const TIPS = [

  "Sledujte termíny přihlášek a přijímacích zkoušek na webu každé fakulty.",

  "Připravte se na testy z biologie, chemie a fyziky podle aktuálních sylabů LF.",

  "Ověřte požadavky na zdravotní způsobilost a jazykové předpoklady.",

];



export default async function PrijimackyPage() {

  const prepCourses = await listPublishedCourses(6, { prepOnly: true });

  const flags = await getCourseVideoFlags(prepCourses.map((c) => c.id));



  return (

    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">

      <nav className="text-sm text-muted-foreground">

        <Link href="/studium" className="hover:text-foreground">

          Studium

        </Link>

        <span className="mx-2">/</span>

        <span>Přijímačky</span>

      </nav>



      <div className="mt-4 rounded-2xl bg-[#f0f7ff] p-6">

        <h1 className="font-display text-4xl font-bold text-[#021d33]">Přijímačky na medicínu</h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">

          Orientační přehled — vždy ověřte aktuální podmínky na oficiálním webu vybrané fakulty.

        </p>

      </div>



      <section className="mt-8 rounded-2xl border border-[#005B96]/20 bg-gradient-to-br from-[#005B96]/5 to-white p-6 sm:p-8">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div className="max-w-xl">

            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">

              MedScope Academy

            </p>

            <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">

              Přípravné kurzy MedScope Academy

            </h2>

            <p className="mt-2 text-sm text-slate-600">

              Biologie, chemie, fyzika, testové strategie, ústní pohovor a další — zdarma s lekcemi a kvízy pro

              zájemce o studium medicíny.

            </p>

          </div>

          <GraduationCap className="hidden h-12 w-12 text-[#005B96]/40 sm:block" />

        </div>



        {prepCourses.length > 0 ? (

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {prepCourses.map((course) => (

              <CourseCard

                key={course.id}

                course={course}

                hasVideo={flags[course.id]?.hasVideo}

                videoLessonCount={flags[course.id]?.videoLessonCount}

              />

            ))}

          </div>

        ) : null}



        <div className="mt-6 flex flex-wrap gap-3">

          <Link

            href="/academy/courses?category=prijimacky"

            className="inline-flex items-center rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#004a7a]"

          >

            Všechny přípravné kurzy

            <ArrowRight className="ml-2 h-4 w-4" />

          </Link>

          <Link

            href="/academy/priprava"

            className="inline-flex items-center rounded-full border border-[#005B96]/30 px-5 py-2.5 text-sm font-medium text-[#005B96] hover:bg-[#005B96]/5"

          >

            Příprava na přijímačky

          </Link>

        </div>

      </section>



      <ul className="mt-8 space-y-3 rounded-2xl border bg-white p-6">

        {TIPS.map((tip) => (

          <li key={tip} className="flex gap-2 text-sm text-slate-700">

            <span className="text-primary">•</span>

            {tip}

          </li>

        ))}

      </ul>



      <h2 className="mt-10 text-xl font-semibold text-[#021d33]">Fakulty — přijímačky</h2>

      <div className="mt-4 grid gap-3 md:grid-cols-2">

        {CZ_MEDICAL_FACULTIES.map((f) => (

          <div key={f.slug} className="rounded-xl border bg-white p-4">

            <p className="font-medium">{f.shortName}</p>

            <p className="text-sm text-muted-foreground">{f.city}</p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">

              <Link href={`/studium/univerzity/${f.slug}`} className="text-primary hover:underline">

                Detail fakulty

              </Link>

              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">

                Oficiální web →

              </a>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}


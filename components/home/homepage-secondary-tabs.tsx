"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HomepageSecondaryTabs({ isCs }: { isCs: boolean }) {
  return (
    <section className="border-t border-[#dfeaf5] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
          {isCs ? "Další sekce" : "More sections"}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
          {isCs ? "Academy, B2B a novinky" : "Academy, B2B & news"}
        </h2>

        <Tabs defaultValue="news" className="mt-6">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="academy">{isCs ? "Academy" : "Academy"}</TabsTrigger>
            <TabsTrigger value="b2b">B2B</TabsTrigger>
            <TabsTrigger value="news">{isCs ? "Novinky" : "News"}</TabsTrigger>
          </TabsList>

          <TabsContent value="academy" className="mt-4 rounded-2xl border border-[#cfe1f3] bg-[#f8fbff] p-6">
            <p className="text-sm text-slate-600">
              {isCs
                ? "MedScope Academy — kurzy pro přijímačky, kvízy a certifikáty. Začněte přípravou na LF."
                : "MedScope Academy — pre-med courses, quizzes and certificates."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link href="/medicina/priprava" className="rounded-full bg-[#005B96] px-3 py-1 text-white">
                {isCs ? "Příprava LF" : "Pre-med"}
              </Link>
              <Link href="/medicina/studium" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
                {isCs ? "Studium" : "Med school"}
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="b2b" className="mt-4 rounded-2xl border border-[#cfe1f3] bg-[#f8fbff] p-6">
            <p className="text-sm text-slate-600">
              {isCs
                ? "Banner od 5 000 Kč/měs., sponzorovaný článek 15 000 Kč — transparentní B2B ceník."
                : "Banners from 5,000 CZK/month, sponsored articles 15,000 CZK."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link href="/firmy/cenik" className="rounded-full bg-[#005B96] px-3 py-1 text-white">
                {isCs ? "Ceník" : "Pricing"}
              </Link>
              <Link href="/b2b" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
                B2B
              </Link>
              <Link href="/inzerce/formular" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
                {isCs ? "Poptávka" : "Inquiry"}
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-4 rounded-2xl border border-[#cfe1f3] bg-[#f8fbff] p-6">
            <p className="text-sm text-slate-600">
              {isCs
                ? "Studie, legislativa, digital health a newsletter — přehled obsahu pod foldem."
                : "Studies, legislation, digital health and newsletter."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link href="/studie" className="rounded-full bg-[#005B96] px-3 py-1 text-white">
                Studie
              </Link>
              <Link href="/novinky" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
                Novinky
              </Link>
              <Link href="/newsletter" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
                Newsletter
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

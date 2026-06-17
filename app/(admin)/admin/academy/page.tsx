import { BookOpen, Brain, GraduationCap, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AdminDigestTestSend } from "@/components/academy/admin-digest-test-send";

import { DigestDeliveryBadge } from "@/components/academy/digest-delivery-badge";

import { getAcademyCounts } from "@/lib/academy/db";

import { isLlmConfigured } from "@/lib/ai/chat-json";



export default async function AdminAcademyDashboardPage() {

  const counts = await getAcademyCounts();

  const llmReady = isLlmConfigured();



  const stats = [

    { label: "Kurzy", value: counts.courses ?? 0, icon: GraduationCap },

    { label: "Lekce", value: counts.lessons ?? 0, icon: BookOpen },

    { label: "Kvízy", value: counts.quizzes ?? 0, icon: Brain },

    { label: "AI úlohy", value: counts.ai_tasks ?? 0, icon: Brain },

    { label: "Postup uživatelů", value: counts.user_progress ?? 0, icon: Trophy },

    { label: "Certifikáty", value: counts.certificates ?? 0, icon: Trophy },

  ];



  return (

    <>

      <p className="text-sm text-slate-600">

        Přehled Academy v35 — fáze 9 (marketplace Stripe checkout, webhook logs admin).

      </p>



      <div className="mt-4 space-y-3">

        <DigestDeliveryBadge />

        <AdminDigestTestSend />

        <div

          className={`rounded-xl border px-4 py-3 text-sm ${

            llmReady

              ? "border-green-200 bg-green-50 text-green-800"

              : "border-slate-200 bg-white text-slate-600"

          }`}

        >

          <p className="font-medium">

            Denní AI generování: {llmReady ? "LLM klíč aktivní" : "čeká na OPENAI/GROQ klíč"}

          </p>

          <p className="mt-1 text-xs opacity-90">

            Cron <code>/api/cron/academy-daily</code> generuje 1 lekci + 1 kvíz pro demo kurz{" "}

            <code>uvod-do-anatomie</code>.

          </p>

        </div>

      </div>



      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {stats.map((stat) => (

          <Card key={stat.label}>

            <CardHeader className="flex flex-row items-center justify-between pb-2">

              <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>

              <stat.icon className="h-4 w-4 text-[#005B96]" />

            </CardHeader>

            <CardContent>

              <p className="text-2xl font-bold text-[#021d33]">{stat.value}</p>

            </CardContent>

          </Card>

        ))}

      </div>

    </>

  );

}


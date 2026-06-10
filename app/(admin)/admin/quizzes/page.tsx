import { QuizBuilderPanel } from "@/components/admin/quiz-builder";
import { MedScopeLogo } from "@/components/brand/medscope-logo";

export default function AdminQuizzesPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <MedScopeLogo href="/admin" preset="admin-sidebar" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-[#021d33]">Kvízy a studijní hry</h1>
      <p className="mt-2 text-sm text-slate-600">v24.0 — multiple choice, klinické scénáře, anatomie, farmakologie.</p>
      <div className="mt-6">
        <QuizBuilderPanel />
      </div>
    </div>
  );
}

import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import type { ExchangeLegalDoc } from "@/lib/exchange/legal-docs";

export function ExchangeLegalView({
  locale,
  doc,
}: {
  locale: string;
  doc: ExchangeLegalDoc;
}) {
  return (
    <LegalPageLayout locale={locale} title={doc.title} description={`v${doc.version} · ${doc.updated}`}>
      {doc.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.body.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
        </section>
      ))}
    </LegalPageLayout>
  );
}

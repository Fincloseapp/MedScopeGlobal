import { chromePack } from "@/lib/i18n/chrome-pack";
import { aresSubjectUrl, type LegalEntityConfig } from "@/lib/config/legal-entity";

type SeatCopy = {
  summary: string;
  hint: string;
  ares: string;
};

const COPY: Record<"cs" | "de" | "fr" | "en", SeatCopy> = {
  cs: {
    summary: "Zobrazit sídlo z obchodního rejstříku",
    hint: "Povinný údaj provozovatele. Na webu ho nerozepisujeme na první pohled — úplná adresa je v ARES a na faktuře.",
    ares: "Otevřít záznam v ARES",
  },
  de: {
    summary: "Sitz aus dem Handelsregister anzeigen",
    hint: "Pflichtangabe des Betreibers. Auf der Website steht sie nicht auf den ersten Blick — die volle Adresse ist im ARES und auf der Rechnung.",
    ares: "ARES-Eintrag öffnen",
  },
  fr: {
    summary: "Afficher le siège au registre du commerce",
    hint: "Mention obligatoire de l’exploitant. Elle n’apparaît pas d’emblée sur le site — l’adresse complète est dans ARES et sur la facture.",
    ares: "Ouvrir la fiche ARES",
  },
  en: {
    summary: "Show registered office from the company register",
    hint: "Required operator detail. It is not printed on first view — the full address is in ARES and on the invoice.",
    ares: "Open the ARES record",
  },
};

function seatCopy(locale?: string | null): SeatCopy {
  const pack = chromePack(locale);
  if (pack === "cs" || pack === "de" || pack === "fr") return COPY[pack];
  return COPY.en;
}

type Props = {
  entity: LegalEntityConfig;
  locale?: string | null;
  className?: string;
};

/**
 * Registered office is legally available (one click + ARES) but not in the first screen.
 * Invoices still print the full address.
 */
export function LegalSeatDisclosure({ entity, locale, className }: Props) {
  if (!entity.address && !entity.ico) return null;
  const copy = seatCopy(locale);
  const ares = entity.ico ? aresSubjectUrl(entity.ico) : null;

  return (
    <details
      className={
        className ??
        "mt-3 rounded-xl border border-[#d9e8f4] bg-[#f8fbff] px-3 py-2 text-sm text-slate-700"
      }
    >
      <summary className="cursor-pointer font-medium text-[#005B96]">{copy.summary}</summary>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{copy.hint}</p>
      {entity.address ? <p className="mt-2 text-sm text-[#021d33]">{entity.address}</p> : null}
      {ares ? (
        <p className="mt-2">
          <a href={ares} rel="noopener noreferrer" target="_blank" className="text-[#005B96] underline">
            {copy.ares}
            {entity.ico ? ` · IČO ${entity.ico}` : ""}
          </a>
        </p>
      ) : null}
    </details>
  );
}

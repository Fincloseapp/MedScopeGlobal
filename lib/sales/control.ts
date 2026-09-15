export type SalesControllerId = "intake" | "legal" | "diplomatic" | "fulfillment" | "revenue";
export type SalesControlStatus = "ok" | "warn" | "block";

export type SalesControlFinding = {
  id: SalesControllerId;
  label: string;
  status: SalesControlStatus;
  title: string;
  detail: string;
  count: number;
};

export type SalesControlInput = {
  mailReady: boolean;
  unrepliedListings: number;
  outreachNeedsApproval: number;
  inquiriesReceived: number;
  inquiriesOverdue: number;
  invoicesOverdue: number;
  pendingPayment: number;
  skippedLegal: number;
};

const LABELS: Record<SalesControllerId, string> = {
  intake: "Koordinátor příjmu",
  legal: "Kontrolor právní",
  diplomatic: "Kontrolor diplomatický",
  fulfillment: "Kontrolor plnění",
  revenue: "Kontrolor výnosu",
};

export function evaluateSalesControl(input: SalesControlInput): SalesControlFinding[] {
  const intakeStatus: SalesControlStatus = !input.mailReady
    ? "block"
    : input.unrepliedListings > 0
      ? "warn"
      : "ok";
  const legalStatus: SalesControlStatus =
    input.skippedLegal > 0 ? "warn" : input.outreachNeedsApproval > 8 ? "warn" : "ok";
  const diplomaticStatus: SalesControlStatus = input.outreachNeedsApproval > 0 ? "warn" : "ok";
  const fulfillmentStatus: SalesControlStatus =
    input.inquiriesOverdue > 0 ? "block" : input.inquiriesReceived > 0 ? "warn" : "ok";
  const revenueStatus: SalesControlStatus =
    input.invoicesOverdue > 0 ? "block" : input.pendingPayment > 0 ? "warn" : "ok";

  return [
    {
      id: "intake",
      label: LABELS.intake,
      status: intakeStatus,
      title:
        intakeStatus === "block"
          ? "E-mail tržiště nemá transport"
          : intakeStatus === "warn"
            ? "Čekají automatické odpovědi"
            : "Příjem inzerce běží",
      detail:
        intakeStatus === "block"
          ? "Zapněte Cloudflare Email Sending, SendGrid nebo SMTP. Formulář i inzerce@ jinak jen logují."
          : `${input.unrepliedListings} záznamů bez auto-odpovědi. Formulář a e-mail jdou do tržiště, ne do magazínu.`,
      count: input.unrepliedListings,
    },
    {
      id: "legal",
      label: LABELS.legal,
      status: legalStatus,
      title: legalStatus === "ok" ? "Právní brány drží" : "Studený B2B e-mail čeká na schválení",
      detail: `${input.outreachNeedsApproval} ke schválení · ${input.skippedLegal} přeskočeno právně. Rx a zákon o reklamě se nevypínají.`,
      count: input.outreachNeedsApproval + input.skippedLegal,
    },
    {
      id: "diplomatic",
      label: LABELS.diplomatic,
      status: diplomaticStatus,
      title: diplomaticStatus === "ok" ? "Tón a diplomacie v pořádku" : "Fronta ke kontrole tónu",
      detail: "Editory právní / bezpečnost / diplomatický tón běží u každé nabídky. Magazín zůstává mimo tento tok.",
      count: input.outreachNeedsApproval,
    },
    {
      id: "fulfillment",
      label: LABELS.fulfillment,
      status: fulfillmentStatus,
      title:
        fulfillmentStatus === "block"
          ? "SLA poptávek po lhůtě"
          : fulfillmentStatus === "warn"
            ? "Poptávky čekají na předání"
            : "Předání poptávek v SLA",
      detail: `${input.inquiriesReceived} přijatých · ${input.inquiriesOverdue} po SLA. Kontakty jdou jen aktivnímu paušálu na tržišti.`,
      count: input.inquiriesOverdue || input.inquiriesReceived,
    },
    {
      id: "revenue",
      label: LABELS.revenue,
      status: revenueStatus,
      title:
        revenueStatus === "block"
          ? "Faktury po splatnosti"
          : revenueStatus === "warn"
            ? "Paušály čekají na platbu"
            : "Výnos tržiště bez prodlevy",
      detail: `${input.pendingPayment} čeká na platbu · ${input.invoicesOverdue} po splatnosti. Tržba je paušál tržiště, ne banner v článku.`,
      count: input.invoicesOverdue || input.pendingPayment,
    },
  ];
}

export function salesControlWorst(findings: SalesControlFinding[]): SalesControlStatus {
  if (findings.some((item) => item.status === "block")) return "block";
  if (findings.some((item) => item.status === "warn")) return "warn";
  return "ok";
}

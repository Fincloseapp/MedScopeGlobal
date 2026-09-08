import type { VipProtocolsCopy } from "@/lib/i18n/vip-protocols-copy";

export type VipProtocolsEdition = Partial<
  Omit<VipProtocolsCopy, "trialCta" | "vipLockBody">
> & {
  trialCtaBefore?: string;
  vipLockBefore?: string;
  vipLockAfter?: string;
};

const EDITIONS: Record<string, VipProtocolsEdition> = {
  sk: {
    titleLine2: "protokoly",
    lead: "Desať vedecky podložených plánov — spánok, metabolizmus, imunita. Denný rytmus, suplementy a lab testy, napojené na MediFlow.",
    aside: "Oddelene od Student LF (Academy) a tarifu Verejnosť (MeDipacient).",
    trialCtaBefore: "14 dní zadarmo · potom ",
    vipLockBefore: "Plný protokol vrátane denného plánu, suplementov a lab testov je dostupný s VIP predplatným (",
    vipLockAfter: ").",
    browse: "Prehliadnuť zoznam",
    listTitle: "Všetky protokoly",
    listLead: "Otvorte detail — denný plán, suplementy, lab testy a nástroje.",
    freeBadge: "Zadarmo",
    closingLead: "Všetky protokoly, export PDF, MediFlow sync. Nie Student LF ani MeDipacient Verejnosť.",
    startTrial: "Začať 14 dní zadarmo",
    back: "Všetky protokoly",
    protocolLabel: "Protokol",
    saveMediflow: "Uložiť do MediFlow",
    exportPdf: "Export PDF (VIP)",
    summary: "Zhrnutie",
    science: "Vedecké vysvetlenie",
    vipLockTitle: "VIP obsah",
    activateVip: "Aktivovať VIP — 14 dní zadarmo",
    daily: "Denný plán",
    weekly: "Týždenný plán",
    supplements: "Odporúčané suplementy",
    labs: "Odporúčané laboratórne testy",
    labFrequency: "Frekvencia",
    tools: "Odporúčané nástroje",
    metaTitle: "VIP Longevity protokoly | MedScopeGlobal",
    metaDescription:
      "10 vedecky podložených protokolov pre dlhovekosť: spánok, metabolizmus, suplementy. VIP predplatné.",
  },
  pl: {
    titleLine2: "protokoły",
    lead: "Dziesięć planów opartych na dowodach — sen, metabolizm, odporność. Rytm dnia, suplementy i badania, połączone z MediFlow.",
    aside: "Oddzielnie od ścieżki Student LF (Academy) i planu MeDipacient.",
    trialCtaBefore: "14 dni za darmo · potem ",
    vipLockBefore: "Pełny protokół — plan dnia, suplementy i badania — jest w VIP (",
    vipLockAfter: ").",
    browse: "Przeglądaj listę",
    listTitle: "Wszystkie protokoły",
    listLead: "Otwórz protokół: plan dnia, suplementy, badania i narzędzia.",
    freeBadge: "Za darmo",
    closingLead: "Wszystkie protokoły, eksport PDF, sync MediFlow. Nie Academy ani plan MeDipacient.",
    startTrial: "Zacznij 14 dni za darmo",
    back: "Wszystkie protokoły",
    protocolLabel: "Protokół",
    saveMediflow: "Zapisz w MediFlow",
    summary: "Podsumowanie",
    science: "Wyjaśnienie naukowe",
    vipLockTitle: "Treść VIP",
    activateVip: "Aktywuj VIP — 14 dni za darmo",
    daily: "Plan dnia",
    weekly: "Plan tygodnia",
    supplements: "Sugerowane suplementy",
    labs: "Sugerowane badania",
    labFrequency: "Częstotliwość",
    tools: "Sugerowane narzędzia",
    metaDescription: "Dziesięć protokołów długowieczności: sen, metabolizm, suplementy. Subskrypcja VIP.",
  },
  ja: {
    titleLine2: "プロトコル",
    lead: "根拠のある10の計画 — 睡眠、代謝、免疫。日課、サプリ、検査。MediFlowと連携。",
    aside: "学生Academyと一般のMeDipacientプランとは別です。",
    trialCtaBefore: "14日間無料 · その後 ",
    vipLockBefore: "日課、サプリ、検査を含む全文はVIPに含まれます（",
    vipLockAfter: "）。",
    browse: "一覧を見る",
    listTitle: "すべてのプロトコル",
    listLead: "詳細を開く — 日課、サプリ、検査、ツール。",
    freeBadge: "無料",
    closingLead: "全プロトコル、PDF書き出し、MediFlow同期。学生AcademyやMeDipacientではありません。",
    startTrial: "14日間無料を始める",
    back: "すべてのプロトコル",
    protocolLabel: "プロトコル",
    saveMediflow: "MediFlowに保存",
    summary: "要約",
    science: "科学的背景",
    vipLockTitle: "VIPコンテンツ",
    activateVip: "VIPを有効化 — 14日間無料",
    daily: "日課",
    weekly: "週間計画",
    supplements: "推奨サプリ",
    labs: "推奨検査",
    labFrequency: "頻度",
    tools: "推奨ツール",
    metaDescription: "睡眠、代謝、サプリなど根拠に基づく長寿プロトコル10本。VIP購読。",
  },
};

export function vipProtocolsEdition(primary: string): VipProtocolsEdition | undefined {
  return EDITIONS[primary];
}

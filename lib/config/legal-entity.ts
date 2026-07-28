/**
 * Legal operator identity for GDPR, terms, imprint and brand notices.
 * Defaults match ARES (IČO 06024963). Override via LEGAL_ENTITY_* env if needed.
 */
export type LegalEntityConfig = {
  /** Obchodní firma (rejstřík) */
  name: string;
  /** Obchodní / brand označení pro zákazníky */
  tradeName: string;
  /** IČO (ČR) */
  ico: string | null;
  /** DIČ pokud je plátce DPH */
  dic: string | null;
  /** Sídlo / adresa pro doručování (ARES) */
  address: string | null;
  /** Spisová značka (VR) */
  courtFile: string | null;
  /** Datová schránka (volitelné) */
  dataBox: string | null;
  /** Kontakt pro právní a GDPR záležitosti */
  legalEmail: string;
  /** Kontakt pro podporu */
  supportEmail: string;
  /** Telefon podpory */
  supportPhone: string | null;
  /** Doména značky */
  domain: string;
  /** Primární slovní označení */
  brandWordmark: string;
  /** Varianty značky */
  brandAliases: string[];
};

const DEFAULTS = {
  name: "Al Synaptica Research Institute s.r.o.",
  tradeName: "MedScopeGlobal",
  ico: "06024963",
  /** Neplátce DPH dle ARES (stavZdrojeDph: NEEXISTUJICI) */
  dic: null as string | null,
  address: "Třešňová 1046, Poruba, 73514 Orlová, Česká republika",
  courtFile: "C 70336/KSOS",
  supportEmail: "info@medscopeglobal.com",
  supportPhone: "+420 736 532 952",
  domain: "medscopeglobal.com",
  brandWordmark: "MedScopeGlobal",
  brandAliases: ["MedScope Global", "Medscopeglobal.com", "MedScope Academy"],
} as const;

function envOrNull(key: string): string | null {
  const v = process.env[key]?.trim();
  return v ? v : null;
}

function envOrDefault(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback;
}

export function getLegalEntity(): LegalEntityConfig {
  return {
    name: envOrDefault("LEGAL_ENTITY_NAME", DEFAULTS.name),
    tradeName: envOrDefault("LEGAL_ENTITY_TRADE_NAME", DEFAULTS.tradeName),
    ico: envOrNull("LEGAL_ENTITY_ICO") ?? DEFAULTS.ico,
    dic: envOrNull("LEGAL_ENTITY_DIC") ?? DEFAULTS.dic,
    address: envOrNull("LEGAL_ENTITY_ADDRESS") ?? DEFAULTS.address,
    courtFile: envOrNull("LEGAL_ENTITY_COURT_FILE") ?? DEFAULTS.courtFile,
    dataBox: envOrNull("LEGAL_ENTITY_DATA_BOX"),
    legalEmail: envOrDefault(
      "LEGAL_CONTACT_EMAIL",
      process.env.ADMIN_NOTIFY_EMAIL?.trim() || DEFAULTS.supportEmail,
    ),
    supportEmail: envOrDefault("SUPPORT_EMAIL", DEFAULTS.supportEmail),
    supportPhone: envOrNull("SUPPORT_PHONE") ?? DEFAULTS.supportPhone,
    domain: DEFAULTS.domain,
    brandWordmark: DEFAULTS.brandWordmark,
    brandAliases: [...DEFAULTS.brandAliases],
  };
}

export function isLegalEntityComplete(entity: LegalEntityConfig = getLegalEntity()): boolean {
  return Boolean(
    entity.ico &&
      entity.address &&
      entity.name.length > 0 &&
      !entity.name.startsWith("Provozovatel platformy"),
  );
}

export function formatLegalEntityLine(entity: LegalEntityConfig = getLegalEntity()): string {
  const parts = [entity.name];
  if (entity.ico) parts.push("I" + String.fromCharCode(0x10c) + "O " + entity.ico);
  if (entity.dic) parts.push("DI" + String.fromCharCode(0x10c) + " " + entity.dic);
  if (entity.courtFile) parts.push("sp. zn. " + entity.courtFile);
  return parts.join(", ");
}

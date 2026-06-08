import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";

export type V21DigitalHealthItem = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  summaryCs: string;
  whatIsCs: string;
  trendsCs: string;
  risksCs: string;
  legislationCs: string;
  examplesCs: string;
  source: { name: string; url: string };
  publishedDate: string;
  imageUrl: string;
};

export const V21_CURATED_DIGITAL_HEALTH: V21DigitalHealthItem[] = [
  {
    id: "curated-dh-telemedicine",
    slug: "telemedicina-v-cesku",
    title: "Telemedicína v českém zdravotnictví",
    topic: "Telemedicína",
    summaryCs:
      "Telemedicína v ČR spojuje vzdálenou konzultaci, monitoring pacientů a integraci s NZIS. Roste adopce po covidu i díky eHealth strategii MZČR.",
    whatIsCs:
      "Telemedicína zahrnuje synchronní i asynchronní konzultace, vzdálený monitoring vitálních funkcí a digitální komunikaci lékař–pacient v rámci zákonných limitů.",
    trendsCs:
      "Trendy: hybridní péče, wearables, integrace s ambulantními systémy, AI triáž a rozšíření úhradových pravidel dle metodik MZČR a SÚKL.",
    risksCs:
      "Rizika: ochrana osobních údajů (GDPR), kvalita dokumentace, digitální propast a odpovědnost při vzdáleném rozhodování.",
    legislationCs:
      "Legislativa: zákon o zdravotních službách, vyhlášky MZČR o dokumentaci, EU AI Act pro zdravotnické algoritmy a národní eHealth strategie.",
    examplesCs:
      "Příklady: videokonzultace v revmatologii, dálkový monitoring RA, eRecept, portál pacienta a propojení s registr EMR.",
    source: { name: "WHO / MZČR eHealth", url: "https://www.mzcr.cz/" },
    publishedDate: "2026-05-01",
    imageUrl: V21_MEDICAL_IMAGES.digitalHealth,
  },
  {
    id: "curated-dh-ai-diagnostics",
    slug: "ai-diagnostika-zdravotnictvi",
    title: "AI diagnostika ve zdravotnictví",
    topic: "AI ve zdravotnictví",
    summaryCs:
      "Umělá inteligence podporuje diagnostiku z obrazových a laboratorních dat. V ČR roste počet schválených zdravotnických prostředků s AI komponentou.",
    whatIsCs:
      "AI diagnostika využívá ML modely pro detekci patologií na RTG, CT, MRI i laboratorních trendech. Vyžaduje validaci, audit a klinickou odpovědnost lékaře.",
    trendsCs:
      "Trendy: radiomics, LLM asistenti pro lékaře, federated learning, integrace do PACS/RIS a regulační sandbox EU.",
    risksCs:
      "Rizika: bias dat, overfitting, halucinace LLM, kybernetická bezpečnost a nutnost informovaného souhlasu pacienta.",
    legislationCs:
      "Regulace: EU AI Act (vysoké riziko), MDR/IVDR pro SaMD, SÚKL pro software jako zdravotnický prostředek a metodiky ÚZIS.",
    examplesCs:
      "Příklady: AI analýza rentgenogramů, predikce aktivace RA, klinické decision support systémy v nemocnicích.",
    source: { name: "EU eHealth / EMA", url: "https://digital-strategy.ec.europa.eu/" },
    publishedDate: "2026-04-15",
    imageUrl: V21_MEDICAL_IMAGES.digitalHealth,
  },
];

export function getCuratedDigitalHealthBySlug(slug: string): V21DigitalHealthItem | null {
  return V21_CURATED_DIGITAL_HEALTH.find((d) => d.slug === slug) ?? null;
}

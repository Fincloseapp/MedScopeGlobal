import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";
import type { V22DigitalHealthArticle } from "@/lib/v22/digital-health/types";

function article(
  p: Omit<V22DigitalHealthArticle, "publishedDateLabel"> & { publishedDateLabel?: string }
): V22DigitalHealthArticle {
  const d = new Date(p.publishedDate);
  return {
    ...p,
    publishedDateLabel:
      p.publishedDateLabel ??
      d.toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" }),
  };
}

export const V22_DIGITAL_HEALTH_ARTICLES: V22DigitalHealthArticle[] = [
  article({
    id: "dh-telemedicina",
    slug: "telemedicina-v-cesku",
    title: "Telemedicína v českém zdravotnictví: standard péče, ne výjimka",
    topic: "Telemedicína",
    summaryCs:
      "Telemedicína v ČR prošla od pandemické nouze k systematické součásti péče. Integrace s NZIS, eReceptem a portálem pacienta mění workflow ambulancí i nemocnic.",
    whatIsCs:
      "Telemedicína zahrnuje synchronní videokonzultace, asynchronní komunikaci, vzdálený monitoring a hybridní modely péče. V českém právním rámci musí splňovat požadavky na dokumentaci, identifikaci pacienta a informovaný souhlas dle zákona o zdravotních službách.",
    trendsCs:
      "Klíčové trendy: hybridní klinické modely, wearables propojené s EMR, AI triáž první linie, rozšíření úhrad dle metodik MZČR a rostoucí adopce v revmatologii a chronických onemocněních.",
    risksCs:
      "Rizika zahrnují GDPR a bezpečnost dat, kvalitu klinické dokumentace, digitální propast (nedostupnost technologií u seniory) a odpovědnost při vzdáleném rozhodování bez fyzikálního vyšetření.",
    legislationCs:
      "Regulace: zákon č. 372/2011 Sb., vyhlášky MZČR o dokumentaci, nařízení EU o AI (vysoce rizikové systémy ve zdravotnictví) a národní eHealth strategie dostupná na portálu eZdraví.",
    clinicalImpactCs:
      "Pro praxi: rychlejší kontrolní vizity u stabilních pacientů, lepší adherenci u chronické péče, ale nutnost jasných kritérií, kdy je fyzická návštěva nezbytná.",
    examplesCs:
      "Příklady: videokonzultace v revmatologii, dálkový monitoring RA, eRecept, portál pacienta Moje zdraví a propojení s ambulantními systémy.",
    keyPointsCs: [
      "Hybridní péče jako nový standard",
      "NZIS a eZdraví jako páteř infrastruktury",
      "GDPR a dokumentace jako kritické předpoklady",
    ],
    sources: [
      { name: "MZČR", url: "https://www.mzcr.cz/", tier: "cz" },
      { name: "eZdraví", url: "https://www.ezdravi.gov.cz/", tier: "cz" },
      { name: "WHO", url: "https://www.who.int/", tier: "global" },
    ],
    publishedDate: "2026-06-01",
    imageUrl: V21_MEDICAL_IMAGES.digitalHealth,
  }),
  article({
    id: "dh-ai-diagnostika",
    slug: "ai-diagnostika-zdravotnictvi",
    title: "AI diagnostika: od experimentu k klinické validaci",
    topic: "AI ve zdravotnictví",
    summaryCs:
      "Umělá inteligence transformuje diagnostiku zobrazovacích a laboratorních dat. V ČR roste počet schválených zdravotnických prostředků se softwareovou komponentou pod dohledem SÚKL a v souladu s MDR.",
    whatIsCs:
      "AI diagnostika využívá hluboké učení pro detekci patologií na RTG, CT, MRI a analýzu laboratorních trendů. Klinická odpovědnost zůstává u lékaře; algoritmus je decision support, nikoli autonomní rozhodovatel.",
    trendsCs:
      "Radiomics, federated learning, LLM asistenti pro lékaře (s rizikem halucinací), integrace do PACS/RIS a regulační sandboxy EU pro inovativní SaMD.",
    risksCs:
      "Bias trénovacích dat, overfitting, kybernetické útoky na zdravotnické sítě, halucinace generativní AI a nutnost transparentnosti pro pacienta.",
    legislationCs:
      "EU AI Act (vysoce rizikové AI systémy), MDR/IVDR pro software jako zdravotnický prostředek, SÚKL pro registraci v ČR a metodiky ÚZIS pro bezpečnost dat.",
    clinicalImpactCs:
      "Zkrácení času k diagnóze u vybraných patologií, standardizace čtení snímků, ale nutnost lokální validace a auditních stop.",
    examplesCs:
      "AI analýza rentgenogramů hrudníku, predikce aktivace RA z laboratorních trendů, klinické decision support systémy v nemocnicích.",
    keyPointsCs: ["Validace na lokálních datech", "SÚKL + MDR jako regulační rámec", "Lékař zůstává rozhodovatelem"],
    sources: [
      { name: "SÚKL", url: "https://www.sukl.cz/", tier: "cz" },
      { name: "EMA", url: "https://www.ema.europa.eu/", tier: "eu" },
      { name: "NIH", url: "https://www.nih.gov/", tier: "us" },
    ],
    publishedDate: "2026-05-20",
    imageUrl: V21_MEDICAL_IMAGES.digitalHealth,
  }),
  article({
    id: "dh-ezdravi",
    slug: "ezdravi-nzis-cesko",
    title: "eZdraví a NZIS: digitální páteř českého zdravotnictví",
    topic: "eHealth infrastruktura",
    summaryCs:
      "Portál eZdraví a Národní zdravotnický informační systém (NZIS) propojují poskytovatele, pojišťovny a pacienty. Jsou základem interoperability a digitálních služeb ve zdravotnictví.",
    whatIsCs:
      "NZIS zajišťuje výměnu zdravotnické dokumentace mezi poskytovateli. Portál eZdraví informuje o službách, projektech digitalizace a přístupu pacientů k vlastním datům včetně portálu Moje zdraví.",
    trendsCs:
      "Rozšiřování elektronické dokumentace, propojení s eReceptem a eŽádankou, interoperability dle evropských standardů EHDS a rostoucí role API pro třetí strany za přísných podmínek.",
    risksCs:
      "Kybernetické hrozby, výpadky systémů, složitost implementace u menších poskytovatelů a nutnost školení personálu.",
    legislationCs:
      "Zákon o zdravotních službách, vyhlášky o NZIS, GDPR a směrnice EU o evropském prostoru zdravotních dat (EHDS).",
    clinicalImpactCs:
      "Rychlejší dostupnost výsledků mezi pracovišti, méně duplicitních vyšetření, lepší kontinuita péče — za předpokladu správného využívání systémů.",
    examplesCs:
      "Sdílená zdravotnická dokumentace, eRecept, portál pacienta, registrace do specializovaných registrů ÚZIS.",
    keyPointsCs: ["NZIS jako kritická infrastruktura", "eZdraví jako informační rozcestník", "Interoperabilita s EU"],
    sources: [
      { name: "eZdraví", url: "https://www.ezdravi.gov.cz/", tier: "cz" },
      { name: "ÚZIS", url: "https://www.uzis.cz/", tier: "cz" },
      { name: "EU eHealth", url: "https://digital-strategy.ec.europa.eu/", tier: "eu" },
    ],
    publishedDate: "2026-05-10",
    imageUrl: V21_MEDICAL_IMAGES.digitalHealth,
  }),
  article({
    id: "dh-wearables",
    slug: "wearables-chronicka-pece",
    title: "Wearables a dálkový monitoring v chronické péči",
    topic: "Wearables",
    summaryCs:
      "Nositelná elektronika a domácí monitoring umožňují kontinuální sledování pacientů s chronickými onemocněními. Data musí být klinicky validní a integrovaná do EMR.",
    whatIsCs:
      "Wearables zahrnují chytré hodinky, glukometry, tlakoměry a specializované senzory. V revmatologii a kardiologii doplňují, nenahrazují klinické vyšetření.",
    trendsCs:
      "Integrace s mobilními aplikacemi, AI detekce anomálií, modely value-based care a pilotní úhrady dálkového monitoringu.",
    risksCs:
      "Přesnost senzorů, alarm fatigue u lékařů, nesprávná interpretace dat pacientem a otázky vlastnictví dat.",
    legislationCs:
      "MDR pro zdravotnické prostředky, GDPR pro zpracování osobních údajů, metodiky MZČR k telemedicíně.",
    clinicalImpactCs:
      "Včasná detekce dekompenzace, lepší sledování adherence, personalizace léčby — při jasně definovaných indikacích.",
    examplesCs:
      "Monitoring EKG, sledování aktivity u RA, domácí měření TK u hypertenze, propojení s telemedicínskou platformou.",
    keyPointsCs: ["Validace klinické užitečnosti", "Integrace do EMR", "Jasné indikace použití"],
    sources: [
      { name: "SZÚ", url: "https://szu.cz/", tier: "cz" },
      { name: "CDC", url: "https://www.cdc.gov/", tier: "us" },
      { name: "The Lancet Digital Health", url: "https://www.thelancet.com/journals/landig/home", tier: "global" },
    ],
    publishedDate: "2026-04-28",
    imageUrl: V21_MEDICAL_IMAGES.digitalHealth,
  }),
  article({
    id: "dh-kyberbezpecnost",
    slug: "kyberneticka-bezpecnost-zdravotnictvi",
    title: "Kybernetická bezpečnost ve zdravotnictví",
    topic: "Kybernetická bezpečnost",
    summaryCs:
      "Zdravotnická zařízení a registry jsou častým cílem kybernetických útoků. NIS2, zákon o kybernetické bezpečnosti a interní politiky nemocnic jsou nezbytné.",
    whatIsCs:
      "Kybernetická bezpečnost ve zdravotnictví chrání EHR, PACS, laboratorní systémy a komunikační infrastrukturu. Zahrnuje technická opatření, školení personálu a incident response.",
    trendsCs:
      "Zero-trust architektury, segmentace sítí, pravidelné penetrační testy, zálohování offline a koordinace s NÚKIB.",
    risksCs:
      "Ransomware, únik citlivých dat pacientů, výpadky kritických systémů a regulatorní sankce.",
    legislationCs:
      "Zákon o kybernetické bezpečnosti, GDPR, NIS2 směrnice EU a metodiky ÚZIS pro zdravotnická zařízení.",
    clinicalImpactCs:
      "Výpadek IS může ohrozit péči o pacienty; prevence je levnější než reakce na incident.",
    examplesCs:
      "Šifrování dat, MFA pro přístup k systémům, audit logy, plány obnovy po incidentu.",
    keyPointsCs: ["NIS2 a český zákon o KB", "Školení personálu", "Zálohy a incident response"],
    sources: [
      { name: "ÚZIS", url: "https://www.uzis.cz/", tier: "cz" },
      { name: "NÚKIB", url: "https://www.nukib.cz/", tier: "cz" },
      { name: "ECDC", url: "https://www.ecdc.europa.eu/", tier: "eu" },
    ],
    publishedDate: "2026-04-15",
    imageUrl: V21_MEDICAL_IMAGES.digitalHealth,
  }),
  article({
    id: "dh-eu-ai-act",
    slug: "eu-ai-act-zdravotnictvi",
    title: "EU AI Act ve zdravotnictví: co musí vědět lékař",
    topic: "Regulace AI",
    summaryCs:
      "Nařízení EU o umělé inteligenci klasifikuje zdravotnické AI systémy často jako vysoce rizikové. Vyžaduje dokumentaci, dohled člověka a transparentnost vůči pacientům.",
    whatIsCs:
      "EU AI Act stanovuje povinnosti pro vývojáře a provozovatele AI v EU. Zdravotnické diagnostické systémy spadají do přísné kategorie s požadavky na kvalitu dat, robustnost a lidský dohled.",
    trendsCs:
      "Harmonizace s MDR, certifikační postupy, sandboxy pro inovace a rostoucí počet schválených AI-asistovaných produktů EMA.",
    risksCs:
      "Necompliance vede k sankcím; použití neschválených nástrojů v klinické praxi nese právní a etická rizika.",
    legislationCs:
      "Nařízení EU 2024/1689 (AI Act), MDR 2017/745, národní implementace a metodiky SÚKL pro software jako ZP.",
    clinicalImpactCs:
      "Lékaři by měli znát, zda používaný nástroj splňuje regulaci, a informovat pacienty o využití AI v péči.",
    examplesCs:
      "Schvalování AI pro analýzu retinálních snímků, klinické decision support s auditní stopou, zákaz čistě autonomní diagnostiky bez dohledu.",
    keyPointsCs: ["Vysoce rizikové AI ve zdravotnictví", "Lidský dohled povinný", "Propojení s MDR/SÚKL"],
    sources: [
      { name: "EU eHealth", url: "https://digital-strategy.ec.europa.eu/", tier: "eu" },
      { name: "EMA", url: "https://www.ema.europa.eu/", tier: "eu" },
      { name: "Mayo Clinic", url: "https://www.mayoclinic.org/", tier: "us" },
    ],
    publishedDate: "2026-04-01",
    imageUrl: V21_MEDICAL_IMAGES.digitalHealth,
  }),
];

export function getV22DigitalHealthBySlug(slug: string): V22DigitalHealthArticle | null {
  return V22_DIGITAL_HEALTH_ARTICLES.find((a) => a.slug === slug) ?? null;
}

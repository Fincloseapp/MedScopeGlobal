/** V4c configured sources for daily ingestion */

export const CZ_UNIVERSITIES = [
  { name: "1. LF UK", url: "https://www.lf1.cuni.cz/" },
  { name: "2. LF UK", url: "https://www.lf2.cuni.cz/" },
  { name: "3. LF UK", url: "https://www.lf3.cuni.cz/" },
  { name: "LF MU", url: "https://www.med.muni.cz/" },
  { name: "LF UPOL", url: "https://www.lf.upol.cz/" },
  { name: "LF OU", url: "https://www.lf.osu.cz/" },
  { name: "LF UHK", url: "https://www.lfhk.cuni.cz/" },
  { name: "LF Plzeň", url: "https://www.lfp.cuni.cz/" },
] as const;

export const RHEUMATOLOGY_SOCIETIES = [
  { name: "EULAR", url: "https://www.eular.org/" },
  { name: "ACR", url: "https://rheumatology.org/" },
  { name: "ASAS", url: "https://asas-group.org/" },
  { name: "GRAPPA", url: "https://grappanetwork.org/" },
] as const;

export const STUDY_DATABASES = [
  { name: "PubMed", query: "rheumatology[MeSH] AND (clinical trial[pt] OR randomized controlled trial[pt])" },
  { name: "ClinicalTrials.gov", url: "https://clinicaltrials.gov/" },
  { name: "NIH", url: "https://www.nih.gov/" },
  { name: "SÚKL klinické hodnocení", url: "https://www.sukl.cz/" },
] as const;

export const DRUG_AGENCIES = [
  { agency: "ema", name: "EMA", url: "https://www.ema.europa.eu/" },
  { agency: "fda", name: "FDA", url: "https://www.fda.gov/" },
  { agency: "sukl", name: "SÚKL", url: "https://www.sukl.cz/" },
] as const;

export const LEGISLATION_SOURCES = [
  { source: "mzcr", name: "MZČR", url: "https://mzd.gov.cz/" },
  { source: "sukl", name: "SÚKL", url: "https://www.sukl.cz/" },
  { source: "uzis", name: "ÚZIS", url: "https://www.uzis.cz/" },
  { source: "eu", name: "EU AI Act", url: "https://digital-strategy.ec.europa.eu/" },
  { source: "sbirka", name: "Sbírka zákonů", url: "https://www.zakonyprolidi.cz/" },
] as const;

export const DRG_SOURCES = [
  { name: "DRG Restart", url: "https://drg.daktela.com/" },
  { name: "VZP katalog", url: "https://www.vzp.cz/" },
  { name: "SÚKL úhrady", url: "https://www.sukl.cz/" },
  { name: "ÚZIS metodiky", url: "https://www.uzis.cz/" },
] as const;

export const DIGITAL_HEALTH_TOPICS = [
  "telemedicína",
  "wearables",
  "AI diagnostika",
  "legislativa AI",
  "SÚKL SW jako ZP",
] as const;

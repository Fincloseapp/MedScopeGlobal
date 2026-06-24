import { randomBytes, scryptSync } from "node:crypto";
import { createSeedPrismaClient } from "../scripts/prisma-client.mjs";

const prisma = createSeedPrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function createUserId() {
  return `usr_${randomBytes(8).toString("hex")}`;
}

function createArticleId() {
  return `art_${randomBytes(8).toString("hex")}`;
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const users = [
  {
    id: createUserId(),
    email: "expert@lf1.cuni.cz",
    passwordHash: hashPassword("Expert123!"),
    name: "MUDr. Jan Novák",
    role: "EXPERT",
    verificationStatus: "APPROVED",
    institution: "1. LF UK"
  },
  {
    id: createUserId(),
    email: "reader@example.com",
    passwordHash: hashPassword("Reader123!"),
    name: "Bc. Petra Svobodová",
    role: "READER",
    verificationStatus: "NOT_REQUIRED"
  },
  {
    id: createUserId(),
    email: "admin@medscopeglobal.com",
    passwordHash: hashPassword("Admin123!"),
    name: "MedScope Admin",
    role: "ADMIN",
    verificationStatus: "APPROVED"
  }
];

const expert = users[0];
const now = new Date();

const sections = [
  { id: "intro", heading: "Úvod", content: "Kardiovaskulární onemocnění zůstávají hlavní příčinou morbidity v ČR i EU.", highlights: ["prevence"] },
  { id: "epi", heading: "Epidemiologie a patogeneze", content: "Prevalence hypertenze u dospělé populace přesahuje 40 %.", highlights: ["prevalence"] },
  { id: "dx", heading: "Diagnostický přístup", content: "Základní vyšetření zahrnuje EKG, TK a lipidový profil dle guidelines ESC.", highlights: ["ESC"] },
  { id: "tx", heading: "Léčebné možnosti", content: "Léčba kombinuje lifestyle intervence a farmakoterapii dle rizikového profilu.", highlights: ["adherence"] }
];

const citations = [
  { id: "cit-1", title: "Kardiovaskulární prevence v primární péči: přehled klinických doporučení", authors: "Odborný konsenzus", sourceName: "European Society of Cardiology (ESC)", sourceUrl: "https://www.escardio.org", doi: "10.1000/medscope.kardiologie.2025", year: 2025 },
  { id: "cit-2", title: "Národní a evropská doporučení – Kardiologie", authors: "Odborný konsenzus", sourceName: "Státní ústav pro kontrolu léčiv (SÚKL)", sourceUrl: "https://www.sukl.cz", doi: "10.1000/pubmed.prevence.2024", year: 2024 },
  { id: "cit-3", title: "PubMed review: Kardiovaskulární prevence", authors: "Odborný konsenzus", sourceName: "PubMed / NCBI", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov", year: 2023 }
];

async function main() {
  for (const user of users) {
    await prisma.portalUser.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
  }

  const expert = await prisma.portalUser.findUnique({ where: { email: "expert@lf1.cuni.cz" } });
  if (!expert) {
    console.log("Seed skipped – expert user missing.");
    return;
  }

  const existingArticles = await prisma.portalArticle.count();
  if (existingArticles > 0) {
    console.log("Seed skipped – articles already exist.");
    return;
  }

  await prisma.portalArticle.create({
    data: {
      id: createArticleId(),
      slug: `${slugify("Kardiologie")}-${slugify("prevence")}-${Date.now().toString(36)}`,
      title: "Kardiologie: Kardiovaskulární prevence v primární péči",
      summary: "Odborný přehled k tématu kardiovaskulární prevence s citacemi z validních zdrojů.",
      sections,
      clinicalSignificance: "Včasná identifikace vysokorizikových pacientů snižuje incidence akutních koronárních syndromů.",
      practiceRecommendations: "Praktický lékař by měl systematicky sledovat TK a adherenci k léčbě.",
      citations,
      tags: ["kardiologie", "prevence", "hypertenze"],
      icdCodes: ["I10", "I25.1", "I50"],
      specialization: "Kardiologie",
      status: "PUBLISHED",
      authorId: expert.id,
      authorName: expert.name,
      publishedAt: now,
      readingTime: 8,
      ratingSum: 9,
      ratingCount: 2
    }
  });

  console.log("Portal seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

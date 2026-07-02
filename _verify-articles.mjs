const BASE = "https://www.medscopeglobal.com";
const TARGET = "5e9d7df";

async function waitDeploy() {
  for (let i = 0; i < 24; i++) {
    const h = await fetch(`${BASE}/api/v19/health?_${Date.now()}`).then(r => r.json()).catch(() => ({}));
    const git = h.gitSha || h.gitCommit || h.commit || "";
    console.log(`poll ${i+1}/24 health`, JSON.stringify({ version: h.version, gitSha: git?.slice?.(0,7) }));
    if (String(git).startsWith(TARGET)) return true;
    await new Promise(r => setTimeout(r, 30000));
  }
  return false;
}

async function verifyArticles() {
  const html = await fetch(`${BASE}/articles?_${Date.now()}`).then(r => r.text());
  const cards = (html.match(/v20-article-card/g) || []).length;
  const jun14 = (html.match(/2026-06-14|14\. 6\. 2026|14\.6\.2026/gi) || []).length;
  const verejnost = await fetch(`${BASE}/verejnost/clanky?_${Date.now()}`).then(r => r.text());
  const pubCards = (verejnost.match(/verejnost-article-card|rounded-2xl border/gi) || []).length;
  console.log("articles_cards", cards);
  console.log("articles_jun14_hits", jun14);
  console.log("verejnost_html_len", verejnost.length);
  console.log("pass", cards > 9);
  return { cards, jun14, pass: cards > 9 };
}

(async () => {
  const ready = await waitDeploy();
  console.log("deploy_ready", ready);
  const result = await verifyArticles();
  process.exit(result.pass ? 0 : 1);
})();

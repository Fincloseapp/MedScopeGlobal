const fs = require("fs");
const path = "D:/medscope.local/.env.local";
const env = {};
for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}
(async () => {
  const { VERCEL_TOKEN, VERCEL_PROJECT_ID } = env;
  const gh = env.GH_TOKEN || env.GITHUB_TOKEN;
  if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
    const url = "https://api.vercel.com/v6/deployments?projectId=" + VERCEL_PROJECT_ID + "&limit=5";
    const r = await fetch(url, { headers: { Authorization: "Bearer " + VERCEL_TOKEN } });
    const j = await r.json();
    for (const d of j.deployments || []) {
      const msg = (d.meta && (d.meta.githubCommitMessage || d.meta.gitlabCommitMessage)) || "";
      console.log("VERCEL", d.state, d.readyState, msg.split("\n")[0], d.url, d.created);
    }
  }
  if (gh) {
    const repo = env.GITHUB_REPOSITORY || env.GITHUB_REPO || "";
    let repoPath = repo.includes("/") ? repo : null;
    if (!repoPath && env.GITHUB_REPO_ID) repoPath = env.GITHUB_REPO_ID;
    const urls = [];
    if (repoPath && repoPath.includes("/")) urls.push("https://api.github.com/repos/" + repoPath + "/commits?sha=main&per_page=8");
    urls.push("https://api.github.com/user/repos?per_page=100");
    for (const u of urls.slice(0, 1)) {
      const r2 = await fetch(u, { headers: { Authorization: "Bearer " + gh, Accept: "application/vnd.github+json", "User-Agent": "medscope-check" } });
      console.log("GH fetch", u, r2.status);
      if (r2.ok) {
        const data = await r2.json();
        const commits = Array.isArray(data) ? data : [data];
        if (Array.isArray(data) && data[0] && data[0].full_name) {
          console.log("repos sample", data.filter(x => /medscope/i.test(x.full_name)).slice(0,3).map(x => x.full_name).join(", "));
        } else {
          for (const c of (Array.isArray(data) ? data : [])) {
            console.log("GH", c.sha.slice(0, 8), (c.commit.message || "").split("\n")[0]);
          }
        }
      } else console.log(await r2.text());
    }
  } else {
    console.log("no GH token");
    console.log(Object.keys(env).filter(k => /GITHUB|REPO|GH_/.test(k)).join(", "));
  }
})();

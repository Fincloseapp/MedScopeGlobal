#!/usr/bin/env node
for (const ref of ["c3cbb2a1", "2130a9fc", "b6ff2625"]) {
  const u = `https://raw.githubusercontent.com/Fincloseapp/MedScopeGlobal/${ref}/vercel.json`;
  const r = await fetch(u);
  const text = r.ok ? await r.text() : `ERR ${r.status}`;
  const crons = (text.match(/"path"/g) || []).length;
  const hasOutput = text.includes("outputDirectory");
  console.log(ref, "status", r.status, "crons", crons, "outputDirectory", hasOutput);
}

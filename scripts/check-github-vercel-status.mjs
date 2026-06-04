#!/usr/bin/env node
const shas = [
  "2130a9fc",
  "143fbfd",
  "0e001665",
  "b6ff262569fd300a859bda1d74dfa9a9f26c737e",
];
for (const s of shas) {
  const res = await fetch(
    `https://api.github.com/repos/Fincloseapp/MedScopeGlobal/commits/${s}/status`
  );
  const j = await res.json();
  const st = j.statuses?.[0];
  console.log(
    s.slice(0, 8),
    j.state,
    st?.description ?? "",
    st?.target_url ?? ""
  );
}

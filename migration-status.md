# Migration status — 2026-06-22

## Result: Partial success

| Task | Status |
|------|--------|
| D: workspace setup | Done — `D:\MedScopeGlobal` |
| Copy from C: | Done |
| Portable Node on D: | Done — v22.16.0 at `.tools\node\` |
| npm install / typecheck / lint | Pass |
| npm run build | Fail — FAT32 EISDIR readlink error |
| Git commit | Done — `9099e7830c7a18fce801eb0286b82c2607b35539` |
| Git push | Skipped |
| C: cleanup | Done — project files removed |

## D: path

`D:\MedScopeGlobal` (~94 GB free, FAT32)

## Build blocker

D: is FAT32. Next.js 15 production build fails with `EISDIR` on `readlink`. Use Vercel CI or NTFS for local production builds.

## Commit

9099e7830c7a18fce801eb0286b82c2607b35539 — Implement audit remediation across public pages and shared components.

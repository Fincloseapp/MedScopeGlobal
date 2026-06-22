# MedScopeGlobal workspace (canonical D: drive)

## Canonical paths

| Item | Path |
|------|------|
| Workspace root | `D:\MedScopeGlobal` |
| **Working copy (git)** | `D:\MedScopeGlobal\repo-temp` |
| Portable Node.js | `D:\MedScopeGlobal\.tools\node\node.exe` |
| npm cache (D: only) | `D:\MedScopeGlobal\.npm-cache` |

Project files that lived under `C:\Users\zegzulka\MedScopeGlobal` were copied here and **removed from C:** on 2026-06-22. Cursor agent transcripts under `%USERPROFILE%\.cursor\` were not touched.

## Open in Cursor

Use **Move agent to root** (MCP `move_agent_to_root`) with:

```
D:\MedScopeGlobal
```

Day-to-day git and npm commands should run from `D:\MedScopeGlobal\repo-temp`.

## Build commands (PowerShell)

```powershell
$env:Path = "D:\MedScopeGlobal\.tools\node;" + $env:Path
$env:NPM_CONFIG_CACHE = "D:\MedScopeGlobal\.npm-cache"
Set-Location D:\MedScopeGlobal\repo-temp

npm install
npm run typecheck
npm run lint
npm run build
```

Git on FAT32/removable volumes may require:

```powershell
& D:\MedScopeGlobal\.tools\mingit\cmd\git.exe -c safe.directory=D:/MedScopeGlobal/repo-temp -C D:\MedScopeGlobal\repo-temp status
```

## Migration verification

- `repo-temp` file count after robocopy: **1817** (C: and D: matched before C: deletion)
- Reports copied: `medscopeglobal-audit-report.md`, `implementation-report-by-agents.md`

## Build status (2026-06-22)

| Step | Result |
|------|--------|
| `npm install` | **Pass** (cache on D:) |
| `npm run typecheck` | **Pass** |
| `npm run lint` | **Fail** — ESLint plugin conflict with parent `D:\MedScopeGlobal\.eslintrc.json` (multiple lockfiles / monorepo-like layout) |
| `npm run build` | **Fail** — `EISDIR` on `fs.readlink` during webpack compile |

### D: drive filesystem note

`D:` is **FAT32 (removable)**. Node.js `fs.readlinkSync()` returns `EISDIR` even for normal files on this volume, which breaks Next.js 15 webpack production builds locally. **Mitigation:** use Vercel/CI (NTFS/Linux) for production builds, or move the workspace to an **NTFS/exFAT** partition that supports normal symlink semantics.

Logs: `repo-temp/migrate-*.log`

## C: cleanup

Removed from `C:\Users\zegzulka\MedScopeGlobal`:

- `repo-temp/` (entire tree)
- `medscopeglobal-audit-report.md`
- `implementation-report-by-agents.md`
- `.tools/`

The C: workspace folder is empty; reopen the project from `D:\MedScopeGlobal`.

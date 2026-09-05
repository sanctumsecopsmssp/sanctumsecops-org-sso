# Sanctum Brand Sync

A safe, terminal-first PowerShell tool that fixes the **Sanctum SecOps LLC**
brand identity across the web estate so every surface matches the canonical
source of truth (`sanctum-company-identity / canonical-facts.md`, verified
2026-07-19).

It corrects stale **NAP** (name/address/phone), mailboxes, legal-name casing,
copyright year, and — optionally — brand CSS palette tokens.

## Install

Requires PowerShell 7+ (`pwsh`). On the Mac Mini / Windows host it is already
available; on Linux install `powershell` or run the portable tarball.

## Usage

```powershell
# 1) Dry run — report only, no files changed (ALWAYS start here)
pwsh Sync-SanctumBrand.ps1 -Path ./sanctumsecops.com -Verify

# 2) After reviewing the report, apply with backups
pwsh Sync-SanctumBrand.ps1 -Path ./sanctumsecops.com -Apply -Backup

# 3) Also normalize brand CSS hex tokens to canonical case
pwsh Sync-SanctumBrand.ps1 -Path ./sanctumsecops.com -Apply -Backup -SyncCssTokens

# Scope to a single domain/repo, non-recursive
pwsh Sync-SanctumBrand.ps1 -Path ./pki -Verify -Recurse:$false
```

## Parameters

| Flag | Default | Purpose |
|---|---|---|
| `-Path` | *(required)* | Directory to scan |
| `-Apply` | off | Write corrections; without it the script only reports |
| `-Verify` | on | Explicit dry-run flag (default behavior unless `-Apply`) |
| `-Recurse` | on | Recurse into subdirectories |
| `-Backup` | off | `.bak` copy of each file before mutation (use with `-Apply`) |
| `-SyncCssTokens` | off | Normalize Sanctum palette hex to canonical case in CSS/SCSS |

## What it corrects

| Stale (find) | Canonical (replace) |
|---|---|
| `607-703-1189`, `(607) 703-1189`, `607.703.1189` | `+1 (607) 378-8287` |
| `PO Box 72, Horseheads, NY 14845` | `128 Dry Run Rd, Pine City, NY 14871` |
| `Horseheads, NY 14845` (standalone) | `Pine City, NY 14871` |
| `bvicente@sanctumsecops.com` | `Brian@sso-labs.com` |
| `info@sanctumsecops.com` | `Brian@sso-labs.com` |
| `brian@sanctumsecops.io` | `Brian@sso-labs.com` |
| `Sanctum Secops LLC` / lowercase | `Sanctum SecOps LLC` |
| `© 2025 …`, `(c) 2026 …` | `© 2026 Sanctum SecOps LLC` |
| lowercase palette hex (`#0a0814`, `#7c3aed`, …) | canonical uppercase (`#0A0814`, `#7C3AED`, …) |

## Safety

- **Dry-run by default.** Never writes unless `-Apply` is passed.
- **Domain-safe.** Word-boundary guards leave `sanctumsecops.com`,
  `sanctumsecops.io`, and `sso-labs.com` untouched.
- **Code-safe.** Skips `node_modules`, `.git`, `dist`, `build`, `vendor`.
- **Scoped.** Only touches files that reference Sanctum, or (with
  `-SyncCssTokens`) CSS that already uses the palette hex values.
- **Auditable.** Writes a markdown + JSON punch-list report per run.
- Per the NAP-audit rule, it does **not** touch SAM.gov or legal records —
  those require Brian's explicit confirmation.

## Output

Each run writes `sanctum-brand-report-<timestamp>.{md,json}` next to `-Path`
with the canonical reference table and a per-file correction list.

<#
.SYNOPSIS
    Fix and sync the Sanctum SecOps LLC brand identity across the web estate.

.DESCRIPTION
    Scans a directory of web/project files and corrects stale company facts
    (NAP, emails, legal name, copyright year, footer, tagline) so every surface
    matches the canonical identity in the sanctum-company-identity skill.

    SAFE BY DEFAULT: runs in -Verify (dry-run) mode and only reports what it
    would change. Pass -Apply to write changes. Originals are backed up when
    -Backup is set. A JSON + markdown punch-list report is written next to the
    target path.

    Source of truth: skills/org/sanctum-company-identity/references/canonical-facts.md
    Last verified: 2026-07-19. THIS SHEET WINS over any public record.

.PARAMETER Path
    Target directory to scan (e.g. the repo root of a site).

.PARAMETER Apply
    Write the corrected values to files. Without it, the script only reports.

.PARAMETER Recurse
    Recurse into subdirectories. Default: on.

.PARAMETER Backup
    Create a .bak copy of each file before mutating it (requires -Apply).

.PARAMETER SyncCssTokens
    Normalize Sanctum brand color hex values to canonical tokens in *.css files.

.EXAMPLE
    pwsh Sync-SanctumBrand.ps1 -Path ./sanctumsecops.com -Verify
    # dry-run report only — no files changed

.EXAMPLE
    pwsh Sync-SanctumBrand.ps1 -Path ./sanctumsecops.com -Apply -Backup
    # apply corrections, backing up originals

.NOTES
    Author : Sanctum SecOps LLC — Brian Vicente
    Brand  : midnight #0A0814 / violet #7C3AED #A78BFA / gold #F5D060 #D4A017
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Path,

    [switch]$Apply,
    [switch]$Verify,   # explicit dry-run flag (default behavior unless -Apply is set)
    [switch]$Recurse = $true,
    [switch]$Backup,
    [switch]$SyncCssTokens
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# ---------------------------------------------------------------------------
# Canonical identity (do NOT edit from memory — read the facts sheet)
# ---------------------------------------------------------------------------
$Canonical = @{
    LegalName  = 'Sanctum SecOps LLC'
    Address    = '128 Dry Run Rd, Pine City, NY 14871'
    Phone      = '+1 (607) 378-8287'
    Email      = 'Brian@sso-labs.com'
    Domain     = 'sanctumsecops.com'
    Tagline    = 'Secure the Sanctum. Guard the Future.'
    Copyright  = '© 2026 Sanctum SecOps LLC'
    Pen        = '1.3.6.1.4.1.65953'
}

# ---------------------------------------------------------------------------
# Correction rules.  Find (regex) -> Replace (canonical).
# Patterns are scoped narrowly so they never mangle code, domains, or CSS vars.
# ---------------------------------------------------------------------------
$Rules = @(
    # --- Phone: kill every old phone format -> canonical -------------------
    #     matches (607) 703-1189, 607-703-1189, 607.703.1189, 607 703 1189
    #     (no leading \s* so the preceding space is preserved)
    [pscustomobject]@{
        Name='Phone'
        Find='\(607\)[\s\-\.]?703[\s\-\.]?1189|607[\s\-\.]?703[\s\-\.]?1189'
        Replace=$Canonical.Phone
    }
    # --- Address: old Horseheads PO Box -> Pine City ---------------------
    [pscustomobject]@{
        Name='Address'
        Find='P\.?\s*O\.?\s*Box\s*72,?\s*Horseheads,?\s*NY\s*14845'
        Replace=$Canonical.Address
    }
    [pscustomobject]@{
        Name='AddressCity'
        Find='Horseheads,?\s*NY\s*14845'
        Replace='Pine City, NY 14871'
    }
    # --- Emails: stale mailboxes -> primary ------------------------------
    [pscustomobject]@{ Name='Email_bvicente'; Find='bvicente@sanctumsecops\.com'; Replace=$Canonical.Email }
    [pscustomobject]@{ Name='Email_info';     Find='info@sanctumsecops\.com';     Replace=$Canonical.Email }
    [pscustomobject]@{ Name='Email_io';       Find='brian@sanctumsecops\.io';     Replace=$Canonical.Email }

    # --- Legal name casing: "Sanctum Secops" / "sanctum secops llc" -> canonical
    #     (word-boundary guards leave domain names like sanctumsecops.com alone)
    [pscustomobject]@{
        Name='LegalName_Secops'
        Find='(?<![\w.\-])Sanctum\s+Secops(?![-\w])'
        Replace='Sanctum SecOps'
        CaseSensitive=$true
    }
    [pscustomobject]@{
        Name='LegalName_LowerLLC'
        Find='(?<![\w.\-])sanctum\s+secops\s+llc(?![-\w])'
        Replace=$Canonical.LegalName
        CaseSensitive=$true
    }

    # --- Copyright / footer ---------------------------------------------
    [pscustomobject]@{ Name='Copyright_2025'; Find='©\s*2025\s+Sanctum\s+SecOps\s+LLC'; Replace=$Canonical.Copyright }
    [pscustomobject]@{ Name='Copyright_CP';  Find='\(c\)\s*202[0-9]\s+Sanctum\s+SecOps\s+LLC'; Replace=$Canonical.Copyright }
    [pscustomobject]@{ Name='Copyright_NoYear'; Find='©\s+Sanctum\s+SecOps\s+LLC'; Replace=$Canonical.Copyright }
)
# ---------------------------------------------------------------------------
# CSS brand-token normalization (opt-in). Canonical uppercase hex tokens for
# the Sanctum palette. Matching is case-insensitive so lowercase variants are
# normalized to canonical case; already-canonical tokens are left untouched.
# Only *.css / *.scss that already use the palette are rewritten.
# ---------------------------------------------------------------------------
$CssTokens = @(
    '#0A0814',  # midnight
    '#7C3AED',  # primary violet
    '#5B21B6',  # deep violet
    '#A78BFA',  # soft violet
    '#F5D060',  # gold
    '#D4A017'   # dark gold
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
function Test-SanctumFile {
    param([string]$Content)
    # only treat as brand-relevant if it references Sanctum at all
    return $Content -match '(?i)sanctum\s*secops|sanctumsecops|sso-labs|1\.3\.6\.1\.4\.1\.65953'
}

function Invoke-BrandRules {
    param([string]$Content, [pscustomobject[]]$RuleSet)
    $hits = [System.Collections.Generic.List[pscustomobject]]::new()
    $out = $Content
    foreach ($r in $RuleSet) {
        $caseSensitive = $r.PSObject.Properties.Name -contains 'CaseSensitive' -and [bool]$r.CaseSensitive
        $opts = if ($caseSensitive) { [System.Text.RegularExpressions.RegexOptions]::None } else { [System.Text.RegularExpressions.RegexOptions]::IgnoreCase }
        $m = [regex]::Matches($out, $r.Find, $opts)
        if ($m.Count -gt 0) {
            $hits.Add([pscustomobject]@{
                Rule=$r.Name; Count=$m.Count; Sample=($m[0].Value)
            })
            $out = [regex]::Replace($out, $r.Find, [System.Text.RegularExpressions.MatchEvaluator]{ param($mm) $r.Replace }, $opts)
        }
    }
    return [pscustomobject]@{ Content=$out; Hits=$hits }
}

# ---------------------------------------------------------------------------
# Resolve files
# ---------------------------------------------------------------------------
if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
    throw "Target path not found or not a directory: $Path"
}
$Path = (Resolve-Path -LiteralPath $Path).ProviderPath

$Ext = @('.html','.htm','.md','.markdown','.css','.js','.mjs','.ts','.json','.txt','.yml','.yaml','.xml','.svg','.rss','.astro','.vue')
$files = @(Get-ChildItem -LiteralPath $Path -Recurse:$Recurse -File |
    Where-Object {
        $Ext -contains $_.Extension.ToLower() -and
        $_.FullName -notmatch '[\\/](node_modules|\.git|dist|build|\.next|vendor)[\\/]' -and
        $_.Name -notlike 'sanctum-brand-report-*' -and
        $_.Extension.ToLower() -ne '.bak'
    })

Write-Host "`n  Sanctum SecOps — Brand Sync" -ForegroundColor Yellow
Write-Host "  Mode      : $(if($Apply){'APPLY (write)'}else{'VERIFY (dry-run)'})" -ForegroundColor $(if($Apply){'Green'}else{'Cyan'})
Write-Host "  Target    : $Path"
Write-Host "  Files     : $($files.Count) candidate`n" -ForegroundColor DarkGray

$report = [System.Collections.Generic.List[pscustomobject]]::new()
$totalChanges = 0
$filesChanged = 0

foreach ($f in $files) {
    $raw = [IO.File]::ReadAllText($f.FullName)
    $isSanctum = Test-SanctumFile -Content $raw
    $isCss = $f.Extension.ToLower() -in '.css','.scss'
    # Candidate if it references Sanctum, OR (css + SyncCssTokens + uses a palette hex)
    $hasPaletteHex = $false
    if ($SyncCssTokens -and $isCss) {
        foreach ($hex in $CssTokens) { if ($raw -match [regex]::Escape($hex)) { $hasPaletteHex = $true; break } }
    }
    if (-not $isSanctum -and -not $hasPaletteHex) { continue }

    $changed = $false
    $fileHits = [System.Collections.Generic.List[pscustomobject]]::new()

    # 1) NAP / identity / footer rules (only for Sanctum-relevant content)
    $new = $raw
    if ($isSanctum) {
        $r = Invoke-BrandRules -Content $raw -RuleSet $Rules
        $new = $r.Content
        foreach ($h in $r.Hits) { $fileHits.Add($h); $totalChanges += $h.Count; $changed = $true }
    }

    # 2) optional CSS token normalization (case-insensitive -> canonical case)
    if ($SyncCssTokens -and $f.Extension.ToLower() -in '.css','.scss') {
        foreach ($hex in $CssTokens) {
            $rx = [regex]::new([regex]::Escape($hex), 'IgnoreCase')
            $nonCanon = @($rx.Matches($new) | Where-Object { $_.Value -cne $hex })
            if ($nonCanon.Count -gt 0) {
                $new = $rx.Replace($new, $hex)
                $fileHits.Add([pscustomobject]@{ Rule="CssToken_$hex"; Count=$nonCanon.Count; Sample=$nonCanon[0].Value })
                $totalChanges += $nonCanon.Count; $changed = $true
            }
        }
    }

    if (-not $changed) { continue }

    if ($Apply) {
        if ($Backup) {
            Copy-Item -LiteralPath $f.FullName -Destination "$($f.FullName).bak" -Force
        }
        [IO.File]::WriteAllText($f.FullName, $new)
    }

    $filesChanged++
    $report.Add([pscustomobject]@{
        File   = $f.FullName.Replace($Path, '').TrimStart('/\')
        Rules  = ($fileHits.Rule -join ', ')
        Changes= ($fileHits | ForEach-Object { "$($_.Rule)=$($_.Count)" }) -join '; '
        Samples = ($fileHits | ForEach-Object { "$($_.Rule): '$($_.Sample)'" }) -join ' | '
    })
}

# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------
$stamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$reportPath = Join-Path $Path "sanctum-brand-report-$stamp"
$jsonPath  = "$reportPath.json"
$mdPath    = "$reportPath.md"

$summary = [ordered]@{
    RunAt        = (Get-Date).ToString('o')
    Mode         = if($Apply){'apply'}else{'verify'}
    Target       = $Path
    Candidates   = $files.Count
    FilesChanged = $filesChanged
    TotalChanges = $totalChanges
    Canonical    = $Canonical
}
$summary | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $jsonPath -Encoding UTF8

$md = New-Object System.Text.StringBuilder
[void]$md.AppendLine("# Sanctum SecOps — Brand Sync Report")
[void]$md.AppendLine("")
[void]$md.AppendLine("- **Mode:** $(if($Apply){'APPLY'}else{'VERIFY (dry-run — no files written)'})")
[void]$md.AppendLine("- **Target:** ``$Path``")
[void]$md.AppendLine("- **Candidate files:** $($files.Count)")
[void]$md.AppendLine("- **Files with findings:** $filesChanged")
[void]$md.AppendLine("- **Total corrections:** $totalChanges")
[void]$md.AppendLine("")
[void]$md.AppendLine("## Canonical reference")
[void]$md.AppendLine("")
[void]$md.AppendLine("| Field | Value |")
[void]$md.AppendLine("|---|---|")
foreach ($k in $Canonical.Keys) { [void]$md.AppendLine("| $k | ``$($Canonical[$k])`` |") }
[void]$md.AppendLine("")
if ($filesChanged -gt 0) {
    [void]$md.AppendLine("## Findings")
    [void]$md.AppendLine("")
    [void]$md.AppendLine("| File | Corrections |")
    [void]$md.AppendLine("|---|---|")
    foreach ($r in $report) { [void]$md.AppendLine("| ``$($r.File)`` | $($r.Changes) |") }
} else {
    [void]$md.AppendLine("## Result`n")
    [void]$md.AppendLine("No stale brand values found — estate is consistent with canonical facts.")
}
[void]$md.AppendLine("")
[void]$md.AppendLine("_Source of truth: sanctum-company-identity / canonical-facts.md (verified 2026-07-19)._")
$md.ToString() | Set-Content -LiteralPath $mdPath -Encoding UTF8

# Console summary
if ($filesChanged -eq 0) {
    Write-Host "  [OK] No stale brand values found. Estate matches canonical facts." -ForegroundColor Green
} else {
    $color = if ($Apply) {'Green'} else {'Yellow'}
    Write-Host "  [$($color.ToUpper().Substring(0,1))] $filesChanged file(s), $totalChanges correction(s)." -ForegroundColor $color
    Write-Host "       $(if($Apply){'Changes WRITTEN.'}else{'Dry-run — re-run with -Apply to write.'})" -ForegroundColor $color
}
Write-Host "  Report : $mdPath" -ForegroundColor DarkGray
Write-Host "  JSON   : $jsonPath`n" -ForegroundColor DarkGray

if ($filesChanged -gt 0 -and -not $Apply) {
    Write-Host "  Next: review the report, then:" -ForegroundColor Cyan
    Write-Host "    pwsh Sync-SanctumBrand.ps1 -Path '$Path' -Apply -Backup`n" -ForegroundColor Cyan
}

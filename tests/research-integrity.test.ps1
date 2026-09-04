$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$research = Get-Content (Join-Path $root "research.html") -Raw
$assessments = Get-Content (Join-Path $root "assessments.html") -Raw
$script = Get-Content (Join-Path $root "script.js") -Raw
$framework = Get-Content (Join-Path $root "framework.html") -Raw

@(
  "Five Core Construct Families",
  "Perceived meaning and consequences",
  "Trusted signals",
  "Capability and opportunity",
  "Agency and ethical acceptability",
  "Adaptive response over time",
  "Levels of Analysis",
  "Epistemic Integrity",
  "Signal availability",
  "Signal exposure",
  "Signal interpretation",
  "Signal credibility",
  "Signal acceptance",
  "Behavioral response",
  "AI Reliance and Authority Transfer",
  "Operational effectiveness",
  "Human flourishing",
  "Feedback into later signals, trust, and responses",
  "propositions requiring empirical testing"
) | ForEach-Object {
  if ($research -notmatch [regex]::Escape($_)) {
    throw "research.html is missing required research content: $_"
  }
}

@(
  "CEAM+ Research Framework",
  "CEAM+ Practice Method",
  "CEAM+ Assessments",
  "not validated diagnostic instruments",
  "does not treat agreement as evidence",
  "AI may assist with analysis"
) | ForEach-Object {
  if ($research -notmatch [regex]::Escape($_)) {
    throw "research.html is missing a required integrity statement: $_"
  }
}

@(
  "CEAM+ Adoption Model",
  "discussion indicator",
  "not a diagnosis",
  "Uncertain",
  "Not applicable",
  "Insufficient information"
) | ForEach-Object {
  if (($assessments + $script) -notmatch [regex]::Escape($_)) {
    throw "The assessment experience is missing: $_"
  }
}

@(
  "The Original Four CEAM+ Layers",
  "The Nine Expanded CEAM+ Layers",
  "Research Agenda"
) | ForEach-Object {
  if ($framework -notmatch [regex]::Escape($_)) {
    throw "The preserved framework archive is missing: $_"
  }
}

if (($research + $assessments + $script) -match '(?i)liar-resistant') {
  throw "Deprecated liar-resistant language remains."
}

Write-Output "CEAM+ research and assessment integrity: PASS"

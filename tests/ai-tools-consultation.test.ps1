$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$html = Get-Content (Join-Path $root "ai-solutions.html") -Raw

@(
  "AI is more than chatbots",
  "coding",
  "building and maintaining websites",
  "Human-assisted implementation",
  "Consultations are available",
  "Contact a Consultant"
) | ForEach-Object {
  if ($html -notmatch [regex]::Escape($_)) {
    throw "AI Tools page is missing: $_"
  }
}

if ($html -notmatch '<a class="button primary" href="contact\.html">Contact a Consultant</a>') {
  throw "The consultant call-to-action does not link to the contact page."
}

$styles = Get-Content (Join-Path $root "styles.css") -Raw
if ($styles -notmatch '--green-dark:\s*#505258;') {
  throw "The charcoal logo color is not configured."
}
if ($styles -notmatch '--gold:\s*#c79b3b;') {
  throw "The gold logo color is not configured."
}

Write-Output "CEAM+ logo palette and AI consultation content: PASS"

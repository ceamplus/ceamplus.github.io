$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$expectedImages = @(
  "cognitive",
  "emotional",
  "agency",
  "trust-ethics",
  "environment",
  "ai-solution",
  "human-ai",
  "growth-meaning",
  "continuous-improvement"
)

foreach ($page in @("framework.html")) {
  $html = Get-Content (Join-Path $root $page) -Raw

  foreach ($image in $expectedImages) {
    $pattern = '<figure class="layer-image">[\s\S]*?<img src="assets/layers/' +
      [regex]::Escape($image) +
      '\.jpg" alt="[^"]+" loading="lazy" decoding="async"[\s\S]*?</figure>'

    if ($html -notmatch $pattern) {
      throw "$page is missing the accessible local image for $image."
    }
  }
}

$applications = Get-Content (Join-Path $root "applications.html") -Raw
if ($applications -match 'The Nine Expanded CEAM\+ Layers') {
  throw "applications.html should reference the framework archive instead of duplicating the expanded layer gallery."
}
if ($applications -notmatch 'href="framework\.html"[^>]*>View Framework Layers</a>') {
  throw "applications.html is missing its link to the framework archive."
}

$styles = Get-Content (Join-Path $root "styles.css") -Raw
if ($styles -notmatch '\.layer-image\s*\{') {
  throw "The layer image layout styles are missing."
}

Write-Output "CEAM+ expanded layer images: PASS"

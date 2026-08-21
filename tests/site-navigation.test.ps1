$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$mainPages = @(
  "index.html",
  "framework.html",
  "values.html",
  "about.html",
  "assessments.html",
  "applications.html",
  "workflow.html",
  "contact.html",
  "ai-solutions.html"
)

$requiredNavigation = @{
  "index.html" = "Home"
  "framework.html" = "Layers"
  "values.html" = "Mission, Values &amp; Philosophy"
  "assessments.html" = "Assessments"
  "workflow.html" = "Guides"
  "ai-solutions.html" = "AI Tools"
  "about.html" = "About"
  "contact.html" = "Contact a Consultant"
}

foreach ($page in $mainPages) {
  $path = Join-Path $root $page
  if (-not (Test-Path $path)) {
    throw "Missing page: $page"
  }

  $html = Get-Content $path -Raw
  if ($html -notmatch '<nav class="nav-links"') {
    throw "$page does not contain the primary navigation."
  }

  foreach ($entry in $requiredNavigation.GetEnumerator()) {
    $pattern = '<a href="' + [regex]::Escape($entry.Key) + '"(?: aria-current="page")?>' + [regex]::Escape($entry.Value) + '</a>'
    if ($html -notmatch $pattern) {
      throw "$page is missing navigation link: $($entry.Value)"
    }
  }

  $currentLinks = [regex]::Matches($html, '<a href="([^"]+)" aria-current="page">([^<]+)</a>')
  if ($currentLinks.Count -ne 1) {
    throw "$page must contain exactly one current-page tab."
  }

  $expectedCurrentPage = if ($page -eq "applications.html") { "framework.html" } else { $page }
  if ($currentLinks[0].Groups[1].Value -ne $expectedCurrentPage) {
    throw "$page highlights $($currentLinks[0].Groups[1].Value) instead of $expectedCurrentPage."
  }
}

$framework = Get-Content (Join-Path $root "framework.html") -Raw
if ($framework -match 'http-equiv="refresh"') {
  throw "framework.html still redirects instead of showing the Layers page."
}

@(
  "Cognitive Layer",
  "Ethical Layer",
  "Adoption Layer",
  "Plus Layer",
  "The Nine Expanded CEAM+ Layers"
) | ForEach-Object {
  if ($framework -notmatch [regex]::Escape($_)) {
    throw "framework.html is missing: $_"
  }
}

if ($framework -notmatch [regex]::Escape("Understanding how people and organizations adopt, resist, and sustain change in an increasingly AI-driven world.")) {
  throw "framework.html is missing the stable CEAM+ research identity."
}

@(
  "Conditions for Change",
  "Agency is not the absence of barriers",
  "Foundational Anchors",
  "Research Library",
  "Explorations",
  "Research Agenda",
  "Level 1 - Timeless Questions",
  "Level 2 - Decade Questions",
  "Level 3 - Emerging Questions"
) | ForEach-Object {
  if ($framework -notmatch [regex]::Escape($_)) {
    throw "framework.html is missing foundational framework content: $_"
  }
}

$workflow = Get-Content (Join-Path $root "workflow.html") -Raw
if ($workflow -notmatch [regex]::Escape("Conditions for Change")) {
  throw "workflow.html does not begin from Conditions for Change."
}

$values = Get-Content (Join-Path $root "values.html") -Raw
if ($values -match 'http-equiv="refresh"') {
  throw "values.html still redirects instead of showing the Mission & Values page."
}

@(
  "Our Mission, Values &amp; Philosophy",
  "The purpose of CEAM+ is understanding before intervention.",
  "Adaptive Wisdom Learning Loop",
  "The Overload Question",
  "Marketing and Interdisciplinary Research",
  "Human First",
  "Clarity Over Complexity",
  "Progress Over Perfection"
) | ForEach-Object {
  if ($values -notmatch [regex]::Escape($_)) {
    throw "values.html is missing: $_"
  }
}

$mission = Get-Content (Join-Path $root "mission.html") -Raw
if ($mission -notmatch 'http-equiv="refresh" content="0; url=values\.html"') {
  throw "mission.html should redirect to the combined Mission, Values & Philosophy page."
}

$philosophy = Get-Content (Join-Path $root "philosophy.html") -Raw
if ($philosophy -notmatch 'http-equiv="refresh" content="0; url=values\.html#philosophy"') {
  throw "philosophy.html should redirect to the combined Mission, Values & Philosophy page."
}

$styles = Get-Content (Join-Path $root "styles.css") -Raw
if ($styles -match '@media \(max-width: 1100px\)[\s\S]*?\.nav-links\s*\{\s*display:\s*none;') {
  throw "Responsive CSS still hides the entire navigation."
}

if ($styles -notmatch '\.site-header\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s*auto;') {
  throw "The header does not define the approved two-column brand row."
}

if ($styles -notmatch '\.nav-links\s*\{[\s\S]*?grid-column:\s*1\s*/\s*-1;[\s\S]*?grid-row:\s*2;') {
  throw "The navigation is not placed across the second header row."
}

if ($styles -notmatch '\.nav-links a\[aria-current="page"\]') {
  throw "The stylesheet does not visibly identify the current page tab."
}

Write-Output "CEAM+ page and navigation structure: PASS"

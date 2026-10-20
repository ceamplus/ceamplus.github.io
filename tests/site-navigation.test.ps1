$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$mainPages = @(
  "index.html",
  "dashboard.html",
  "scenario-studio-preview.html",
  "personas.html",
  "analytics-lab.html",
  "change-consulting.html",
  "marketing.html",
  "ai-technology.html",
  "sustainability.html",
  "research.html",
  "consulting.html",
  "about.html",
  "assessments.html",
  "surveys.html",
  "assessment-center.html",
  "applications.html",
  "workflow.html",
  "contact.html",
  "ai-solutions.html",
  "framework.html",
  "values.html",
  "mission.html",
  "philosophy.html",
  "auth.html"
)

$requiredNavigation = [ordered]@{
  "dashboard.html" = "Dashboard"
  "analytics-lab.html" = "Marketing Analytics Lab"
  "assessment-center.html" = "Assessment Center"
  "personas.html" = "Personas"
  "index.html" = "Home"
  "research.html" = "Research"
  "ai-technology.html" = "AI"
  "consulting.html" = "Consulting"
  "about.html" = "About"
  "scenario-studio-preview.html" = "Scenario Studio Preview"
}

foreach ($page in $mainPages) {
  $path = Join-Path $root $page
  if (-not (Test-Path $path)) {
    throw "Missing page: $page"
  }

  $html = Get-Content $path -Raw
  $navigation = [regex]::Match($html, '<nav class="nav-links"[^>]*>([\s\S]*?)</nav>')
  if (-not $navigation.Success) {
    throw "$page does not contain the primary navigation."
  }

  foreach ($entry in $requiredNavigation.GetEnumerator()) {
    $pattern = '<a href="' + [regex]::Escape($entry.Key) + '"(?: aria-current="page")?>' + [regex]::Escape($entry.Value) + '</a>'
    if ($navigation.Value -notmatch $pattern) {
      throw "$page is missing navigation link: $($entry.Value)"
    }
  }

  $navigationLinks = [regex]::Matches($navigation.Value, '<a href="([^"]+)"')
  $actualNavigation = @($navigationLinks | ForEach-Object { $_.Groups[1].Value })
  if (($actualNavigation -join ',') -ne ($requiredNavigation.Keys -join ',')) {
    throw "$page does not contain the ten navigation destinations in the intended order."
  }
  if ($navigation.Value -notmatch '<details class="nav-more"[^>]*>\s*<summary>Explore</summary>\s*<div class="nav-secondary">') {
    throw "$page is missing the accessible native disclosure for secondary destinations."
  }
  if ($html -notmatch '<script src="js/header-navigation\.js[^\"]*" defer></script>') {
    throw "$page is missing the shared keyboard navigation enhancement."
  }
  if ($html -notmatch '<a class="header-action" href="consulting\.html">Consulting Process</a>') {
    throw "$page is missing the Consulting Process action."
  }

  $expectedCurrentPage = if ($page -in @("framework.html", "applications.html", "values.html", "mission.html", "philosophy.html")) {
    "research.html"
  } elseif ($page -eq "ai-solutions.html") {
    "ai-technology.html"
  } elseif ($page -in @("change-consulting.html", "workflow.html")) {
    "consulting.html"
  } elseif ($page -in @("assessments.html", "surveys.html")) {
    ""
  } elseif ($page -in @("marketing.html", "sustainability.html", "contact.html", "auth.html")) {
    ""
  } else {
    $page
  }
  $currentLinks = [regex]::Matches($navigation.Value, '<a href="([^"]+)" aria-current="page">([^<]+)</a>')
  if ($expectedCurrentPage -eq "") {
    if ($currentLinks.Count -ne 0) {
      throw "$page should not highlight a main navigation tab."
    }
    continue
  }
  if ($currentLinks.Count -ne 1) {
    throw "$page must contain exactly one current-page tab."
  }
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

if ($framework -notmatch [regex]::Escape("Understanding how people and organizations adopt, resist, and sustain change in uncertain environments.")) {
  throw "framework.html is missing the stable CEAM+ research identity."
}

$homepage = Get-Content (Join-Path $root "index.html") -Raw
@(
  "Marketing Intelligence for Better Decisions",
  "Explore the Dashboard",
  "Explore the CEAM+ Framework",
  "marketing research",
  "Optionality = agency",
  "enough agency remains when it does not"
) | ForEach-Object {
  if ($homepage -notmatch [regex]::Escape($_)) {
    throw "index.html is missing repositioning content: $_"
  }
}

if ($homepage -notmatch '<a class="button primary" href="dashboard\.html">Explore the Dashboard</a>') {
  throw "index.html is missing its primary link to the Dashboard."
}

$marketing = Get-Content (Join-Path $root "marketing.html") -Raw
if ($marketing -notmatch [regex]::Escape("Marketing Research and Customer Insight")) {
  throw "marketing.html is missing its marketing research heading."
}

$aiTechnology = Get-Content (Join-Path $root "ai-technology.html") -Raw
if ($aiTechnology -notmatch [regex]::Escape("CEAM+ is not an AI sales framework.")) {
  throw "ai-technology.html is missing the non-sales positioning."
}

$consulting = Get-Content (Join-Path $root "consulting.html") -Raw
@("Assess", "Understand", "Design", "Implement", "Measure", "Adapt") | ForEach-Object {
  if ($consulting -notmatch "<h3>$([regex]::Escape($_))</h3>") {
    throw "consulting.html is missing process step: $_"
  }
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

$legacy = Get-Content (Join-Path $root "assessments.html") -Raw
if ($legacy -notmatch 'Earlier short surveys retired' -or $legacy -match 'data-start-assessment') { throw "Legacy survey retirement route is missing or starts an engine." }

$values = Get-Content (Join-Path $root "values.html") -Raw
if ($values -match 'http-equiv="refresh"') {
  throw "values.html still redirects instead of showing the Mission & Values page."
}

@(
  "Our Mission, Values &amp; Philosophy",
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

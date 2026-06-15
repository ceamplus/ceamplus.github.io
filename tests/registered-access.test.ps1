$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

foreach ($page in @("workflow.html", "ai-solutions.html")) {
  $html = Get-Content (Join-Path $root $page) -Raw

  if ($html -notmatch 'data-requires-approval="true"') {
    throw "$page is not marked as requiring approval."
  }

  if ($html -notmatch 'data-auth-gate') {
    throw "$page is missing the public access gate."
  }

  if ($html -notmatch 'data-protected-content hidden') {
    throw "$page is missing hidden protected content."
  }

  if ($html -notmatch 'auth\.js\?v=20260615-registered-access') {
    throw "$page does not load the registered-access script."
  }
}

foreach ($file in @("auth.html", "auth.js", "auth-config.js", "auth-config.example.js")) {
  if (-not (Test-Path (Join-Path $root $file))) {
    throw "Missing auth file: $file"
  }
}

$allPublicFiles = Get-ChildItem $root -Recurse -File |
  Where-Object { $_.FullName -notmatch '\\.git\\|\\.superpowers\\' }

foreach ($file in $allPublicFiles) {
  $content = Get-Content $file.FullName -Raw
  if ($content -match 'SUPABASE_SERVICE_ROLE_KEY\s*=\s*["''][^"'']+["'']') {
    throw "Possible committed service-role key in $($file.FullName)"
  }
}

Get-ChildItem $root -Filter "*.html" | ForEach-Object {
  $html = Get-Content $_.FullName -Raw
  if ($html -match 'Contact Me') {
    throw "$($_.Name) still contains Contact Me."
  }
  if ($html -notmatch 'Contact a Consultant') {
    throw "$($_.Name) is missing Contact a Consultant."
  }
}

Write-Output "CEAM+ registered access gates: PASS"

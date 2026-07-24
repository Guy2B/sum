[CmdletBinding()]
param([string]$AppPath = "app.html")

$ErrorActionPreference = "Stop"

function Backup-File([string]$Path) {
  if (Test-Path $Path) {
    $backup = "$Path.before-v8.1"
    if (-not (Test-Path $backup)) {
      Copy-Item $Path $backup
    }
  }
}

$required = @(
  "modules/entity-engine/memory-v8.1.js",
  "modules/entity-engine/inspector.js",
  "modules/entity-engine/inspector.css",
  "modules/entity-engine/browser-loader-v8.1.js",
  "tests/entity-engine/v8.1-graph-inspector.test.js"
)

foreach ($path in $required) {
  if (-not (Test-Path $path)) {
    throw "Missing patch file: $path"
  }
}

if (-not (Test-Path $AppPath)) {
  throw "Application file not found: $AppPath"
}

Backup-File $AppPath
if (Test-Path "service-worker.js") {
  Backup-File "service-worker.js"
}

$html = Get-Content $AppPath -Raw
$styleTag = '<link rel="stylesheet" href="modules/entity-engine/inspector.css">'
$scripts = @(
  '<script src="modules/entity-engine/memory-v8.1.js"></script>',
  '<script src="modules/entity-engine/inspector.js"></script>',
  '<script src="modules/entity-engine/browser-loader-v8.1.js"></script>'
)

if ($html -notmatch [regex]::Escape($styleTag)) {
  $html = $html -replace '</head>', "  $styleTag`r`n</head>"
}

foreach ($script in $scripts) {
  if ($html -notmatch [regex]::Escape($script)) {
    $html = $html -replace '</body>', "  $script`r`n</body>"
  }
}

Set-Content $AppPath $html -Encoding UTF8

if (Test-Path "service-worker.js") {
  $sw = Get-Content "service-worker.js" -Raw
  $sw = $sw -replace "sigma-cache-v[\d.]+", "sigma-cache-v8.1"
  Set-Content "service-worker.js" $sw -Encoding UTF8
}

Write-Host ""
Write-Host "Checking JavaScript syntax..." -ForegroundColor Cyan
node --check modules\entity-engine\memory-v8.1.js
if ($LASTEXITCODE -ne 0) { throw "memory-v8.1.js syntax check failed." }
node --check modules\entity-engine\inspector.js
if ($LASTEXITCODE -ne 0) { throw "inspector.js syntax check failed." }
node --check modules\entity-engine\browser-loader-v8.1.js
if ($LASTEXITCODE -ne 0) { throw "browser-loader-v8.1.js syntax check failed." }
node --check tests\entity-engine\v8.1-graph-inspector.test.js
if ($LASTEXITCODE -ne 0) { throw "V8.1 test syntax check failed." }

Write-Host ""
Write-Host "Running V8.1 tests..." -ForegroundColor Cyan
node --test tests\entity-engine\v8.1-graph-inspector.test.js
if ($LASTEXITCODE -ne 0) {
  throw "V8.1 tests failed."
}

Write-Host ""
Write-Host "Sigma V8.1 installed successfully." -ForegroundColor Green
Write-Host "Runtime API: window.SIGMA_ENTITY_ENGINE.mountInspector(...)" -ForegroundColor DarkGray

$ErrorActionPreference = "Stop"

if (Test-Path "app.html.before-v8.1") {
  Copy-Item "app.html.before-v8.1" "app.html" -Force
}

if (Test-Path "service-worker.js.before-v8.1") {
  Copy-Item "service-worker.js.before-v8.1" "service-worker.js" -Force
}

Remove-Item "modules/entity-engine/memory-v8.1.js" -Force -ErrorAction SilentlyContinue
Remove-Item "modules/entity-engine/inspector.js" -Force -ErrorAction SilentlyContinue
Remove-Item "modules/entity-engine/inspector.css" -Force -ErrorAction SilentlyContinue
Remove-Item "modules/entity-engine/browser-loader-v8.1.js" -Force -ErrorAction SilentlyContinue
Remove-Item "tests/entity-engine/v8.1-graph-inspector.test.js" -Force -ErrorAction SilentlyContinue

Write-Host "Sigma V8.1 rollback completed." -ForegroundColor Green

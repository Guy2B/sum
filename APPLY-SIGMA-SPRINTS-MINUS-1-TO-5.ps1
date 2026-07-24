param(
  [string]$Target = 'C:\Dev\sum'
)
$ErrorActionPreference = 'Stop'
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path (Join-Path $Target '.git'))) { throw "Le dépôt Git attendu est absent de $Target" }
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path (Split-Path -Parent $Target) "sum-backup-$stamp"
Write-Host "Sauvegarde de sécurité vers $backup"
New-Item -ItemType Directory -Force -Path $backup | Out-Null
robocopy $Target $backup /E /XD .git node_modules .firebase /XF *.env .env* | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Échec de la sauvegarde robocopy ($LASTEXITCODE)" }
Write-Host "Application de la livraison dans le dépôt existant"
robocopy $Source $Target /E /XD .git node_modules /XF APPLY-SIGMA-SPRINTS-MINUS-1-TO-5.ps1 | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Échec de la copie robocopy ($LASTEXITCODE)" }
foreach ($entry in @('backend','functions\node_modules','functions\Select-String','functions\Write-Host','functions\}Get-ChildItem','functions\}firebase','.firebase')) {
  $path = Join-Path $Target $entry
  if (Test-Path $path) { Remove-Item $path -Recurse -Force }
}
Set-Location $Target
npm ci
npm run verify
Write-Host "Livraison appliquée. Vérifie git status puis crée ton commit."

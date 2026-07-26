param(
  [Parameter(Mandatory=$true)][string]$Target,
  [switch]$CommitAndPush,
  [switch]$DeployFirebase,
  [string]$CommitMessage = "Sigma release 614: consolidation and synchronized deployment",
  [string]$FirebaseProject = "project-sum-b961a",
  [string]$PublicUrl = "https://project-sum-b961a.web.app/app.html"
)

$ErrorActionPreference = "Stop"
$Target = (Resolve-Path $Target).Path
Push-Location $Target
try {
  $app = Join-Path $Target "app.html"
  if (-not (Test-Path -LiteralPath $app)) { throw "app.html not found" }

  $required = @(
    "SIGMA-ESSENTIAL-CONTEXT-V2",
    "SIGMA-UTF8-EXPERIENCE-POLISH-V2",
    "SIGMA-LIFE-JOURNEY-CALENDAR-V3",
    "SIGMA-LIFE-SUPPORT-COORDINATION-V3",
    "SIGMA-RELEASE-SYNC-614"
  )
  $html = Get-Content -LiteralPath $app -Raw -Encoding UTF8
  $missing = @($required | Where-Object { -not $html.Contains($_) })
  if ($missing.Count -gt 0) { throw "Local app is incomplete. Missing markers: $($missing -join ', ')" }

  & node --test tests/release-sync/*.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Release synchronization tests failed" }

  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git command not found" }
  $inside = (& git rev-parse --is-inside-work-tree 2>$null)
  if ($inside -ne "true") { throw "$Target is not a Git work tree" }

  $branch = (& git branch --show-current).Trim()
  $remote = (& git remote get-url origin 2>$null).Trim()
  $headBefore = (& git rev-parse HEAD).Trim()

  if ($CommitAndPush) {
    & git add --all
    $pending = (& git status --porcelain)
    if ($pending) {
      & git commit -m $CommitMessage
      if ($LASTEXITCODE -ne 0) { throw "Git commit failed" }
    }
    & git push origin $branch
    if ($LASTEXITCODE -ne 0) { throw "Git push failed" }
  }

  $headAfter = (& git rev-parse HEAD).Trim()
  $status = (& git status --porcelain)
  if ($CommitAndPush -and $status) { throw "Git work tree is not clean after push" }

  $firebaseJson = Join-Path $Target "firebase.json"
  if (-not (Test-Path -LiteralPath $firebaseJson)) { throw "firebase.json not found" }
  $firebase = Get-Content -LiteralPath $firebaseJson -Raw -Encoding UTF8 | ConvertFrom-Json
  $public = $firebase.hosting.public
  if (-not $public) { throw "hosting.public is missing in firebase.json" }

  $publicRoot = if ($public -eq ".") { $Target } else { Join-Path $Target $public }
  if (-not (Test-Path -LiteralPath $publicRoot)) { throw "Firebase public folder not found: $publicRoot" }
  $publicApp = Join-Path $publicRoot "app.html"

  if ($publicRoot -ne $Target) {
    New-Item -ItemType Directory -Path $publicRoot -Force | Out-Null
    Copy-Item -LiteralPath $app -Destination $publicApp -Force
    foreach ($dir in @("product","modules","assets")) {
      $src = Join-Path $Target $dir
      $dst = Join-Path $publicRoot $dir
      if (Test-Path -LiteralPath $src) {
        New-Item -ItemType Directory -Path $dst -Force | Out-Null
        Copy-Item -LiteralPath (Join-Path $src "*") -Destination $dst -Recurse -Force
      }
    }
  }

  $publicHtml = Get-Content -LiteralPath $publicApp -Raw -Encoding UTF8
  $publicMissing = @($required | Where-Object { -not $publicHtml.Contains($_) })
  if ($publicMissing.Count -gt 0) { throw "Firebase public app is incomplete: $($publicMissing -join ', ')" }

  if ($DeployFirebase) {
    if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) { throw "firebase command not found" }
    & firebase deploy --only hosting --project $FirebaseProject
    if ($LASTEXITCODE -ne 0) { throw "Firebase deployment failed" }

    Start-Sleep -Seconds 5
    $separator = if ($PublicUrl.Contains("?")) { "&" } else { "?" }
    $verifyUrl = "$PublicUrl${separator}release=614&ts=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
    $response = Invoke-WebRequest -Uri $verifyUrl -UseBasicParsing -Headers @{
      "Cache-Control" = "no-cache"
      "Pragma" = "no-cache"
    }
    $remoteMissing = @($required | Where-Object { -not $response.Content.Contains($_) })
    if ($remoteMissing.Count -gt 0) {
      throw "Firebase is still not synchronized. Missing remote markers: $($remoteMissing -join ', ')"
    }
  }

  $report = [ordered]@{
    release = 614
    local = @{
      path = $app
      markersOk = $true
      gitHeadBefore = $headBefore
      gitHeadAfter = $headAfter
    }
    git = @{
      branch = $branch
      remote = $remote
      clean = -not [bool]$status
      pushed = [bool]$CommitAndPush
    }
    firebase = @{
      project = $FirebaseProject
      publicFolder = $publicRoot
      deployed = [bool]$DeployFirebase
      verifiedUrl = if ($DeployFirebase) { $PublicUrl } else { $null }
    }
    generatedAt = (Get-Date).ToString("o")
  }
  $reportPath = Join-Path $Target "SIGMA-RELEASE-614-STATUS.json"
  $report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $reportPath -Encoding UTF8

  Write-Host ""
  Write-Host "Sigma release 614 synchronized successfully." -ForegroundColor Green
  Write-Host "Local:    release 614"
  Write-Host "Git:      $headAfter"
  Write-Host "Firebase: $(if($DeployFirebase){'deployed and verified'}else{'ready, deployment not requested'})"
  Write-Host "Report:   $reportPath"
}
finally {
  Pop-Location
}

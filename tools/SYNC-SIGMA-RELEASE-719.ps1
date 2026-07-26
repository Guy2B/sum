param(
  [Parameter(Mandatory=$true)][string]$Target,
  [switch]$CommitGit,
  [switch]$PushGit,
  [switch]$DeployHosting,
  [switch]$DeployFirestoreRules,
  [string]$CommitMessage="Sigma release 719 - i18n and Firestore runtime hotfix"
)
$ErrorActionPreference="Stop"
$Target=(Resolve-Path $Target).Path
Push-Location $Target
try {
  & node --test tests/runtime-firestore-hotfix-v1/*.test.mjs
  if($LASTEXITCODE-ne0){throw "Release 719 tests failed"}

  $gitCommit=$null
  if(Test-Path -LiteralPath (Join-Path $Target ".git")){
    if($CommitGit){
      & git add .
      if($LASTEXITCODE-ne0){throw "git add failed"}
      $changes=& git status --porcelain
      if($changes){
        & git commit -m $CommitMessage
        if($LASTEXITCODE-ne0){throw "git commit failed"}
      }
    }
    $gitCommit=(& git rev-parse HEAD).Trim()
    if($PushGit){
      & git push
      if($LASTEXITCODE-ne0){throw "git push failed"}
    }
  }elseif($CommitGit-or$PushGit){
    throw "Target is not a Git repository"
  }

  if($DeployFirestoreRules){
    & firebase deploy --only firestore:rules
    if($LASTEXITCODE-ne0){throw "Firestore rules deployment failed"}
  }
  if($DeployHosting){
    & firebase deploy --only hosting
    if($LASTEXITCODE-ne0){throw "Firebase Hosting deployment failed"}
  }

  $status=[ordered]@{
    release=719
    gitCommit=$gitCommit
    gitCommitted=[bool]$CommitGit
    gitPushed=[bool]$PushGit
    firestoreRulesDeployed=[bool]$DeployFirestoreRules
    firebaseHostingDeployed=[bool]$DeployHosting
    generatedAt=(Get-Date).ToString("o")
  }
  $statusPath=Join-Path $Target "SIGMA-RELEASE-719-STATUS.json"
  $status|ConvertTo-Json -Depth 4|Set-Content -LiteralPath $statusPath -Encoding UTF8
  Write-Host "Release 719 status written to $statusPath" -ForegroundColor Green
} finally {
  Pop-Location
}

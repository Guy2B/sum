param(
 [Parameter(Mandatory=$true)][string]$Target,
 [switch]$CommitGit,
 [switch]$PushGit,
 [switch]$DeployFirebase,
 [switch]$DeployFirestoreRules,
 [string]$CommitMessage="Sigma release 704 - Firebase account and profile sync"
)
$ErrorActionPreference="Stop"
$Target=(Resolve-Path $Target).Path
Push-Location $Target
try{
 $app=Join-Path $Target "app.html"
 $html=Get-Content -LiteralPath $app -Raw -Encoding UTF8
 foreach($marker in @("SIGMA-FIREBASE-ACCOUNT-PROFILE-SYNC-V1","content=`"704`"")){
   if(-not$html.Contains($marker)){throw "Release verification failed: $marker"}
 }
 & node --test tests/firebase-account-profile-sync-v1/*.test.mjs
 if($LASTEXITCODE-ne0){throw "Release 704 tests failed"}

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
 }elseif($CommitGit-or$PushGit){throw "Target is not a Git repository"}

 if($DeployFirebase){
   if(-not(Test-Path -LiteralPath (Join-Path $Target "firebase.json"))){throw "firebase.json not found"}
   & firebase deploy --only hosting
   if($LASTEXITCODE-ne0){throw "Firebase Hosting deployment failed"}
 }
 if($DeployFirestoreRules){
   if(-not(Test-Path -LiteralPath (Join-Path $Target "firebase.json"))){throw "firebase.json not found"}
   & firebase deploy --only firestore:rules
   if($LASTEXITCODE-ne0){throw "Firestore rules deployment failed"}
 }

 $status=[ordered]@{
   release=704
   gitCommit=$gitCommit
   gitCommitted=[bool]$CommitGit
   gitPushed=[bool]$PushGit
   firebaseHostingDeployed=[bool]$DeployFirebase
   firestoreRulesDeployed=[bool]$DeployFirestoreRules
   generatedAt=(Get-Date).ToString("o")
 }
 $statusPath=Join-Path $Target "SIGMA-RELEASE-704-STATUS.json"
 $status|ConvertTo-Json -Depth 4|Set-Content -LiteralPath $statusPath -Encoding UTF8
 Write-Host "Release 704 status written to $statusPath" -ForegroundColor Green
}finally{Pop-Location}

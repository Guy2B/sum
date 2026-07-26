param(
 [Parameter(Mandatory=$true)][string]$Target,
 [switch]$CommitGit,
 [switch]$PushGit,
 [switch]$DeployFirebase,
 [switch]$DeployFirestoreRules,
 [string]$CommitMessage="Sigma release 734 - Google unified session and connector recovery"
)
$ErrorActionPreference="Stop"
$Target=(Resolve-Path $Target).Path
Push-Location $Target
try{
 $html=Get-Content -LiteralPath (Join-Path $Target "app.html") -Raw -Encoding UTF8
 foreach($marker in @("SIGMA-GOOGLE-UNIFIED-SESSION-V1","content=`"734`"")){
   if(-not$html.Contains($marker)){throw "Release verification failed: $marker"}
 }
 & node --test tests/google-unified-session-v1/*.test.mjs
 if($LASTEXITCODE-ne0){throw "Release 734 tests failed"}

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
   if($PushGit){& git push;if($LASTEXITCODE-ne0){throw "git push failed"}}
 }elseif($CommitGit-or$PushGit){throw "Target is not a Git repository"}

 if($DeployFirestoreRules){
   & firebase deploy --only firestore:rules
   if($LASTEXITCODE-ne0){throw "Firestore rules deployment failed"}
 }
 if($DeployFirebase){
   & firebase deploy --only hosting
   if($LASTEXITCODE-ne0){throw "Firebase Hosting deployment failed"}
 }

 $status=[ordered]@{
   release=734
   gitCommit=$gitCommit
   gitCommitted=[bool]$CommitGit
   gitPushed=[bool]$PushGit
   firestoreRulesDeployed=[bool]$DeployFirestoreRules
   firebaseHostingDeployed=[bool]$DeployFirebase
   generatedAt=(Get-Date).ToString("o")
 }
 $status|ConvertTo-Json -Depth 4|Set-Content -LiteralPath (Join-Path $Target "SIGMA-RELEASE-734-STATUS.json") -Encoding UTF8
 Write-Host "Release 734 completed successfully." -ForegroundColor Green
}finally{Pop-Location}

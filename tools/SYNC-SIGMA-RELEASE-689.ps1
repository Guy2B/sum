param(
 [Parameter(Mandatory=$true)][string]$Target,
 [switch]$CommitGit,
 [switch]$PushGit,
 [switch]$DeployFirebase,
 [string]$CommitMessage="Sigma release 689 - onboarding life profiles and support"
)
$ErrorActionPreference="Stop"
$Target=(Resolve-Path $Target).Path
Push-Location $Target
try{
 $app=Join-Path $Target "app.html"
 if(-not(Test-Path -LiteralPath $app)){throw "app.html not found"}
 $html=Get-Content -LiteralPath $app -Raw -Encoding UTF8
 foreach($marker in @("SIGMA-ONBOARDING-LIFE-SUPPORT-V1","content=`"689`"")){
   if(-not$html.Contains($marker)){throw "Release verification failed: $marker"}
 }
 & node --test tests/onboarding-life-support-v1/*.test.mjs
 if($LASTEXITCODE-ne0){throw "Release 689 tests failed"}

 $gitCommit=$null
 if(Test-Path -LiteralPath (Join-Path $Target ".git")){
   & git status --short
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

 $status=[ordered]@{
   release=689
   gitCommit=$gitCommit
   gitCommitted=[bool]$CommitGit
   gitPushed=[bool]$PushGit
   firebaseDeployed=[bool]$DeployFirebase
   generatedAt=(Get-Date).ToString("o")
 }
 $statusPath=Join-Path $Target "SIGMA-RELEASE-689-STATUS.json"
 $status|ConvertTo-Json -Depth 4|Set-Content -LiteralPath $statusPath -Encoding UTF8
 Write-Host "Release 689 status written to $statusPath" -ForegroundColor Green
}finally{Pop-Location}

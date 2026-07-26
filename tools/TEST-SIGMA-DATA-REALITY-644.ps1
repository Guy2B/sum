param([Parameter(Mandatory=$true)][string]$Target)
$ErrorActionPreference="Stop"
$Target=(Resolve-Path $Target).Path
$app=Join-Path $Target "app.html"
if(-not(Test-Path -LiteralPath $app)){throw "app.html not found"}
$html=Get-Content -LiteralPath $app -Raw -Encoding UTF8
$markers=@(
 "SIGMA-PRODUCT-CONSOLIDATION-V4",
 "SIGMA-REAL-DATA-AUDIT-V1"
)
$missing=@($markers|Where-Object{-not$html.Contains($_)})
$result=[ordered]@{
 release=644
 path=$Target
 markersOk=$missing.Count-eq0
 missingMarkers=$missing
 firebaseJson=(Test-Path -LiteralPath (Join-Path $Target "firebase.json"))
 modules=@(
  "modules\real-data-audit-v1\data-source-registry-v1.js",
  "modules\real-data-audit-v1\firebase-canonical-model-v1.js",
  "product\real-data-audit-v1-loader.js"
 )|ForEach-Object{[ordered]@{path=$_;exists=Test-Path -LiteralPath (Join-Path $Target $_)}}
 generatedAt=(Get-Date).ToString("o")
}
$out=Join-Path $Target "SIGMA-DATA-REALITY-AUDIT-644.json"
$result|ConvertTo-Json -Depth 6|Set-Content -LiteralPath $out -Encoding UTF8
Write-Host "Audit written to $out" -ForegroundColor Green

param(
  [string]$Url = "http://localhost:3000",
  [string]$Profile = "professional",
  [int]$MaxPages = 50,
  [int]$Concurrency = 2
)

$env:SITE_URL = $Url
if ($Url -match "localhost|127\.0\.0\.1") {
  $env:AUDIT_ALLOW_PRIVATE_NETWORK = "true"
} else {
  $env:AUDIT_ALLOW_PRIVATE_NETWORK = "false"
}
$env:AUDIT_PROFILE = $Profile
$env:AUDIT_MAX_PAGES = $MaxPages
$env:AUDIT_CONCURRENCY = $Concurrency

Write-Host "🚀 Running Omega Site Audit Pro on $Url ($Profile profile, max $MaxPages pages)..." -ForegroundColor Cyan
node scripts/audit-site.mjs

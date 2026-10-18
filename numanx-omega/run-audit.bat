@echo off
set SITE_URL=%~1
if "%SITE_URL%"=="" set SITE_URL=http://localhost:3000
set AUDIT_ALLOW_PRIVATE_NETWORK=true
set AUDIT_PROFILE=professional
set AUDIT_MAX_PAGES=50
set AUDIT_CONCURRENCY=2

echo Starting Omega Site Audit Pro for %SITE_URL%...
node scripts\audit-site.mjs

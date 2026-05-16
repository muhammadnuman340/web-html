@echo off
cd /d "%~dp0"
echo Building Omega X Converter...
call npx vite build
if %errorlevel% neq 0 (
  echo Build failed!
  pause
  exit /b %errorlevel%
)
echo.
echo Starting Node.js server...
node server.js
pause

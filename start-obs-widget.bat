@echo off
cd /d "%~dp0"
echo Starting OBS Social Widget Sync Server...
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js not found! Install Node.js 18+ from https://nodejs.org/
  echo Or simply add index.html directly in OBS as a Local File Browser Source.
  pause
  exit /b 1
)
node server.mjs
pause

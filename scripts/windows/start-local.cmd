@echo off
rem Double-click this file on D:\Medi82026 to start http://localhost:3000
chcp 65001 >nul
cd /d "%~dp0"

if not exist "%CD%\package.json" (
  echo Chybi package.json. Spustte tento soubor ze slozky D:\Medi82026.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo Nainstalujte Node.js LTS z https://nodejs.org a spustte znovu.
  pause
  exit /b 1
)

set "MEDSCOPE_PROJECT_ROOT=%CD%"
set "MEDSCOPE_DATA_ROOT=%CD%\data"
set "MEDSCOPE_LOGS_ROOT=%CD%\logs"
set "SKIP_OPENNEXT_DEV=1"
set "OPENNEXT_CLOUDFLARE_DEV="
set "MEDSCOPE_RUNTIME="
set "NEXT_PUBLIC_SITE_URL=http://localhost:3000"
set "DEFAULT_SITE_LOCALE=cs"
set "INGESTION_LOCALE=cs"
set "PORT=3000"

if not exist "%MEDSCOPE_DATA_ROOT%" mkdir "%MEDSCOPE_DATA_ROOT%"
if not exist "%MEDSCOPE_LOGS_ROOT%" mkdir "%MEDSCOPE_LOGS_ROOT%"

if not exist "%CD%\node_modules\" (
  echo Instaluji zavislosti — prvni spusteni muze trvat nekolik minut...
  call npm install
  if errorlevel 1 (
    echo npm install selhal.
    pause
    exit /b 1
  )
)

echo.
echo MedScopeGlobal z %CD%
echo Otevřete: http://localhost:3000
echo Zastaveni: Ctrl+C
echo.
call npm run dev:d
if errorlevel 1 (
  echo Stranka se nespustila. Zkontrolujte Node.js a zkuste znovu.
  pause
  exit /b 1
)
pause

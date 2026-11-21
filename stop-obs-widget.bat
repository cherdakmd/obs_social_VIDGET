@echo off
echo Stopping OBS Social Widget background server...
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -match 'server\.mjs' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" 2>nul
echo Done.
timeout /t 2 >nul

@echo off
cd /d "%~dp0"
:: إغلاق أي سيرفر قديم بقوة
taskkill /f /im node.exe >nul 2>&1
:: تشغيل النسخة الجديدة
start /b npm run start
timeout /t 5 /nobreak > nul
start http://localhost:3000
exit
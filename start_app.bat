@echo off
:: الدخول لمجلد المشروع
cd /d "%~dp0"

:: إغلاق أي سيرفر قديم لتجنب التعارض
taskkill /f /im node.exe >nul 2>&1

:: تشغيل السيرفر في الخلفية
start /b npm run start

:: انتظار 5 ثوانٍ ليتفعل النظام
timeout /t 5 /nobreak > nul

:: فتح النظام في المتصفح
start http://localhost:3000

exit
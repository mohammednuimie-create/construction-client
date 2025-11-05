@echo off
chcp 65001 >nul
echo ========================================
echo   تشغيل سيرفر الباك إند
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules\" (
    echo جاري تثبيت المكتبات...
    call npm install
    echo.
)

echo جاري تشغيل السيرفر...
echo السيرفر سيعمل على: http://localhost:4000
echo.
echo للإيقاف: اضغط Ctrl+C
echo.

npm run dev

pause

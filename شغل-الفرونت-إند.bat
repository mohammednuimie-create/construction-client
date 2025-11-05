@echo off
chcp 65001 >nul
echo ========================================
echo   تشغيل الفرونت إند
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules\" (
    echo جاري تثبيت المكتبات...
    call npm install
    echo.
)

echo جاري تشغيل الفرونت إند...
echo الفرونت إند سيعمل على: http://localhost:3000
echo.
echo للإيقاف: اضغط Ctrl+C
echo.

npm start

pause


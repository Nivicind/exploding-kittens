@echo off
title Exploding Kittens - Meo No
cd /d "%~dp0"

echo ========================================================
echo        EXPLODING KITTENS - TRO CHOI MEO NO
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay Node.js tren may tinh!
    echo Vui long cai dat Node.js tu https://nodejs.org de choi game.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/3] Dang cai dat thu vien npm...
    call npm install
)

if not exist "dist" (
    echo [2/3] Dang dong goi giao dien build...
    call npm run build
)

echo [3/3] Dang khoi chay may chu game tai cong 3000...
echo.
echo ========================================================
echo   May chu dang chay tai: http://localhost:3000
echo   Trinh duyet se tu dong mo len sau vai giay.
echo   (Nhan Ctrl+C de dung may chu khi choi xong)
echo ========================================================
echo.

start "" "http://localhost:3000"

call npm run start
echo.
echo ========================================================
echo   May chu da dung lai.
echo ========================================================
pause

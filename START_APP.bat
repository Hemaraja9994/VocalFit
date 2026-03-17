@echo off
echo.
echo   =============================
echo     VocalFit - Setup and Start
echo   =============================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo   ERROR: Node.js is not installed.
    echo.
    echo   Please do this FIRST:
    echo     1. Go to https://nodejs.org
    echo     2. Click the green "LTS" button
    echo     3. Run the installer (click Next for everything)
    echo     4. RESTART your computer
    echo     5. Then double-click this file again
    echo.
    pause
    exit /b 1
)

echo   Node.js found!
node -v
echo.

if not exist "node_modules" (
    echo   Installing dependencies (first time only, takes 1-2 minutes)...
    echo.
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo.
        echo   First attempt failed. Trying alternative method...
        call npm install --legacy-peer-deps
    )
    echo.
    echo   Dependencies installed!
) else (
    echo   Dependencies already installed.
)

echo.
echo   =============================
echo     Starting VocalFit...
echo   =============================
echo.
echo   A QR code will appear below.
echo.
echo   HOW TO OPEN ON YOUR PHONE:
echo   --------------------------
echo   Android:
echo     1. Open "Expo Go" app on your phone
echo     2. Tap "Scan QR code"  
echo     3. Point your camera at the QR code below
echo.
echo   iPhone:
echo     1. Open your Camera app
echo     2. Point at the QR code below
echo     3. Tap the Expo notification banner
echo.
echo   IMPORTANT: Your phone and computer must
echo   be on the SAME Wi-Fi network!
echo   =============================
echo.

call npx expo start

pause

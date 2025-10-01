@echo off
echo ========================================
echo    Khelsetu App - Build and Deploy
echo ========================================
echo.

echo [1/4] Building the web app...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error: Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Opening Android Studio...
call npx cap open android

echo.
echo [4/4] Build complete!
echo.
echo Instructions:
echo 1. Android Studio should now be opening
echo 2. Connect your phone via USB and enable USB debugging
echo 3. Click the green "Run" button in Android Studio
echo 4. Select your device when prompted
echo.
echo If you get a white screen, check:
echo - USB debugging is enabled on your phone
echo - Your phone trusts this computer
echo - The app has necessary permissions
echo.
pause
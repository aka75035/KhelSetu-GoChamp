Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Khelsetu App - Build and Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Building the web app..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE"
    }
    Write-Host "✅ Build successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Build failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/5] Fixing mobile asset paths..." -ForegroundColor Yellow
try {
    .\fix-mobile-paths.ps1
    Write-Host "✅ Asset paths fixed for mobile!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not fix asset paths" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/5] Syncing with Capacitor..." -ForegroundColor Yellow
try {
    npx cap sync android
    if ($LASTEXITCODE -ne 0) {
        throw "Capacitor sync failed with exit code $LASTEXITCODE"
    }
    Write-Host "✅ Capacitor sync successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Capacitor sync failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[4/5] Opening Android Studio..." -ForegroundColor Yellow
try {
    npx cap open android
    Write-Host "✅ Android Studio should be opening..." -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not open Android Studio automatically" -ForegroundColor Yellow
    Write-Host "Please open Android Studio manually and import the android folder" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[5/5] Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Instructions:" -ForegroundColor Cyan
Write-Host "1. Android Studio should now be opening" -ForegroundColor White
Write-Host "2. Connect your phone via USB and enable USB debugging" -ForegroundColor White
Write-Host "3. Click the green 'Run' button in Android Studio" -ForegroundColor White
Write-Host "4. Select your device when prompted" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Debug with Chrome Inspect:" -ForegroundColor Cyan
Write-Host "1. Open Chrome → chrome://inspect" -ForegroundColor White
Write-Host "2. Find your app → Click 'Inspect'" -ForegroundColor White
Write-Host "3. Look for console messages: 🚀 📱 ✅ ❌" -ForegroundColor White
Write-Host ""
Write-Host "🔧 If you get a white screen, check:" -ForegroundColor Cyan
Write-Host "- USB debugging is enabled on your phone" -ForegroundColor White
Write-Host "- Your phone trusts this computer" -ForegroundColor White
Write-Host "- The app has necessary permissions" -ForegroundColor White
Write-Host "- Update Android System WebView from Play Store" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
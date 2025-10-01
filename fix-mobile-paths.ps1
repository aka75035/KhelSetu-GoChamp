Write-Host "🔧 Fixing asset paths for mobile deployment..." -ForegroundColor Yellow

# Path to the index.html file
$indexPath = "dist\index.html"

if (Test-Path $indexPath) {
    # Read the content
    $content = Get-Content $indexPath -Raw
    
    # Replace absolute paths with relative paths
    $content = $content -replace 'src="/assets/', 'src="./assets/'
    $content = $content -replace 'href="/assets/', 'href="./assets/'
    
    # Write back to file
    Set-Content $indexPath $content
    
    Write-Host "✅ Asset paths fixed in $indexPath" -ForegroundColor Green
    Write-Host "   Changed /assets/ → ./assets/" -ForegroundColor Gray
} else {
    Write-Host "❌ Could not find $indexPath" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Ready for mobile deployment!" -ForegroundColor Green
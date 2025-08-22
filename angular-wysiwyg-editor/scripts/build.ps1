# PowerShell build script for Windows

Write-Host "Building Angular WYSIWYG Editor Library..." -ForegroundColor Green

# Clean previous build
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Run tests
Write-Host "Running tests..." -ForegroundColor Yellow
npm run test -- --watch=false --browsers=ChromeHeadless

if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed. Build aborted." -ForegroundColor Red
    exit 1
}

# Build the library
Write-Host "Building library..." -ForegroundColor Yellow
npm run build -- ngx-wysiwyg-editor --configuration production

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "Output directory: dist\ngx-wysiwyg-editor" -ForegroundColor Cyan
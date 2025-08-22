# PowerShell script to pack NuGet package

Write-Host "Packing Angular WYSIWYG Editor for NuGet..." -ForegroundColor Green

# Check if dist folder exists
if (-not (Test-Path "dist\ngx-wysiwyg-editor")) {
    Write-Host "Error: dist\ngx-wysiwyg-editor directory not found." -ForegroundColor Red
    Write-Host "Please run .\scripts\build.ps1 first." -ForegroundColor Yellow
    exit 1
}

# Check if NuGet is available
$nugetPath = Get-Command nuget -ErrorAction SilentlyContinue

if (-not $nugetPath) {
    Write-Host "NuGet CLI is not installed. Downloading..." -ForegroundColor Yellow
    
    # Download NuGet CLI
    Invoke-WebRequest -Uri "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" -OutFile "nuget.exe"
    $nugetCmd = ".\nuget.exe"
} else {
    $nugetCmd = "nuget"
}

# Get version from package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$version = $packageJson.version

# Update version in nuspec file
$nuspecContent = Get-Content "ngx-wysiwyg-editor.nuspec"
$nuspecContent = $nuspecContent -replace '<version>.*</version>', "<version>$version</version>"
Set-Content "ngx-wysiwyg-editor.nuspec" $nuspecContent

# Create output directory if it doesn't exist
if (-not (Test-Path "dist\nuget")) {
    New-Item -ItemType Directory -Path "dist\nuget" | Out-Null
}

# Pack the NuGet package
Write-Host "Creating NuGet package version $version..." -ForegroundColor Yellow
& $nugetCmd pack ngx-wysiwyg-editor.nuspec -OutputDirectory .\dist\nuget

if ($LASTEXITCODE -eq 0) {
    Write-Host "NuGet package created successfully!" -ForegroundColor Green
    Write-Host "Package location: .\dist\nuget\NgxWysiwygEditor.$version.nupkg" -ForegroundColor Cyan
} else {
    Write-Host "Failed to create NuGet package." -ForegroundColor Red
    exit 1
}
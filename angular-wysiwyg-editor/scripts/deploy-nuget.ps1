# PowerShell deployment script for NuGet
# Usage: .\scripts\deploy-nuget.ps1 -ApiKey <api-key> [-SourceUrl <source-url>]

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    
    [Parameter(Mandatory=$false)]
    [string]$SourceUrl = "https://api.nuget.org/v3/index.json"
)

# Check if NuGet is available
$nugetPath = Get-Command nuget -ErrorAction SilentlyContinue

if (-not $nugetPath) {
    if (Test-Path ".\nuget.exe") {
        $nugetCmd = ".\nuget.exe"
    } else {
        Write-Host "NuGet CLI is not installed. Please run pack-nuget.ps1 first." -ForegroundColor Red
        exit 1
    }
} else {
    $nugetCmd = "nuget"
}

# Get version from package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$version = $packageJson.version
$packagePath = ".\dist\nuget\NgxWysiwygEditor.$version.nupkg"

# Check if package exists
if (-not (Test-Path $packagePath)) {
    Write-Host "Error: Package not found at $packagePath" -ForegroundColor Red
    Write-Host "Please run .\scripts\pack-nuget.ps1 first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Deploying NgxWysiwygEditor version $version to NuGet..." -ForegroundColor Green
Write-Host "Source: $SourceUrl" -ForegroundColor Cyan

# Push to NuGet
& $nugetCmd push $packagePath -ApiKey $ApiKey -Source $SourceUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host "Package deployed successfully!" -ForegroundColor Green
    Write-Host "Package: NgxWysiwygEditor.$version" -ForegroundColor Cyan
    Write-Host "View at: https://www.nuget.org/packages/NgxWysiwygEditor/$version" -ForegroundColor Cyan
} else {
    Write-Host "Failed to deploy package." -ForegroundColor Red
    exit 1
}
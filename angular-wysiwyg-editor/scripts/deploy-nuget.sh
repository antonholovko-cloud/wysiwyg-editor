#!/bin/bash

# Deployment script for NuGet
# Usage: ./scripts/deploy-nuget.sh [api-key] [source-url]

API_KEY=$1
SOURCE_URL=${2:-https://api.nuget.org/v3/index.json}

if [ -z "$API_KEY" ]; then
    echo "Error: NuGet API key is required."
    echo "Usage: ./scripts/deploy-nuget.sh [api-key] [source-url]"
    exit 1
fi

# Check if nuget is installed
if ! command -v nuget &> /dev/null; then
    if [ -f "./nuget.exe" ]; then
        NUGET_CMD="./nuget.exe"
    else
        echo "NuGet CLI is not installed. Please run pack-nuget.sh first."
        exit 1
    fi
else
    NUGET_CMD="nuget"
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
PACKAGE_PATH="./dist/nuget/NgxWysiwygEditor.$VERSION.nupkg"

# Check if package exists
if [ ! -f "$PACKAGE_PATH" ]; then
    echo "Error: Package not found at $PACKAGE_PATH"
    echo "Please run ./scripts/pack-nuget.sh first."
    exit 1
fi

echo "Deploying NgxWysiwygEditor version $VERSION to NuGet..."
echo "Source: $SOURCE_URL"

# Push to NuGet
$NUGET_CMD push "$PACKAGE_PATH" -ApiKey "$API_KEY" -Source "$SOURCE_URL"

if [ $? -eq 0 ]; then
    echo "Package deployed successfully!"
    echo "Package: NgxWysiwygEditor.$VERSION"
    echo "View at: https://www.nuget.org/packages/NgxWysiwygEditor/$VERSION"
else
    echo "Failed to deploy package."
    exit 1
fi
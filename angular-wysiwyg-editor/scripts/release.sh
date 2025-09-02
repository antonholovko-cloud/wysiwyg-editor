#!/bin/bash

# Comprehensive release script for Angular WYSIWYG Editor
# Usage: ./scripts/release.sh [version] [--publish]

VERSION=$1
PUBLISH_FLAG=$2

if [ -z "$VERSION" ]; then
    echo "Error: Version number is required."
    echo "Usage: ./scripts/release.sh [version] [--publish]"
    echo "Example: ./scripts/release.sh 1.0.1"
    echo "         ./scripts/release.sh 1.0.1 --publish"
    exit 1
fi

echo "=========================================="
echo "Releasing Angular WYSIWYG Editor v$VERSION"
echo "=========================================="

# Update version in all files
echo "Step 1: Updating version numbers..."
./scripts/update-version.sh "$VERSION"

# Build the library
echo ""
echo "Step 2: Building Angular library..."
npm run build:lib

if [ $? -ne 0 ]; then
    echo "Error: Build failed."
    exit 1
fi

# Run tests
echo ""
echo "Step 3: Running tests..."
npm run test:lib

if [ $? -ne 0 ]; then
    echo "Warning: Tests failed. Continue anyway? (y/n)"
    read -r CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo "Release cancelled."
        exit 1
    fi
fi

# Pack NuGet package
echo ""
echo "Step 4: Creating NuGet package..."
./scripts/pack-nuget.sh

if [ $? -ne 0 ]; then
    echo "Error: NuGet package creation failed."
    exit 1
fi

echo ""
echo "=========================================="
echo "Release preparation completed successfully!"
echo "Version: $VERSION"
echo "NuGet Package: ./dist/nuget/NgxWysiwygEditor.$VERSION.nupkg"
echo "=========================================="

# Publish if flag is set
if [ "$PUBLISH_FLAG" == "--publish" ]; then
    echo ""
    echo "Step 5: Publishing to NuGet..."
    
    if [ -z "$NUGET_API_KEY" ]; then
        echo "Error: NUGET_API_KEY environment variable not set."
        echo "Please set it or provide it as a parameter to deploy-nuget.sh"
        exit 1
    fi
    
    ./scripts/deploy-nuget.sh
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "Package published successfully!"
        echo "View at: https://www.nuget.org/packages/NgxWysiwygEditor/$VERSION"
        echo "=========================================="
        
        # Git tag
        echo ""
        echo "Creating git tag v$VERSION..."
        git tag -a "v$VERSION" -m "Release version $VERSION"
        echo "Don't forget to push the tag: git push origin v$VERSION"
    fi
else
    echo ""
    echo "To publish this release, run:"
    echo "  ./scripts/deploy-nuget.sh"
    echo "Or run the full release with publishing:"
    echo "  ./scripts/release.sh $VERSION --publish"
fi
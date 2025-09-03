#!/bin/bash

# Script to update version consistently across all package files
# Usage: ./scripts/update-version.sh [version]

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Error: Version number is required."
    echo "Usage: ./scripts/update-version.sh [version]"
    echo "Example: ./scripts/update-version.sh 1.0.1"
    exit 1
fi

echo "Updating package version to $VERSION..."

# Update package.json
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
    # Update nuspec file
    sed -i '' "s/<version>.*<\/version>/<version>$VERSION<\/version>/" ngx-wysiwyg-editor.nuspec
    # Update Directory.Build.props
    sed -i '' "s/<Version>.*<\/Version>/<Version>$VERSION<\/Version>/" Directory.Build.props
else
    # Linux
    sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
    # Update nuspec file
    sed -i "s/<version>.*<\/version>/<version>$VERSION<\/version>/" ngx-wysiwyg-editor.nuspec
    # Update Directory.Build.props
    sed -i "s/<Version>.*<\/Version>/<Version>$VERSION<\/Version>/" Directory.Build.props
fi

echo "Version updated to $VERSION in:"
echo "  - package.json"
echo "  - ngx-wysiwyg-editor.nuspec"
echo "  - Directory.Build.props"

# Update library package.json if it exists after build
if [ -f "dist/ngx-wysiwyg-editor/package.json" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" dist/ngx-wysiwyg-editor/package.json
    else
        sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" dist/ngx-wysiwyg-editor/package.json
    fi
    echo "  - dist/ngx-wysiwyg-editor/package.json"
fi

echo "Version update complete!"
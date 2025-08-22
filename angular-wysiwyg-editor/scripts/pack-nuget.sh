#!/bin/bash

echo "Packing Angular WYSIWYG Editor for NuGet..."

# Check if dist folder exists
if [ ! -d "dist/ngx-wysiwyg-editor" ]; then
    echo "Error: dist/ngx-wysiwyg-editor directory not found."
    echo "Please run ./scripts/build.sh first."
    exit 1
fi

# Check if nuget is installed
if ! command -v nuget &> /dev/null; then
    echo "NuGet CLI is not installed. Installing..."
    
    # Download NuGet CLI
    curl -o nuget.exe https://dist.nuget.org/win-x86-commandline/latest/nuget.exe
    
    # Make it executable (for Unix-like systems)
    chmod +x nuget.exe
    NUGET_CMD="./nuget.exe"
else
    NUGET_CMD="nuget"
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

# Update version in nuspec file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/<version>.*<\/version>/<version>$VERSION<\/version>/" ngx-wysiwyg-editor.nuspec
else
    # Linux
    sed -i "s/<version>.*<\/version>/<version>$VERSION<\/version>/" ngx-wysiwyg-editor.nuspec
fi

# Pack the NuGet package
echo "Creating NuGet package version $VERSION..."
$NUGET_CMD pack ngx-wysiwyg-editor.nuspec -OutputDirectory ./dist/nuget

if [ $? -eq 0 ]; then
    echo "NuGet package created successfully!"
    echo "Package location: ./dist/nuget/NgxWysiwygEditor.$VERSION.nupkg"
else
    echo "Failed to create NuGet package."
    exit 1
fi
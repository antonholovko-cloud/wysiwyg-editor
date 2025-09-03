#!/bin/bash

echo "Building Angular WYSIWYG Editor Library..."

# Clean previous build
rm -rf dist

# Install dependencies
npm install

# Run tests
echo "Running tests..."
npm run test -- --watch=false --browsers=ChromeHeadless

if [ $? -ne 0 ]; then
    echo "Tests failed. Build aborted."
    exit 1
fi

# Build the library
echo "Building library..."
npm run build -- ngx-wysiwyg-editor --configuration production

if [ $? -ne 0 ]; then
    echo "Build failed."
    exit 1
fi

echo "Build completed successfully!"
echo "Output directory: dist/ngx-wysiwyg-editor"
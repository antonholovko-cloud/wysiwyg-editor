#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting NPM publish process...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Build the library
echo -e "${YELLOW}Building library...${NC}"
npm run build:lib

# Navigate to the dist folder
cd dist/ngx-wysiwyg-editor

# Check if npm is logged in
if ! npm whoami >/dev/null 2>&1; then
    echo -e "${YELLOW}You are not logged in to npm. Please login:${NC}"
    npm login
fi

# Publish to NPM
echo -e "${YELLOW}Publishing to NPM...${NC}"
npm publish --access public

echo -e "${GREEN}✓ Successfully published to NPM!${NC}"

# Return to original directory
cd ../..

echo -e "${GREEN}Done!${NC}"
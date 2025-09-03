#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to patch version bump
BUMP_TYPE=${1:-patch}

echo -e "${GREEN}Starting version bump process...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo -e "${RED}Error: Invalid bump type '$BUMP_TYPE'. Use: major, minor, or patch${NC}"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: $CURRENT_VERSION${NC}"

# Bump version in root package.json
echo -e "${YELLOW}Bumping $BUMP_TYPE version in root package.json...${NC}"
npm version $BUMP_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")

# Update library package.json
echo -e "${YELLOW}Updating library package.json to version $NEW_VERSION...${NC}"
cd projects/ngx-wysiwyg-editor
npm version $NEW_VERSION --no-git-tag-version --allow-same-version
cd ../..

echo -e "${GREEN}✓ Version bumped from $CURRENT_VERSION to $NEW_VERSION${NC}"
echo -e "${GREEN}Done!${NC}"
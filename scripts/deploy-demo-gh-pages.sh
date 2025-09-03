#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting GitHub Pages deployment...${NC}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Get the repository URL
REPO_URL=$(git config --get remote.origin.url)
if [ -z "$REPO_URL" ]; then
    echo -e "${RED}Error: No remote origin found${NC}"
    exit 1
fi

# Extract repository name for base href
REPO_NAME=$(basename -s .git "$REPO_URL")

echo -e "${YELLOW}Building demo for production...${NC}"
# Build with base href for GitHub Pages
ng build demo --base-href "/wysiwyg-editor/"

echo -e "${YELLOW}Installing gh-pages if needed...${NC}"
if ! npm list --depth=0 gh-pages > /dev/null 2>&1; then
    npm install --save-dev gh-pages
fi

echo -e "${YELLOW}Cleaning up gh-pages cache...${NC}"
rm -rf node_modules/.cache/gh-pages 2>/dev/null || true

echo -e "${YELLOW}Deploying to GitHub Pages...${NC}"
npx gh-pages -d dist/demo/browser -f

echo -e "${GREEN}✓ Demo deployed successfully!${NC}"
echo -e "${GREEN}View your demo at: https://antonholovko-cloud.github.io/wysiwyg-editor/${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the changes to appear.${NC}"

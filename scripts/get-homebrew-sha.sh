#!/bin/bash

# Script to get SHA256 for Homebrew formula
# Run this after publishing to npm

set -e

VERSION=${1:-$(node -p "require('./nodejs/package.json').version")}
PACKAGE_NAME="@jaspermayone/slack-profile-cli"

echo "Getting SHA256 for $PACKAGE_NAME@$VERSION..."
echo ""

# Download the tarball
npm pack "$PACKAGE_NAME@$VERSION"

# Get the tarball filename
TARBALL=$(ls jaspermayone-slack-profile-cli-*.tgz | head -n 1)

if [ -z "$TARBALL" ]; then
  echo "Error: Could not find tarball"
  exit 1
fi

echo "Tarball: $TARBALL"
echo ""

# Calculate SHA256
SHA256=$(shasum -a 256 "$TARBALL" | awk '{print $1}')

echo "SHA256: $SHA256"
echo ""

# Get the npm registry URL
NPM_URL="https://registry.npmjs.org/$PACKAGE_NAME/-/slack-profile-cli-$VERSION.tgz"

echo "Update your Homebrew formula with:"
echo "  url \"$NPM_URL\""
echo "  sha256 \"$SHA256\""
echo ""

# Clean up
rm "$TARBALL"
echo "Cleaned up tarball"

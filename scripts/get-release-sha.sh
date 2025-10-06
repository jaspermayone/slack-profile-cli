#!/bin/bash

# Script to get SHA256 for GitHub release tarball (for Homebrew)
# Run this after creating a GitHub release

set -e

VERSION=${1:-$(cd ruby && ruby -r ./lib/slack_profile/version.rb -e "puts SlackProfile::VERSION")}

echo "Getting SHA256 for GitHub release v$VERSION..."
echo ""

# Download the release tarball
TARBALL_URL="https://github.com/jaspermayone/slack-profile-cli/archive/refs/tags/v${VERSION}.tar.gz"
echo "Downloading: $TARBALL_URL"
echo ""

curl -L -o "slack-profile-cli-${VERSION}.tar.gz" "$TARBALL_URL"

# Calculate SHA256
SHA256=$(shasum -a 256 "slack-profile-cli-${VERSION}.tar.gz" | awk '{print $1}')

echo "SHA256: $SHA256"
echo ""

echo "Update Formula/slack-profile.rb with:"
echo "  url \"$TARBALL_URL\""
echo "  sha256 \"$SHA256\""
echo ""

# Clean up
rm "slack-profile-cli-${VERSION}.tar.gz"
echo "Cleaned up tarball"

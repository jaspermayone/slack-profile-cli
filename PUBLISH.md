# Publishing Guide

This document explains how to publish updates for both Node.js and Ruby versions.

## Publishing Node.js Version to npm

```bash
cd nodejs

# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Publish to npm
npm publish

# 3. Update Homebrew formula (if needed)
cd ..
./scripts/get-homebrew-sha.sh
# Update Formula/slack-profile-nodejs.rb with new SHA256
```

## Publishing Ruby Version to RubyGems

```bash
cd ruby

# 1. Update version in lib/slack_profile/version.rb
# Edit the VERSION constant

# 2. Build the gem
gem build slack_profile.gemspec

# 3. Push to RubyGems
gem push slack_profile-1.0.0.gem

# 4. Tag and push to GitHub
cd ..
git add ruby/lib/slack_profile/version.rb
git commit -m "Bump version to 1.0.0"
git tag v1.0.0
git push && git push --tags
```

## Publishing to Homebrew

### First Time Setup

1. **Create a Homebrew tap repository on GitHub:**
   - Go to: https://github.com/new
   - Repository name: `homebrew-slack-profile`
   - Description: "Homebrew tap for slack-profile CLI"
   - Make it public
   - Create repository

2. **Initialize the tap with your formula:**
   ```bash
   # Clone your new tap repository
   git clone https://github.com/jaspermayone/homebrew-tap.git
   cd homebrew-slack-profile

   # Create Formula directory
   mkdir Formula

   # Copy the formula
   cp /path/to/slack-profile-cli/Formula/slack-profile.rb Formula/

   # Commit and push
   git add .
   git commit -m "Add slack-profile formula"
   git push
   ```

3. **Users can now install with:**
   ```bash
   brew tap jaspermayone/slack-profile
   brew install slack-profile
   ```

### Updating the Formula (After Each Release)

When you publish a new version to npm:

1. **Get the new SHA256:**
   ```bash
   cd /path/to/slack-profile-cli
   ./scripts/get-homebrew-sha.sh
   ```

2. **Update the formula in your tap repository:**
   ```bash
   cd /path/to/homebrew-slack-profile

   # Edit Formula/slack-profile.rb
   # Update the version number in the URL
   # Update the sha256 value

   git add Formula/slack-profile.rb
   git commit -m "Update slack-profile to v1.x.x"
   git push
   ```

3. **Users will automatically get the update:**
   ```bash
   brew update
   brew upgrade slack-profile
   ```

## Complete Release Workflow

Here's the complete workflow when releasing a new version:

```bash
# 1. In slack-profile-cli repo
cd /path/to/slack-profile-cli

# 2. Update version and publish to npm
npm version patch
npm publish
git push && git push --tags

# 3. Get SHA256 for Homebrew
./scripts/get-homebrew-sha.sh

# 4. Update Homebrew formula
cd /path/to/homebrew-slack-profile
# Edit Formula/slack-profile.rb with new version and SHA256
git add Formula/slack-profile.rb
git commit -m "Update slack-profile to $(node -p 'require("../slack-profile-cli/package.json").version')"
git push

# 5. Create GitHub release (optional but recommended)
# Go to https://github.com/jaspermayone/slack-profile-cli/releases/new
# Tag: v1.x.x
# Title: Release v1.x.x
# Describe changes
```

## Current Status

- ✅ npm package: https://www.npmjs.com/package/@jaspermayone/slack-profile-cli
- ✅ Formula ready: `Formula/slack-profile.rb` with correct SHA256
- ⏳ Next step: Create `homebrew-slack-profile` repository on GitHub
- ⏳ Copy formula to tap repository

## Testing

Before publishing, test the formula locally:

```bash
# Install from local formula
brew install --build-from-source ./Formula/slack-profile.rb

# Test it works
slack-profile --help
slack-profile --version

# Uninstall
brew uninstall slack-profile
```

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [Homebrew Formula Cookbook](https://docs.brew.sh/Formula-Cookbook)
- [Creating a Homebrew Tap](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap)

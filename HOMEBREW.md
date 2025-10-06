# Publishing to Homebrew

This guide explains how to submit your formula to the official Homebrew repository (homebrew-core).

## Prerequisites for homebrew-core Submission

Before submitting to homebrew-core, your project should meet these requirements:

### Notability Requirements (one of these):
- ✅ 30+ GitHub stars
- ✅ 30+ GitHub forks
- ✅ 75+ GitHub watchers
- ✅ Notable/widely-used project in its category

### Other Requirements:
- ✅ Stable for 30+ days
- ✅ Uses versioned releases
- ✅ Open source license
- ✅ Works on macOS
- ⚠️ Preferably builds from source (Node.js packages are accepted but scrutinized)

## Steps to Submit to homebrew-core

### 1. Set Up homebrew/core Tap

```bash
# Set environment variable to enable local tap
export HOMEBREW_NO_INSTALL_FROM_API=1

# Clone homebrew/core tap
brew tap --force homebrew/core
```

### 2. Create and Refine Your Formula

The formula at `Formula/slack-profile.rb` has been created. Copy it to the homebrew-core tap:

```bash
# Find the homebrew/core tap location
CORE_TAP=$(brew --repository homebrew/core)
echo "homebrew/core is at: $CORE_TAP"

# Copy the formula (formulas are organized by first letter)
cp Formula/slack-profile.rb "$CORE_TAP/Formula/s/slack-profile.rb"
```

### 3. Install and Test Your Formula

```bash
# Install from source
brew install --build-from-source slack-profile

# Test functionality
slack-profile --version
slack-profile --help

# Run the formula's test
brew test slack-profile

# Uninstall for clean testing
brew uninstall slack-profile
```

### 4. Audit Your Formula

Run the strict audit with all checks:

```bash
brew audit --strict --new --online slack-profile
```

Fix any errors or warnings that appear. Common issues:
- Missing or incorrect test block
- Incorrect dependency specification
- Style/formatting issues
- License detection problems

### 5. Fork and Prepare homebrew-core

```bash
# Go to GitHub and fork:
# https://github.com/Homebrew/homebrew-core

# Add your fork as a remote
cd "$(brew --repository homebrew/core)"
git remote add YOUR_USERNAME https://github.com/YOUR_USERNAME/homebrew-core.git

# Create a branch for your formula
git checkout -b slack-profile

# Copy your tested formula
cp /path/to/slack-profile-cli/Formula/slack-profile.rb Formula/s/slack-profile.rb

# Final audit
brew audit --strict --new --online slack-profile

# Final install test
brew install --build-from-source slack-profile
brew test slack-profile
```

### 6. Commit Your Formula

```bash
# Stage the formula
git add Formula/s/slack-profile.rb

# Commit with standard format
git commit -m "slack-profile 1.0.0 (new formula)"

# Push to your fork
git push YOUR_USERNAME slack-profile
```

### 7. Submit Pull Request

1. Go to: https://github.com/Homebrew/homebrew-core
2. You should see a banner to create a PR from your recently pushed branch
3. Click "Compare & pull request"
4. Title: `slack-profile 1.0.0 (new formula)`
5. The description will auto-populate, but ensure it includes:
   - Link to homepage
   - Brief description of what the tool does
   - Confirmation that `brew install`, `brew test`, and `brew audit` all pass

### 8. Respond to Review Feedback

Homebrew maintainers will review your PR. Common feedback:
- Formula style/formatting issues
- Test improvements needed
- Better dependency specification
- Documentation or naming clarifications

To update your PR:
```bash
# Make changes to the formula
cd "$(brew --repository homebrew/core)"
# Edit Formula/s/slack-profile.rb

# Test again
brew audit --strict --new --online slack-profile
brew reinstall --build-from-source slack-profile
brew test slack-profile

# Commit and push updates
git add Formula/s/slack-profile.rb
git commit -m "Address review feedback"
git push YOUR_USERNAME slack-profile
```

## Alternative: Custom Tap (Faster Approval)

If you want immediate availability without waiting for homebrew-core approval, create a custom tap:

```bash
# Create a repository: homebrew-slack-profile
# Add Formula/slack-profile.rb to it
# Users install with:
brew tap jaspermayone/slack-profile
brew install slack-profile
```

This gives you full control and faster updates, but users need to add your tap first.

## Which Formula to Submit?

The main `Formula/slack-profile.rb` builds from the **Ruby source** (recommended for Homebrew).

If you want to submit the Node.js version instead, use `Formula/slack-profile-nodejs.rb`.

## Getting the SHA256 for GitHub Release

After creating a GitHub release:

```bash
./scripts/get-release-sha.sh
# This will download the release tarball and calculate the SHA256
# Update Formula/slack-profile.rb with the output
```

## Testing Your Formula Locally

```bash
# Install from local formula file
brew install --build-from-source ./Formula/slack-profile.rb

# Test it works
slack-profile --help

# Uninstall
brew uninstall slack-profile
```

## Current Status

- ✅ Published to npm: `@jaspermayone/slack-profile-cli`
- ⏳ Homebrew tap: Create `homebrew-slack-profile` repository
- ⏳ Update SHA256 in formula

## Resources

- [Homebrew Formula Cookbook](https://docs.brew.sh/Formula-Cookbook)
- [How to Create a Homebrew Tap](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap)
- [Node.js Formula Documentation](https://docs.brew.sh/Node-for-Formula-Authors)

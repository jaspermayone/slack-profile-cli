# Quick Start Guide

## What's Been Done

✅ **Token Support Added**: Users can now provide their Slack token in three ways:
1. Command-line flag: `--token xoxp-xxx`
2. Environment variable: `export SLACK_TOKEN=xoxp-xxx`
3. .env file: `SLACK_TOKEN=xoxp-xxx`

✅ **Profile Fetching**: The CLI now fetches custom field definitions on startup in interactive mode (no user ID required)

✅ **Homebrew Formula Created**: Ready-to-use formula at `Formula/slack-profile.rb` with correct SHA256

✅ **Documentation Updated**: README, HOMEBREW.md, and PUBLISH.md all updated

## For Users

### Installation

**Via npm:**
```bash
npm install -g @jaspermayone/slack-profile-cli
```

**Via Homebrew (once published):**
```bash
brew install slack-profile
```

### Quick Usage

```bash
# Set token in your shell profile (~/.zshrc or ~/.bashrc)
export SLACK_TOKEN=xoxp-your-token-here

# Or use the --token flag for one-off commands
slack-profile --token xoxp-xxx interactive

# Interactive mode (recommended)
slack-profile

# List all available fields
slack-profile list-fields

# Set a field
slack-profile set-field -u U1234567890 -n title -v "Engineer"
```

## For You (Publishing)

### Update the Package

```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Publish to npm
npm publish

# 3. Push to GitHub
git push && git push --tags

# 4. Get new SHA256 for Homebrew
./scripts/get-homebrew-sha.sh
```

### Publish to Homebrew

See `HOMEBREW.md` for complete instructions. Quick version:

```bash
# 1. Set up homebrew-core tap
export HOMEBREW_NO_INSTALL_FROM_API=1
brew tap --force homebrew/core

# 2. Copy formula to homebrew-core
CORE_TAP=$(brew --repository homebrew/core)
cp Formula/slack-profile.rb "$CORE_TAP/Formula/s/slack-profile.rb"

# 3. Test thoroughly
brew install --build-from-source slack-profile
brew test slack-profile
brew audit --strict --new --online slack-profile

# 4. Fork homebrew-core on GitHub and submit PR
# See HOMEBREW.md for detailed PR submission steps
```

## File Overview

- **index.js** - Main CLI code (updated with --token support and profile fetching)
- **Formula/slack-profile.rb** - Homebrew formula (ready to submit)
- **scripts/get-homebrew-sha.sh** - Helper to get SHA256 for Homebrew updates
- **HOMEBREW.md** - Detailed Homebrew submission guide
- **PUBLISH.md** - Complete publishing workflow
- **README.md** - User documentation

## Next Steps

1. ✅ Code is ready and token support added
2. ✅ Homebrew formula created
3. ⏳ Submit to homebrew-core (follow HOMEBREW.md)
4. ⏳ Update README badges when Homebrew is published

## Testing the Changes

```bash
# Test token via command line
node index.js --token $SLACK_TOKEN list-fields

# Test interactive mode with profile fetching
node index.js interactive

# Test the Homebrew formula locally
brew install --build-from-source ./Formula/slack-profile.rb
slack-profile --help
brew test slack-profile
brew uninstall slack-profile
```

## Resources

- npm package: https://www.npmjs.com/package/@jaspermayone/slack-profile-cli
- GitHub repo: https://github.com/jaspermayone/slack-profile-cli
- Homebrew docs: https://docs.brew.sh/Formula-Cookbook
- Slack API: https://api.slack.com/apps

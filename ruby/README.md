# Slack Profile CLI (Ruby)

Ruby gem implementation of the Slack Profile CLI tool.

## Installation

### Via RubyGems

```bash
gem install slack_profile
```

### From Source

```bash
cd ruby
bundle install
rake install
```

## Setup

Configure your Slack token (choose one method):

**Option 1: Environment variable (recommended)**
```bash
export SLACK_TOKEN=xoxp-your-token-here
```

**Option 2: .env file**
```bash
cp .env.example .env
# Edit .env and add your token
```

**Option 3: Command line flag**
```bash
slack-profile --token xoxp-your-token-here <command>
```

## Usage

### Interactive Mode

```bash
slack-profile
# or
slack-profile interactive
```

### CLI Commands

```bash
# Show version
slack-profile version

# List available fields
slack-profile list-fields

# Set a single field
slack-profile set-field -u U1234567890 -n title -v "Engineer"

# Set multiple fields
slack-profile set-profile -u U1234567890 -p '{"title":"CTO","phone":"555-1234"}'

# Batch update
slack-profile batch-field -u U123,U456,U789 -n title -v "Engineer"
```

## Development

```bash
# Install dependencies
bundle install

# Run tests (when available)
rake spec

# Build the gem
gem build slack_profile.gemspec

# Install locally
gem install ./slack_profile-1.0.0.gem
```

## Publishing to RubyGems

```bash
# Build the gem
gem build slack_profile.gemspec

# Push to RubyGems
gem push slack_profile-1.0.0.gem

# Create GitHub release for Homebrew
git tag v1.0.0
git push origin v1.0.0
```

See the main [README](../README.md) for full documentation.

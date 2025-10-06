# Slack Profile CLI (Node.js)

Node.js implementation of the Slack Profile CLI tool.

## Installation

### Via npm (Global)

```bash
npm install -g @jaspermayone/slack-profile-cli
```

### From Source

```bash
cd nodejs
npm install
npm link
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
# List available fields
slack-profile list-fields

# Set a single field
slack-profile set-field -u U1234567890 -n title -v "Engineer"

# Set multiple fields
slack-profile set-profile -u U1234567890 -p '{"title":"CTO","phone":"555-1234"}'

# Batch update
slack-profile batch-field -u U123,U456,U789 -n title -v "Engineer"
```

## Publishing to npm

```bash
npm version patch  # or minor/major
npm publish
git push && git push --tags
```

See the main [README](../README.md) for full documentation.

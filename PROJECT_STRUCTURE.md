# Project Structure

This repository contains **two implementations** of the Slack Profile CLI tool: one in Node.js and one in Ruby.

## Directory Layout

```
slack-profile-cli/
├── nodejs/                 # Node.js implementation
│   ├── index.js           # Main CLI code
│   ├── package.json       # npm package configuration
│   ├── .env.example       # Environment variable template
│   └── README.md          # Node.js-specific documentation
│
├── ruby/                  # Ruby implementation
│   ├── lib/
│   │   ├── slack_profile.rb          # Main module
│   │   └── slack_profile/
│   │       ├── version.rb            # Version constant
│   │       ├── client.rb             # Slack API client
│   │       └── cli.rb                # CLI interface
│   ├── bin/
│   │   └── slack-profile             # Executable
│   ├── slack_profile.gemspec         # Gem specification
│   ├── Gemfile                       # Bundler dependencies
│   ├── .env.example                  # Environment variable template
│   └── README.md                     # Ruby-specific documentation
│
├── Formula/               # Homebrew formulas
│   ├── slack-profile.rb           # Main formula (Ruby version)
│   └── slack-profile-nodejs.rb    # Node.js formula
│
├── scripts/               # Helper scripts
│   ├── get-homebrew-sha.sh        # Get SHA256 for npm package
│   └── get-release-sha.sh         # Get SHA256 for GitHub release
│
├── README.md              # Main documentation
├── PUBLISH.md             # Publishing guide
├── HOMEBREW.md            # Homebrew submission guide
├── QUICK_START.md         # Quick reference
└── .env.example           # Root environment template
```

## Which Implementation to Use?

### Node.js Version
- **Package**: npm (`@jaspermayone/slack-profile-cli`)
- **Install**: `npm install -g @jaspermayone/slack-profile-cli`
- **Best for**: Node.js developers, npm users
- **Dependencies**: Node.js, axios, commander, inquirer

### Ruby Version
- **Package**: RubyGems (`slack_profile`)
- **Install**: `gem install slack_profile` or `brew install slack-profile`
- **Best for**: Ruby developers, Homebrew users
- **Dependencies**: Ruby, thor, tty-prompt, httparty

## Features

Both implementations provide:
- ✅ Identical CLI interface
- ✅ Interactive mode with autocomplete
- ✅ Batch operations
- ✅ Custom field support
- ✅ Token configuration (env var, .env file, or CLI flag)
- ✅ Profile field auto-fetching on startup

## Development

### Node.js Development

```bash
cd nodejs
npm install
npm link
slack-profile --help
```

### Ruby Development

```bash
cd ruby
bundle install
./bin/slack-profile --help
# or
bundle exec bin/slack-profile --help
```

## Testing

### Test Node.js Version

```bash
node nodejs/index.js --help
node nodejs/index.js version
```

### Test Ruby Version

```bash
ruby/bin/slack-profile --help
ruby/bin/slack-profile version
```

## Publishing

See [PUBLISH.md](PUBLISH.md) for detailed publishing instructions for both versions.

### Quick Reference

**Node.js to npm:**
```bash
cd nodejs && npm version patch && npm publish
```

**Ruby to RubyGems:**
```bash
cd ruby && gem build slack_profile.gemspec && gem push slack_profile-*.gem
```

**Homebrew:**
```bash
# Create GitHub release first, then:
./scripts/get-release-sha.sh
# Update Formula/slack-profile.rb with SHA256
# Submit PR to homebrew-core
```

## Homebrew Formula

The main Homebrew formula (`Formula/slack-profile.rb`) builds from the **Ruby source** code, as this is preferred by Homebrew for source-based installations.

The Node.js formula (`Formula/slack-profile-nodejs.rb`) is also available for users who prefer the npm version.

## Version Synchronization

Keep versions synchronized across both implementations:
- `nodejs/package.json` - "version" field
- `ruby/lib/slack_profile/version.rb` - VERSION constant
- Git tags should match Ruby version (v1.0.0)

## License

MIT - See [LICENSE](LICENSE) for details

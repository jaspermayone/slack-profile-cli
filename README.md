# Slack Profile CLI

A command-line tool for updating Slack user profiles using the Slack API. Perfect for workspace admins who need to manage user profiles programmatically.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Get your Slack token:**

   - Go to [https://api.slack.com/apps](https://api.slack.com/apps)
   - Create a new app or select an existing one
   - Go to "OAuth & Permissions"
   - Add the `users.profile:write` scope
   - Install the app to your workspace
   - Copy the "User OAuth Token" (starts with `xoxp-`)

3. **Set up environment:**

   ```bash
   cp .env.example .env
   # Edit .env and add your token
   ```

   Or export directly:

   ```bash
   export SLACK_TOKEN=xoxp-your-token-here
   ```

4. **Make executable (optional):**

   ```bash
   chmod +x index.js
   npm link  # For global installation
   ```

## Usage

### Interactive Mode (Recommended)

Simply run the tool without arguments for a guided experience:

```bash
node index.js
```

This will prompt you to:

- Choose between single user or multiple users
- Choose between single field or multiple fields
- Search and select fields (with autocomplete)
- Enter field values (leave empty to clear)

### Command Line Interface

#### Set a single field for one user

```bash
node index.js set-field -u U1234567890 -n first_name -v "John"
node index.js set-field -u U1234567890 -n title -v "Senior Developer"
node index.js set-field -u U1234567890 -n Xf07986PJV2R -v "U079DHX7FB6"  # Custom field
```

#### Set a single field for multiple users

```bash
node index.js batch-field -u U1234567890,U0987654321,U1111222233 -n title -v "Developer"
node index.js batch-field -u U1234567890,U0987654321 -n Xf07986PJV2R -v "U079DHX7FB6"
```

#### Set multiple fields for one user

```bash
node index.js set-profile -u U1234567890 -p '{"first_name":"John","last_name":"Doe","title":"Developer"}'
```

#### Set multiple fields for multiple users

```bash
node index.js batch-profile -u U1234567890,U0987654321 -p '{"title":"Senior Developer","pronouns":"they/them"}'
```

#### Clear field values

```bash
node index.js set-field -u U1234567890 -n title -v ""  # Clear title
```

#### Set custom fields

```bash
# First, get custom field IDs
node index.js list-fields

# Then set custom field values
node index.js set-profile -u U1234567890 -p '{"fields":{"Xf0111111":{"value":"Barista","alt":""}}}'
```

#### List available fields

```bash
node index.js list-fields
```

#### Show examples

```bash
node index.js examples
```

## Available Standard Fields

- `display_name` - Display name (max 80 chars)
- `email` - Email address
- `first_name` - First name
- `last_name` - Last name
- `phone` - Phone number
- `pronouns` - Pronouns
- `real_name` - Full name (max 50 chars)
- `start_date` - Join date (Business+ only)
- `title` - Job title

## Custom Fields

Custom fields are set using their unique ID and the `fields` object:

```bash
node index.js set-profile -u U1234567890 -p '{
  "fields": {
    "Xf0111111": {
      "value": "Engineering Team",
      "alt": ""
    }
  }
}'
```

### Field Types

- **text**: Up to 256 characters
- **long_text**: Up to 5,000 characters (supports markdown)
- **date**: Valid date format
- **link**: URL (up to 256 characters)
- **user**: Up to 25 user IDs, comma-separated
- **options_list**: Must match predefined options
- **tags**: Array of tags (up to 75 tags, 50 chars each)

## Getting User IDs

You can find user IDs in several ways:

1. **From Slack URL**: When viewing a user's profile, the URL contains their ID
2. **From user mention**: `@username` in Slack shows the ID in developer tools
3. **Using Slack API**: `users.list` endpoint
4. **Browser extension**: Various extensions can show user IDs

## Requirements

- Node.js 14+
- Slack workspace admin privileges
- User OAuth Token with `users.profile:write` scope
- Paid Slack plan (for updating other users' profiles)

## Troubleshooting

### Common Errors

- `missing_scope`: Add `users.profile:write` scope to your app
- `not_authed`: Check your token format (should start with `xoxp-`)
- `user_not_found`: Verify the user ID is correct
- `not_allowed`: Ensure you have admin privileges and a paid plan
- `invalid_profile`: Check JSON format for profile data

### Tips

- Use single quotes around JSON to avoid shell escaping issues
- Test with your own user ID first
- Use `list-fields` to see available custom fields
- Check Slack's profile admin settings for API access

## License

MIT

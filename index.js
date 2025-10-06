#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const inquirer = require('inquirer');
require('dotenv').config();

// Register autocomplete plugin if available
try {
  const autocomplete = require('inquirer-autocomplete-prompt');
  inquirer.registerPrompt('autocomplete', autocomplete);
} catch (e) {
  // Autocomplete not available, will fallback to list
}

const program = new Command();

// Handle graceful shutdown on Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  process.exit(0);
});

class SlackProfileCLI {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://slack.com/api';
  }

  async setProfile(userId, profile) {
    try {
      const response = await axios.post(`${this.baseUrl}/users.profile.set`, {
        user: userId,
        profile: JSON.stringify(profile)
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API request failed: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      }
      throw error;
    }
  }

  async setSingleField(userId, name, value) {
    try {
      let profile;

      // Check if this is a custom field (starts with X)
      if (name.startsWith('X')) {
        profile = {
          fields: {
            [name]: {
              value: value,
              alt: ""
            }
          }
        };
      } else {
        // Standard field - all standard fields go in the profile object
        profile = {
          [name]: value
        };
      }

      const payload = {
        user: userId,
        profile: JSON.stringify(profile)
      };

      const response = await axios.post(`${this.baseUrl}/users.profile.set`, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API request failed: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      }
      throw error;
    }
  }

  async batchSetSingleField(userIds, name, value) {
    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        await this.setSingleField(userId, name, value);
        results.push({ userId, success: true });
        console.log(`✅ Updated ${name} for user ${userId}`);
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
        errors.push({ userId, error: error.message });
        console.log(`❌ Failed to update ${name} for user ${userId}: ${error.message}`);
      }
    }

    return { results, errors };
  }

  async batchSetProfile(userIds, profile) {
    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        await this.setProfile(userId, profile);
        results.push({ userId, success: true });
        console.log(`✅ Updated profile for user ${userId}`);
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
        errors.push({ userId, error: error.message });
        console.log(`❌ Failed to update profile for user ${userId}: ${error.message}`);
      }
    }

    return { results, errors };
  }

  async getProfile(userId) {
    try {
      const response = await axios.get(`${this.baseUrl}/users.profile.get`, {
        params: {
          user: userId,
          include_labels: true
        },
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return response.data.profile;
    } catch (error) {
      if (error.response) {
        throw new Error(`API request failed: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      }
      throw error;
    }
  }

  async getTeamProfile() {
    try {
      const response = await axios.get(`${this.baseUrl}/team.profile.get`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return response.data.profile.fields;
    } catch (error) {
      if (error.response) {
        throw new Error(`API request failed: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      }
      throw error;
    }
  }
}

function getSlackClient() {
  const token = process.env.SLACK_TOKEN;
  if (!token) {
    console.error('Error: SLACK_TOKEN environment variable is required');
    console.error('Set it with: export SLACK_TOKEN=xoxp-your-token-here');
    process.exit(1);
  }
  return new SlackProfileCLI(token);
}

program
  .name('slack-profile')
  .description('CLI tool for updating Slack user profiles')
  .version('1.0.0')
  .addHelpText('after', `
Examples:
  $ slack-profile interactive          Start interactive mode
  $ slack-profile help                 Show detailed help
  $ slack-profile list-fields          List all available fields
  $ slack-profile examples             Show usage examples

Environment:
  SLACK_TOKEN    Your Slack API token (required)
                 Get one at: https://api.slack.com/apps
`);

program
  .command('set-field')
  .description('Set a single profile field for a user')
  .requiredOption('-u, --user <userId>', 'Slack user ID (e.g., U1234567890)')
  .requiredOption('-n, --name <fieldName>', 'Field name (e.g., title, first_name, or Xf0111111 for custom)')
  .requiredOption('-v, --value <value>', 'Field value (use empty string "" to clear)')
  .addHelpText('after', `
Examples:
  $ slack-profile set-field -u U1234567890 -n title -v "Engineer"
  $ slack-profile set-field -u U1234567890 -n Xf0111111 -v "Custom Value"
  $ slack-profile set-field -u U1234567890 -n title -v ""

Tip: Run 'slack-profile list-fields' to see available fields`)
  .action(async (options) => {
    try {
      const client = getSlackClient();
      const result = await client.setSingleField(options.user, options.name, options.value);
      console.log(`✅ Successfully updated ${options.name} for user ${options.user}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('set-profile')
  .description('Set multiple profile fields for a user using JSON')
  .requiredOption('-u, --user <userId>', 'Slack user ID (e.g., U1234567890)')
  .requiredOption('-p, --profile <json>', 'Profile data as JSON string')
  .addHelpText('after', `
Examples:
  # Standard fields:
  $ slack-profile set-profile -u U1234567890 -p '{"title":"Engineer","phone":"555-1234"}'

  # Custom fields:
  $ slack-profile set-profile -u U1234567890 -p '{"fields":{"Xf0111111":{"value":"Custom","alt":""}}}'

  # Mixed:
  $ slack-profile set-profile -u U1234567890 -p '{"title":"CTO","fields":{"Xf0111111":{"value":"Hi","alt":""}}}'`)
  .action(async (options) => {
    try {
      const client = getSlackClient();
      let profile;

      try {
        profile = JSON.parse(options.profile);
      } catch (parseError) {
        throw new Error('Invalid JSON in profile data');
      }

      const result = await client.setProfile(options.user, profile);
      console.log(`✅ Successfully updated profile for user ${options.user}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('batch-field')
  .description('Set a single field for multiple users')
  .requiredOption('-u, --users <userIds>', 'Comma-separated list of Slack user IDs')
  .requiredOption('-n, --name <fieldName>', 'Field name (e.g., title, first_name)')
  .requiredOption('-v, --value <value>', 'Field value')
  .addHelpText('after', `
Examples:
  $ slack-profile batch-field -u U123,U456,U789 -n title -v "Engineer"
  $ slack-profile batch-field -u U123,U456 -n pronouns -v "they/them"`)
  .action(async (options) => {
    try {
      const client = getSlackClient();
      const userIds = options.users.split(',').map(id => id.trim()).filter(id => id);

      if (userIds.length === 0) {
        throw new Error('No valid user IDs provided');
      }

      console.log(`🚀 Updating ${options.name} for ${userIds.length} users...`);
      const { results, errors } = await client.batchSetSingleField(userIds, options.name, options.value);

      const successCount = results.filter(r => r.success).length;
      console.log(`\n📊 Summary: ${successCount}/${userIds.length} users updated successfully`);

      if (errors.length > 0) {
        console.log(`⚠️  ${errors.length} errors occurred`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('batch-profile')
  .description('Set multiple profile fields for multiple users using JSON')
  .requiredOption('-u, --users <userIds>', 'Comma-separated list of Slack user IDs')
  .requiredOption('-p, --profile <json>', 'Profile data as JSON string')
  .addHelpText('after', `
Examples:
  $ slack-profile batch-profile -u U123,U456 -p '{"title":"Engineer","phone":"555-0000"}'`)
  .action(async (options) => {
    try {
      const client = getSlackClient();
      const userIds = options.users.split(',').map(id => id.trim()).filter(id => id);

      if (userIds.length === 0) {
        throw new Error('No valid user IDs provided');
      }

      let profile;
      try {
        profile = JSON.parse(options.profile);
      } catch (parseError) {
        throw new Error('Invalid JSON in profile data');
      }

      console.log(`🚀 Updating profiles for ${userIds.length} users...`);
      const { results, errors } = await client.batchSetProfile(userIds, profile);

      const successCount = results.filter(r => r.success).length;
      console.log(`\n📊 Summary: ${successCount}/${userIds.length} users updated successfully`);

      if (errors.length > 0) {
        console.log(`⚠️  ${errors.length} errors occurred`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('list-fields')
  .description('List available custom profile fields for the team')
  .action(async () => {
    try {
      const client = getSlackClient();
      const fields = await client.getTeamProfile();

      console.log('Available profile fields:');
      console.log('\nStandard fields:');
      const standardFields = [
        'display_name', 'email', 'first_name', 'last_name',
        'phone', 'pronouns', 'real_name', 'start_date', 'title'
      ];
      standardFields.forEach(field => {
        console.log(`  ${field}`);
      });

      if (fields && Object.keys(fields).length > 0) {
        console.log('\nCustom fields:');
        Object.entries(fields).forEach(([id, field]) => {
          console.log(`  ${id} - ${field.label} (${field.type})`);
        });
      } else {
        console.log('\nNo custom fields configured.');
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

async function runInteractive() {
  const client = getSlackClient();

  // Fetch custom fields on startup
  let customFields = {};
  try {
    console.log('🔄 Fetching available fields...\n');
    const fields = await client.getTeamProfile();
    customFields = fields || {};
  } catch (error) {
    console.log('⚠️  Could not fetch custom fields, but you can still enter field IDs manually\n');
  }

  while (true) {
    console.log('🚀 Slack Profile CLI - Interactive Mode\n');

    const actionChoices = [
      { name: 'Get user profile', value: 'get' },
      { name: 'Set a single field for one user', value: 'single' },
      { name: 'Set a single field for multiple users', value: 'batch_single' },
      { name: 'Set multiple fields for one user', value: 'multiple' },
      { name: 'Set multiple fields for multiple users', value: 'batch_multiple' },
      { name: 'List available fields', value: 'list' },
      { name: 'Exit', value: 'exit' }
    ];

    let actionPrompt;

    try {
      actionPrompt = await inquirer.prompt([
        {
          type: 'autocomplete',
          name: 'action',
          message: 'What would you like to do? (type to filter)',
          source: async (answersSoFar, input) => {
            const searchTerm = (input || '').toLowerCase();
            return actionChoices.filter(choice =>
              choice.name.toLowerCase().includes(searchTerm)
            );
          },
          pageSize: 10,
          default: actionChoices[0].value
        }
      ]);
    } catch (error) {
      // Handle Ctrl+C gracefully
      if (error.isTtyError === false || error.message?.includes('User force closed')) {
        console.log('\n\n👋 Goodbye!');
        process.exit(0);
      }
      // Fallback to regular list if autocomplete fails
      console.log('Note: Autocomplete not available, using list view\n');
      try {
        actionPrompt = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: actionChoices,
            pageSize: 10
          }
        ]);
      } catch (innerError) {
        // Handle Ctrl+C on fallback list
        console.log('\n\n👋 Goodbye!');
        process.exit(0);
      }
    }

    const { action } = actionPrompt;

    if (action === 'exit') {
      console.log('👋 Goodbye!');
      return;
    }

    if (action === 'get') {
      const { userId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userId',
          message: 'Enter the Slack user ID (e.g., U1234567890):',
          validate: (input) => {
            if (!input.trim()) return 'User ID is required';
            if (!input.startsWith('U')) return 'User ID should start with "U"';
            return true;
          }
        }
      ]);

      const profile = await client.getProfile(userId);
      console.log(`\n📋 Profile for user ${userId}:`);
      console.log(JSON.stringify(profile, null, 2));
      console.log('');
      continue;
    }

    if (action === 'list') {
      console.log('\n📋 Available profile fields:');
      console.log('\nStandard fields:');
      const standardFields = [
        'display_name', 'email', 'first_name', 'last_name',
        'phone', 'pronouns', 'real_name', 'start_date', 'title'
      ];
      standardFields.forEach(field => {
        console.log(`  • ${field}`);
      });

      if (customFields && Object.keys(customFields).length > 0) {
        console.log('\nCustom fields:');
        Object.entries(customFields).forEach(([id, field]) => {
          console.log(`  • ${id} - ${field.label} (${field.type})`);
        });
      } else {
        console.log('\n📝 No custom fields configured.');
      }
      console.log('');
      continue;
    }

    let userIds = [];

    if (action === 'batch_single' || action === 'batch_multiple') {
      const { userInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userInput',
          message: 'Enter Slack user IDs (comma-separated, e.g., U1234567890,U0987654321):',
          validate: (input) => {
            if (!input.trim()) return 'At least one user ID is required';
            const ids = input.split(',').map(id => id.trim()).filter(id => id);
            const invalidIds = ids.filter(id => !id.startsWith('U'));
            if (invalidIds.length > 0) return `Invalid user IDs: ${invalidIds.join(', ')} (should start with "U")`;
            return true;
          }
        }
      ]);
      userIds = userInput.split(',').map(id => id.trim()).filter(id => id);
    } else {
      const { userId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userId',
          message: 'Enter the Slack user ID (e.g., U1234567890):',
          validate: (input) => {
            if (!input.trim()) return 'User ID is required';
            if (!input.startsWith('U')) return 'User ID should start with "U"';
            return true;
          }
        }
      ]);
      userIds = [userId];
    }

    if (action === 'single' || action === 'batch_single') {
      const standardFields = [
        'first_name', 'last_name', 'display_name', 'title',
        'email', 'phone', 'pronouns', 'real_name', 'start_date'
      ];

      // Convert all to name/value format for consistency
      const allFieldChoices = [
        ...standardFields.map(field => ({ name: field, value: field })),
        ...Object.entries(customFields).map(([id, field]) => ({
          name: `${field.label} (${id})`,
          value: id
        })),
        { name: 'Enter field ID manually', value: 'custom' }
      ];

      let answers;

      try {
        answers = await inquirer.prompt([
          {
            type: 'autocomplete',
            name: 'fieldName',
            message: 'Which field would you like to update? (type to filter)',
            source: async (answersSoFar, input) => {
              const searchTerm = (input || '').toLowerCase();
              return allFieldChoices.filter(choice =>
                choice.name.toLowerCase().includes(searchTerm)
              );
            },
            pageSize: 15,
            default: allFieldChoices[0].value
          }
        ]);
      } catch (error) {
        // Fallback to regular list if autocomplete fails
        answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'fieldName',
            message: 'Which field would you like to update?',
            choices: allFieldChoices,
            pageSize: 15
          }
        ]);
      }

      let fieldName = answers.fieldName;
      if (fieldName === 'custom') {
        const customAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'customField',
            message: 'Enter the field name or ID (e.g., title or Xf07986PJV2R):',
            validate: (input) => input.trim() ? true : 'Field name or ID is required'
          }
        ]);
        fieldName = customAnswer.customField;
      }

      const { fieldValue } = await inquirer.prompt([
        {
          type: 'input',
          name: 'fieldValue',
          message: `Enter the value for ${fieldName} (leave empty to clear):`,
          validate: () => true // Allow empty values to clear fields
        }
      ]);

      if (action === 'single') {
        await client.setSingleField(userIds[0], fieldName, fieldValue);
        console.log(`✅ Successfully updated ${fieldName} for user ${userIds[0]}\n`);
      } else {
        console.log(`🚀 Updating ${fieldName} for ${userIds.length} users...`);
        const { results, errors } = await client.batchSetSingleField(userIds, fieldName, fieldValue);
        const successCount = results.filter(r => r.success).length;
        console.log(`\n📊 Summary: ${successCount}/${userIds.length} users updated successfully\n`);
      }

    } else if (action === 'multiple' || action === 'batch_multiple') {
      console.log('\n📝 You can set multiple fields using JSON format.');
      console.log('Example: {"first_name":"John","last_name":"Doe","title":"Developer"}');

      const { profileJson } = await inquirer.prompt([
        {
          type: 'input',
          name: 'profileJson',
          message: 'Enter profile data as JSON:',
          validate: (input) => {
            if (!input.trim()) return 'Profile data is required';
            try {
              JSON.parse(input);
              return true;
            } catch (e) {
              return 'Invalid JSON format';
            }
          }
        }
      ]);

      const profile = JSON.parse(profileJson);

      if (action === 'multiple') {
        await client.setProfile(userIds[0], profile);
        console.log(`✅ Successfully updated profile for user ${userIds[0]}\n`);
      } else {
        console.log(`🚀 Updating profiles for ${userIds.length} users...`);
        const { results, errors } = await client.batchSetProfile(userIds, profile);
        const successCount = results.filter(r => r.success).length;
        console.log(`\n📊 Summary: ${successCount}/${userIds.length} users updated successfully\n`);
      }
    }
  }
}

program
  .command('interactive')
  .description('Interactive mode - prompts for all inputs')
  .action(async () => {
    try {
      await runInteractive();
    } catch (error) {
      // Handle Ctrl+C gracefully
      if (error.message?.includes('User force closed') || error.message?.includes('prompt was canceled')) {
        console.log('\n\n👋 Goodbye!');
        process.exit(0);
      }
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('help')
  .description('Show detailed help and usage information')
  .action(() => {
    console.log('Slack Profile CLI - Help\n');
    console.log('A command-line tool for managing Slack user profiles with admin tokens.\n');

    console.log('SETUP:');
    console.log('  1. Get a Slack admin token from https://api.slack.com/apps');
    console.log('  2. Token needs these scopes: users.profile:read, users.profile:write');
    console.log('  3. Set environment variable: export SLACK_TOKEN=xoxp-your-token-here\n');

    console.log('COMMANDS:');
    console.log('  interactive              Start interactive mode (recommended for beginners)');
    console.log('  set-field               Set a single profile field for one user');
    console.log('  set-profile             Set multiple profile fields using JSON');
    console.log('  batch-field             Set a single field for multiple users');
    console.log('  batch-profile           Set multiple fields for multiple users');
    console.log('  list-fields             List all available profile fields');
    console.log('  examples                Show usage examples');
    console.log('  help                    Show this help message\n');

    console.log('GETTING STARTED:');
    console.log('  # Start interactive mode (easiest):');
    console.log('  slack-profile interactive\n');

    console.log('  # Or run without arguments:');
    console.log('  slack-profile\n');

    console.log('FIELD TYPES:');
    console.log('  Standard fields: first_name, last_name, display_name, email, phone,');
    console.log('                   pronouns, real_name, start_date, title');
    console.log('  Custom fields:   Fields starting with "X" (e.g., Xf079B12L0RZ)');
    console.log('                   Use list-fields to see your workspace\'s custom fields\n');

    console.log('TIPS:');
    console.log('  • Use list-fields first to see what fields are available');
    console.log('  • Some fields like start_date may require Slack Atlas or special permissions');
    console.log('  • Custom fields need to be wrapped in the fields object when using JSON');
    console.log('  • Admin tokens can update other users\' profiles');
    console.log('  • Empty values will clear the field\n');

    console.log('COMMON WORKFLOWS:');
    console.log('  1. View available fields:');
    console.log('     slack-profile list-fields\n');

    console.log('  2. Update a single user\'s title:');
    console.log('     slack-profile set-field -u U1234567890 -n title -v "Senior Developer"\n');

    console.log('  3. Update multiple users\' titles:');
    console.log('     slack-profile batch-field -u U123,U456,U789 -n title -v "Engineer"\n');

    console.log('  4. Update multiple fields for one user:');
    console.log('     slack-profile set-profile -u U1234567890 -p \'{"title":"CTO","phone":"555-1234"}\'\n');

    console.log('For more examples, run: slack-profile examples');
  });

program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    console.log('Slack Profile CLI - Usage Examples\n');

    console.log('1. INTERACTIVE MODE (RECOMMENDED):');
    console.log('   slack-profile interactive');
    console.log('   # Guides you through all operations with prompts\n');

    console.log('2. SET A SINGLE FIELD FOR ONE USER:');
    console.log('   # Standard field:');
    console.log('   slack-profile set-field -u U1234567890 -n first_name -v "John"');
    console.log('   slack-profile set-field -u U1234567890 -n title -v "Senior Developer"');
    console.log('   slack-profile set-field -u U1234567890 -n pronouns -v "she/her"');
    console.log('');
    console.log('   # Custom field:');
    console.log('   slack-profile set-field -u U1234567890 -n Xf0111111 -v "Barista"');
    console.log('');
    console.log('   # Clear a field:');
    console.log('   slack-profile set-field -u U1234567890 -n title -v ""\n');

    console.log('3. SET MULTIPLE FIELDS FOR ONE USER:');
    console.log('   # Standard fields:');
    console.log('   slack-profile set-profile -u U1234567890 -p \'{"first_name":"John","last_name":"Doe","title":"Developer"}\'');
    console.log('');
    console.log('   # Custom fields:');
    console.log('   slack-profile set-profile -u U1234567890 -p \'{"fields":{"Xf0111111":{"value":"Barista","alt":""}}}\'');
    console.log('');
    console.log('   # Mix of both:');
    console.log('   slack-profile set-profile -u U1234567890 -p \'{"title":"Engineer","fields":{"Xf0111111":{"value":"Coffee","alt":""}}}\'\n');

    console.log('4. BATCH UPDATE ONE FIELD FOR MULTIPLE USERS:');
    console.log('   slack-profile batch-field -u U123,U456,U789 -n title -v "Software Engineer"');
    console.log('   slack-profile batch-field -u U123,U456 -n pronouns -v "they/them"\n');

    console.log('5. BATCH UPDATE MULTIPLE FIELDS FOR MULTIPLE USERS:');
    console.log('   slack-profile batch-profile -u U123,U456,U789 -p \'{"title":"Developer","phone":"555-0000"}\'\n');

    console.log('6. LIST AVAILABLE FIELDS:');
    console.log('   slack-profile list-fields\n');

    console.log('7. GET A USER\'S CURRENT PROFILE:');
    console.log('   # Use interactive mode and select "Get user profile"\n');

    console.log('ENVIRONMENT SETUP:');
    console.log('   export SLACK_TOKEN=xoxp-your-token-here');
    console.log('   # Or create a .env file with:');
    console.log('   # SLACK_TOKEN=xoxp-your-token-here\n');

    console.log('For detailed help, run: slack-profile help');
  });

// Default action when no command is provided
if (process.argv.length === 2) {
  // No arguments provided, start interactive mode
  const client = getSlackClient();
  console.log('🚀 Starting interactive mode...\n');
  program.parse(['node', 'index.js', 'interactive']);
} else {
  program.parse();
}
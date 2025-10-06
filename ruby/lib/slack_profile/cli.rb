require "thor"
require "tty-prompt"

module SlackProfile
  class CLI < Thor
    class_option :token, type: :string, aliases: "-t", desc: "Slack API token (overrides SLACK_TOKEN env var)"

    def self.exit_on_failure?
      true
    end

    desc "interactive", "Interactive mode - prompts for all inputs"
    def interactive
      client = get_client
      prompt = TTY::Prompt.new

      # Fetch custom fields on startup
      custom_fields = {}
      begin
        puts "🔄 Fetching available fields...\n\n"
        custom_fields = client.get_team_profile
      rescue => e
        puts "⚠️  Could not fetch custom fields: #{e.message}\n\n"
      end

      loop do
        puts "🚀 Slack Profile CLI - Interactive Mode\n\n"

        action = prompt.select("What would you like to do?", filter: true, per_page: 10) do |menu|
          menu.choice "Get user profile", :get
          menu.choice "Set a single field for one user", :single
          menu.choice "Set a single field for multiple users", :batch_single
          menu.choice "Set multiple fields for one user", :multiple
          menu.choice "Set multiple fields for multiple users", :batch_multiple
          menu.choice "List available fields", :list
          menu.choice "Exit", :exit
        end

        break if action == :exit

        case action
        when :get
          user_id = prompt.ask("Enter the Slack user ID:") do |q|
            q.validate(/^U\w+/, "User ID should start with 'U'")
            q.required true
          end

          profile = client.get_profile(user_id)
          puts "\n📋 Profile for user #{user_id}:"
          puts JSON.pretty_generate(profile)
          puts ""

        when :list
          puts "\n📋 Available profile fields:"
          puts "\nStandard fields:"
          standard_fields.each { |field| puts "  • #{field}" }

          if custom_fields.any?
            puts "\nCustom fields:"
            custom_fields.each do |id, field|
              puts "  • #{id} - #{field['label']} (#{field['type']})"
            end
          else
            puts "\n📝 No custom fields configured."
          end
          puts ""

        when :single, :batch_single
          user_ids = if action == :batch_single
            prompt.ask("Enter Slack user IDs (comma-separated):") do |q|
              q.required true
            end.split(",").map(&:strip)
          else
            [prompt.ask("Enter the Slack user ID:") do |q|
              q.validate(/^U\w+/, "User ID should start with 'U'")
              q.required true
            end]
          end

          # Build field choices
          field_choices = standard_fields.map { |f| { name: f, value: f } }
          custom_fields.each do |id, field|
            field_choices << { name: "#{field['label']} (#{id})", value: id }
          end
          field_choices << { name: "Enter field ID manually", value: :custom }

          field_name = prompt.select("Which field would you like to update?", field_choices, filter: true, per_page: 15)

          if field_name == :custom
            field_name = prompt.ask("Enter the field name or ID:")
          end

          value = prompt.ask("Enter the value for #{field_name} (leave empty to clear):", default: "")

          if action == :single
            client.set_single_field(user_ids[0], field_name, value)
            puts "✅ Successfully updated #{field_name} for user #{user_ids[0]}\n\n"
          else
            puts "🚀 Updating #{field_name} for #{user_ids.length} users..."
            success_count = 0
            user_ids.each do |user_id|
              begin
                client.set_single_field(user_id, field_name, value)
                puts "✅ Updated #{field_name} for user #{user_id}"
                success_count += 1
              rescue => e
                puts "❌ Failed to update #{field_name} for user #{user_id}: #{e.message}"
              end
            end
            puts "\n📊 Summary: #{success_count}/#{user_ids.length} users updated successfully\n\n"
          end

        when :multiple, :batch_multiple
          user_ids = if action == :batch_multiple
            prompt.ask("Enter Slack user IDs (comma-separated):") do |q|
              q.required true
            end.split(",").map(&:strip)
          else
            [prompt.ask("Enter the Slack user ID:") do |q|
              q.validate(/^U\w+/, "User ID should start with 'U'")
              q.required true
            end]
          end

          puts "\n📝 You can set multiple fields using JSON format."
          puts 'Example: {"first_name":"John","last_name":"Doe","title":"Developer"}'

          profile_json = prompt.ask("Enter profile data as JSON:") do |q|
            q.required true
            q.validate ->(input) { JSON.parse(input); true rescue false }, "Invalid JSON format"
          end

          profile = JSON.parse(profile_json)

          if action == :multiple
            client.set_profile(user_ids[0], profile)
            puts "✅ Successfully updated profile for user #{user_ids[0]}\n\n"
          else
            puts "🚀 Updating profiles for #{user_ids.length} users..."
            success_count = 0
            user_ids.each do |user_id|
              begin
                client.set_profile(user_id, profile)
                puts "✅ Updated profile for user #{user_id}"
                success_count += 1
              rescue => e
                puts "❌ Failed to update profile for user #{user_id}: #{e.message}"
              end
            end
            puts "\n📊 Summary: #{success_count}/#{user_ids.length} users updated successfully\n\n"
          end
        end
      end

      puts "👋 Goodbye!"
    rescue TTY::Reader::InputInterrupt
      puts "\n\n👋 Goodbye!"
      exit 0
    end

    desc "set-field", "Set a single profile field for a user"
    option :user, required: true, aliases: "-u", desc: "Slack user ID"
    option :name, required: true, aliases: "-n", desc: "Field name"
    option :value, required: true, aliases: "-v", desc: "Field value"
    def set_field
      client = get_client
      client.set_single_field(options[:user], options[:name], options[:value])
      puts "✅ Successfully updated #{options[:name]} for user #{options[:user]}"
    rescue Error => e
      puts "❌ Error: #{e.message}"
      exit 1
    end

    desc "set-profile", "Set multiple profile fields for a user using JSON"
    option :user, required: true, aliases: "-u", desc: "Slack user ID"
    option :profile, required: true, aliases: "-p", desc: "Profile data as JSON string"
    def set_profile
      client = get_client
      profile = JSON.parse(options[:profile])
      client.set_profile(options[:user], profile)
      puts "✅ Successfully updated profile for user #{options[:user]}"
    rescue JSON::ParserError
      puts "❌ Error: Invalid JSON in profile data"
      exit 1
    rescue Error => e
      puts "❌ Error: #{e.message}"
      exit 1
    end

    desc "batch-field", "Set a single field for multiple users"
    option :users, required: true, aliases: "-u", desc: "Comma-separated list of Slack user IDs"
    option :name, required: true, aliases: "-n", desc: "Field name"
    option :value, required: true, aliases: "-v", desc: "Field value"
    def batch_field
      client = get_client
      user_ids = options[:users].split(",").map(&:strip).reject(&:empty?)

      if user_ids.empty?
        puts "❌ Error: No valid user IDs provided"
        exit 1
      end

      puts "🚀 Updating #{options[:name]} for #{user_ids.length} users..."
      success_count = 0
      errors = 0

      user_ids.each do |user_id|
        begin
          client.set_single_field(user_id, options[:name], options[:value])
          puts "✅ Updated #{options[:name]} for user #{user_id}"
          success_count += 1
        rescue => e
          puts "❌ Failed to update #{options[:name]} for user #{user_id}: #{e.message}"
          errors += 1
        end
      end

      puts "\n📊 Summary: #{success_count}/#{user_ids.length} users updated successfully"
      exit 1 if errors > 0
    end

    desc "batch-profile", "Set multiple fields for multiple users using JSON"
    option :users, required: true, aliases: "-u", desc: "Comma-separated list of Slack user IDs"
    option :profile, required: true, aliases: "-p", desc: "Profile data as JSON string"
    def batch_profile
      client = get_client
      user_ids = options[:users].split(",").map(&:strip).reject(&:empty?)

      if user_ids.empty?
        puts "❌ Error: No valid user IDs provided"
        exit 1
      end

      profile = JSON.parse(options[:profile])

      puts "🚀 Updating profiles for #{user_ids.length} users..."
      success_count = 0
      errors = 0

      user_ids.each do |user_id|
        begin
          client.set_profile(user_id, profile)
          puts "✅ Updated profile for user #{user_id}"
          success_count += 1
        rescue => e
          puts "❌ Failed to update profile for user #{user_id}: #{e.message}"
          errors += 1
        end
      end

      puts "\n📊 Summary: #{success_count}/#{user_ids.length} users updated successfully"
      exit 1 if errors > 0
    rescue JSON::ParserError
      puts "❌ Error: Invalid JSON in profile data"
      exit 1
    end

    desc "list-fields", "List available custom profile fields for the team"
    def list_fields
      client = get_client
      fields = client.get_team_profile

      puts "Available profile fields:"
      puts "\nStandard fields:"
      standard_fields.each { |field| puts "  #{field}" }

      if fields.any?
        puts "\nCustom fields:"
        fields.each do |id, field|
          puts "  #{id} - #{field['label']} (#{field['type']})"
        end
      else
        puts "\nNo custom fields configured."
      end
    rescue Error => e
      puts "❌ Error: #{e.message}"
      exit 1
    end

    desc "version", "Show version"
    def version
      puts "slack-profile version #{SlackProfile::VERSION}"
    end

    default_task :interactive

    private

    def get_client
      token = options[:token] || ENV["SLACK_TOKEN"]

      unless token
        puts "❌ Error: Slack token is required"
        puts "Provide it via:"
        puts "  1. Command line: --token xoxp-your-token-here"
        puts "  2. Environment variable: export SLACK_TOKEN=xoxp-your-token-here"
        puts "  3. .env file: SLACK_TOKEN=xoxp-your-token-here"
        exit 1
      end

      Client.new(token)
    end

    def standard_fields
      %w[
        first_name
        last_name
        display_name
        title
        email
        phone
        pronouns
        real_name
        start_date
      ]
    end
  end
end

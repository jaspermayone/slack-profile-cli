require "dotenv/load"
require_relative "slack_profile/version"
require_relative "slack_profile/client"
require_relative "slack_profile/cli"

module SlackProfile
  class Error < StandardError; end
end

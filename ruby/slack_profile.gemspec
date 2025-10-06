require_relative "lib/slack_profile/version"

Gem::Specification.new do |spec|
  spec.name          = "slack_profile"
  spec.version       = SlackProfile::VERSION
  spec.authors       = ["Jasper Mayone"]
  spec.email         = [""]

  spec.summary       = "CLI tool for updating Slack user profiles"
  spec.description   = "A command-line tool for updating Slack user profiles using the Slack API. Perfect for workspace admins who need to manage user profiles programmatically."
  spec.homepage      = "https://github.com/jaspermayone/slack-profile-cli"
  spec.license       = "MIT"
  spec.required_ruby_version = ">= 2.7.0"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/jaspermayone/slack-profile-cli"
  spec.metadata["changelog_uri"] = "https://github.com/jaspermayone/slack-profile-cli/blob/main/CHANGELOG.md"

  spec.files = Dir["lib/**/*", "LICENSE", "README.md"]
  spec.bindir = "bin"
  spec.executables = ["slack-profile"]
  spec.require_paths = ["lib"]

  spec.add_dependency "thor", "~> 1.3"
  spec.add_dependency "tty-prompt", "~> 0.23"
  spec.add_dependency "httparty", "~> 0.21"
  spec.add_dependency "dotenv", "~> 2.8"
end

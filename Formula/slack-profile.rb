class SlackProfile < Formula
  desc "CLI tool for updating Slack user profiles (Ruby version)"
  homepage "https://github.com/jaspermayone/slack-profile-cli"
  url "https://github.com/jaspermayone/slack-profile-cli/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "" # Will be generated when you create a GitHub release
  license "MIT"
  head "https://github.com/jaspermayone/slack-profile-cli.git", branch: "main"

  depends_on "ruby"

  def install
    cd "ruby" do
      ENV["GEM_HOME"] = libexec
      system "gem", "build", "slack_profile.gemspec"
      system "gem", "install", "slack_profile-#{version}.gem"
      bin.install libexec/"bin/slack-profile"
      bin.env_script_all_files(libexec/"bin", GEM_HOME: ENV["GEM_HOME"])
    end
  end

  test do
    # Test that the CLI runs and shows version
    assert_match version.to_s, shell_output("#{bin}/slack-profile version")
  end
end

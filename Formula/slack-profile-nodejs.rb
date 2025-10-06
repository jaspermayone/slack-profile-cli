class SlackProfileNodejs < Formula
  desc "CLI tool for updating Slack user profiles (Node.js version)"
  homepage "https://github.com/jaspermayone/slack-profile-cli"
  url "https://github.com/jaspermayone/slack-profile-cli/archive/refs/tags/v2.0.0.tar.gz"
  sha256 ""
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "CLI tool for updating Slack user profiles", shell_output("#{bin}/slack-profile --help")
  end
end

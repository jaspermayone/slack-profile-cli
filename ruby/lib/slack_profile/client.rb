require "httparty"
require "json"

module SlackProfile
  class Client
    include HTTParty
    base_uri "https://slack.com/api"

    def initialize(token)
      @token = token
      @headers = {
        "Authorization" => "Bearer #{@token}",
        "Content-Type" => "application/json"
      }
    end

    def set_profile(user_id, profile)
      response = self.class.post("/users.profile.set",
        headers: @headers,
        body: {
          user: user_id,
          profile: profile.to_json
        }.to_json
      )

      handle_response(response)
    end

    def set_single_field(user_id, field_name, value)
      profile = if field_name.start_with?("X")
        # Custom field
        {
          fields: {
            field_name => {
              value: value,
              alt: ""
            }
          }
        }
      else
        # Standard field
        { field_name => value }
      end

      set_profile(user_id, profile)
    end

    def get_profile(user_id)
      response = self.class.get("/users.profile.get",
        headers: @headers,
        query: {
          user: user_id,
          include_labels: true
        }
      )

      result = handle_response(response)
      result["profile"]
    end

    def get_team_profile
      response = self.class.get("/team.profile.get",
        headers: @headers
      )

      result = handle_response(response)
      result.dig("profile", "fields") || {}
    end

    private

    def handle_response(response)
      data = JSON.parse(response.body)

      unless data["ok"]
        raise Error, "Slack API error: #{data['error']}"
      end

      data
    rescue JSON::ParserError
      raise Error, "Invalid response from Slack API"
    end
  end
end

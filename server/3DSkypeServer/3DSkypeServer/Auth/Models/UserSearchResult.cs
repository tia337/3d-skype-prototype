using System.Text.Json.Serialization;

namespace _3DSkypeServer.Auth.Models
{
  public class UserSearchResult
  {
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("email")]
    public string Email { get; set; }
  }
}

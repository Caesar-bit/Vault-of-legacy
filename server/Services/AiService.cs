using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace VaultBackend.Services
{
    public class AiService
    {
        private readonly HttpClient _http;
        private readonly string? _apiKey;

        public AiService(IHttpClientFactory factory, IConfiguration config)
        {
            _http = factory.CreateClient();
            _apiKey = config["OpenAIKey"];
        }

        public async Task<string?> GetResponseAsync(string message)
        {
            if (string.IsNullOrEmpty(_apiKey)) return null;
            var req = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            var payload = new
            {
                model = "gpt-3.5-turbo",
                messages = new[] { new { role = "user", content = message } },
                max_tokens = 100
            };
            req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            try
            {
                var res = await _http.SendAsync(req);
                if (!res.IsSuccessStatusCode) return null;
                using var stream = await res.Content.ReadAsStreamAsync();
                using var doc = await JsonDocument.ParseAsync(stream);
                var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
                return content?.Trim();
            }
            catch
            {
                return null;
            }
        }
    }
}

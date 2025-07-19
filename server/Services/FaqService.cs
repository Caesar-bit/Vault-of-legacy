using System.Text.Json;

namespace VaultBackend.Services
{
    public class FaqService
    {
        private readonly Dictionary<string, string> _faqs;

        public FaqService(IWebHostEnvironment env)
        {
            var path = Path.Combine(env.ContentRootPath, "Resources", "faq.json");
            if (File.Exists(path))
            {
                var json = File.ReadAllText(path);
                _faqs = JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? new();
            }
            else
            {
                _faqs = new();
            }
        }

        public string? GetAnswer(string message)
        {
            var q = message.Trim().ToLowerInvariant();
            foreach (var kv in _faqs)
            {
                var question = kv.Key.ToLowerInvariant();
                if (q.Contains(question))
                    return kv.Value;
            }
            return null;
        }
    }
}

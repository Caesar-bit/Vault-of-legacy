using System.Net.Mail;
using System.Text.Json;

namespace VaultBackend.Services
{
    public class SupportEscalationService
    {
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _factory;
        private readonly ILogger<SupportEscalationService> _logger;

        public SupportEscalationService(IConfiguration config, IHttpClientFactory factory, ILogger<SupportEscalationService> logger)
        {
            _config = config;
            _factory = factory;
            _logger = logger;
        }

        public async Task NotifyAsync(string userId, string message)
        {
            try
            {
                var smtpHost = _config["Support:SmtpHost"];
                var to = _config["Support:To"];
                var from = _config["Support:From"] ?? to;
                if (!string.IsNullOrEmpty(smtpHost) && !string.IsNullOrEmpty(to))
                {
                    using var client = new SmtpClient(smtpHost);
                    var mail = new MailMessage(from, to, "Support request", $"User {userId}: {message}");
                    await client.SendMailAsync(mail);
                }

                var webhook = _config["Support:Webhook"];
                if (!string.IsNullOrEmpty(webhook))
                {
                    var http = _factory.CreateClient();
                    var content = new StringContent(JsonSerializer.Serialize(new { userId, message }), System.Text.Encoding.UTF8, "application/json");
                    await http.PostAsync(webhook, content);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to escalate support request");
            }
        }
    }
}

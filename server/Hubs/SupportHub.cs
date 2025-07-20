using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using VaultBackend.Data;
using VaultBackend.Models;
using VaultBackend.Services;

namespace VaultBackend.Hubs
{
    [Authorize]
    public class SupportHub : Hub
    {
        private readonly AppDbContext _db;
        private readonly FaqService _faq;
        private readonly AiService _ai;
        private readonly ActivityLogger _logger;

        public SupportHub(AppDbContext db, FaqService faq, AiService ai, ActivityLogger logger)
        {
            _db = db;
            _faq = faq;
            _ai = ai;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                await Clients.Caller.SendAsync("ReceiveSuggestions", _faq.GetQuestions());
                await Clients.Caller.SendAsync("ReceiveMessage", new
                {
                    Id = 0,
                    UserId = "bot",
                    Content = "Welcome to Vault Support. Ask me anything or choose a question below.",
                    Timestamp = DateTime.UtcNow
                });
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string text)
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return;

            var msg = new ChatMessage
            {
                UserId = userId,
                Content = text,
                Timestamp = DateTime.UtcNow
            };
            _db.ChatMessages.Add(msg);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Sent support message", text);

            await Clients.Group(userId).SendAsync("ReceiveMessage", new
            {
                msg.Id,
                msg.UserId,
                msg.Content,
                msg.Timestamp
            });

            var reply = _faq.GetAnswer(text) ?? await _ai.GetResponseAsync(text);
            if (!string.IsNullOrEmpty(reply))
            {
                var bot = new ChatMessage
                {
                    UserId = "bot",
                    Content = reply,
                    Timestamp = DateTime.UtcNow
                };
                _db.ChatMessages.Add(bot);
                await _db.SaveChangesAsync();
                await Clients.Group(userId).SendAsync("ReceiveMessage", new
                {
                    bot.Id,
                    bot.UserId,
                    bot.Content,
                    bot.Timestamp
                });
            }
        }

        public async Task RequestSuggestions()
        {
            await Clients.Caller.SendAsync("ReceiveSuggestions", _faq.GetQuestions());
        }
    }
}

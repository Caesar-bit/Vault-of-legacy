using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using VaultBackend.Data;
using VaultBackend.Models;
using VaultBackend.Services;

namespace VaultBackend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly AppDbContext _db;
        private readonly FaqService _faq;
        private readonly ActivityLogger _logger;
        private readonly AiService _ai;
        public ChatHub(AppDbContext db, FaqService faq, ActivityLogger logger, AiService ai)
        {
            _db = db;
            _faq = faq;
            _logger = logger;
            _ai = ai;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                await Clients.Caller.SendAsync("ReceiveFaqSuggestions", _faq.GetQuestions());
                await Clients.Caller.SendAsync("ReceiveMessage", new
                {
                    Id = 0,
                    UserId = "bot",
                    Content = "Hi! How can I help? Here are some common questions below.",
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

        public async Task SendMessage(string message)
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return;

            var chatMessage = new ChatMessage
            {
                UserId = userId,
                Content = message,
                Timestamp = DateTime.UtcNow
            };

            _db.ChatMessages.Add(chatMessage);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Sent chat message", message);

            await Clients.Group(userId).SendAsync("ReceiveMessage", new
            {
                chatMessage.Id,
                chatMessage.UserId,
                chatMessage.Content,
                chatMessage.Timestamp
            });

            var answer = _faq.GetAnswer(message) ?? await _ai.GetResponseAsync(message);
            if (!string.IsNullOrEmpty(answer))
            {
                var botMessage = new ChatMessage
                {
                    UserId = "bot",
                    Content = answer,
                    Timestamp = DateTime.UtcNow
                };
                _db.ChatMessages.Add(botMessage);
                await _db.SaveChangesAsync();
                await Clients.Group(userId).SendAsync("ReceiveMessage", new
                {
                    botMessage.Id,
                    botMessage.UserId,
                    botMessage.Content,
                    botMessage.Timestamp
                });
            }
        }

        public async Task RequestFaqSuggestions()
        {
            await Clients.Caller.SendAsync("ReceiveFaqSuggestions", _faq.GetQuestions());
        }
    }
}

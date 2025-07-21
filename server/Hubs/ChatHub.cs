using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
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
        private readonly SupportEscalationService _escalation;

        public ChatHub(AppDbContext db, FaqService faq, ActivityLogger logger, AiService ai, SupportEscalationService escalation)
        {
            _db = db;
            _faq = faq;
            _logger = logger;
            _ai = ai;
            _escalation = escalation;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                await Clients.Caller.SendAsync("Welcome", "How can I help you today?");
                await Clients.Caller.SendAsync("FaqList", _faq.GetQuestions());
                await _logger.LogAsync(userId, "Connected to chat", "support");
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

            var greeting = GetGreetingReply(message);
            var answer = _faq.GetAnswer(message) ?? greeting;
            if (answer == null)
            {
                var context = await _db.ChatMessages
                    .Where(m => m.UserId == userId || m.UserId == "bot")
                    .OrderByDescending(m => m.Timestamp)
                    .Take(5)
                    .OrderBy(m => m.Timestamp)
                    .Select(m => new { role = m.UserId == "bot" ? "assistant" : "user", content = m.Content })
                    .ToListAsync();
                context.Add(new { role = "user", content = message });
                var payload = JsonSerializer.Serialize(context);
                answer = await _ai.GetResponseAsync(payload);
            }

            if (!string.IsNullOrEmpty(greeting))
            {
                await Clients.Group(userId).SendAsync("FaqList", _faq.GetQuestions());
            }

            if (string.IsNullOrEmpty(answer))
            {
                await _escalation.NotifyAsync(userId, message);
                answer = "I've forwarded your request to a human agent who will respond shortly.";
            }

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

        private static string? GetGreetingReply(string message)
        {
            var text = message.Trim().ToLowerInvariant();
            if (text.StartsWith("hi") || text.StartsWith("hello") || text.StartsWith("hey"))
            {
                return "Hello! How can I help you today?";
            }
            return null;
        }
    }
}

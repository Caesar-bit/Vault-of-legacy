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

        public ChatHub(AppDbContext db, FaqService faq)
        {
            _db = db;
            _faq = faq;
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

            await Clients.All.SendAsync("ReceiveMessage", new
            {
                chatMessage.Id,
                chatMessage.UserId,
                chatMessage.Content,
                chatMessage.Timestamp
            });

            var answer = _faq.GetAnswer(message);
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
                await Clients.Caller.SendAsync("ReceiveMessage", new
                {
                    botMessage.Id,
                    botMessage.UserId,
                    botMessage.Content,
                    botMessage.Timestamp
                });
            }
        }
    }
}

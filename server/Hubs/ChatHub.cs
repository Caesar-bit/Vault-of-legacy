using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using VaultBackend.Data;
using VaultBackend.Models;

namespace VaultBackend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly AppDbContext _db;

        public ChatHub(AppDbContext db)
        {
            _db = db;
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
        }
    }
}

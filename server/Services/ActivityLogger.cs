using Microsoft.AspNetCore.SignalR;
using VaultBackend.Data;
using VaultBackend.Hubs;
using VaultBackend.Models;

namespace VaultBackend.Services
{
    public class ActivityLogger
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<ActivityHub> _hub;

        public ActivityLogger(AppDbContext db, IHubContext<ActivityHub> hub)
        {
            _db = db;
            _hub = hub;
        }

        public async Task LogAsync(string userId, string action, string item)
        {
            var entry = new ActivityLog
            {
                UserId = userId,
                Action = action,
                Item = item,
                Timestamp = DateTime.UtcNow
            };
            _db.ActivityLogs.Add(entry);
            await _db.SaveChangesAsync();
            await _hub.Clients.All.SendAsync("NewActivity", new
            {
                entry.Id,
                entry.UserId,
                entry.Action,
                entry.Item,
                entry.Timestamp
            });
        }
    }
}

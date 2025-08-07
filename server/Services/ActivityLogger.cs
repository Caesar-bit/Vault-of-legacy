using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
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
            var now = DateTime.UtcNow;
            var last = await _db.ActivityLogs
                .Where(a => a.UserId == userId && a.Action == action && a.Item == item)
                .OrderByDescending(a => a.Timestamp)
                .FirstOrDefaultAsync();

            var threshold = action == "Saved user data" ? 30 : 5;
            if (last != null && (now - last.Timestamp).TotalSeconds < threshold)
            {
                // Update timestamp instead of creating a duplicate entry
                last.Timestamp = now;
                await _db.SaveChangesAsync();
                return;
            }

            var entry = new ActivityLog
            {
                UserId = userId,
                Action = action,
                Item = item,
                Timestamp = now
            };
            _db.ActivityLogs.Add(entry);
            await _db.SaveChangesAsync();
            await _hub.Clients.Group(userId).SendAsync("NewActivity", new
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

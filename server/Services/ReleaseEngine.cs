using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.Hubs;
using VaultBackend.Models;

namespace VaultBackend.Services
{
    public class ReleaseEngine : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<ActivityHub> _hub;

        public ReleaseEngine(IServiceScopeFactory scopeFactory, IHubContext<ActivityHub> hub)
        {
            _scopeFactory = scopeFactory;
            _hub = hub;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var logger = scope.ServiceProvider.GetRequiredService<ActivityLogger>();
                    var now = DateTime.UtcNow;
                    var pending = await db.ReleaseSchedules
                        .Include(r => r.Beneficiary)
                        .Where(r => !r.Released && r.ReleaseDate <= now)
                        .ToListAsync(stoppingToken);
                    foreach (var rel in pending)
                    {
                        rel.Released = true;
                        await db.SaveChangesAsync(stoppingToken);
                        await logger.LogAsync(rel.UserId, "Auto release", rel.FilePath);
                        await _hub.Clients.Group(rel.UserId).SendAsync("ReleaseTriggered", new
                        {
                            rel.Id,
                            rel.FilePath,
                            rel.BeneficiaryEmail
                        }, cancellationToken: stoppingToken);
                    }
                }
                catch
                {
                    // ignore
                }
            }
        }
    }
}

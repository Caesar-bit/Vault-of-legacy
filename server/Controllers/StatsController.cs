using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using VaultBackend.Data;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/stats")]
    public class StatsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public StatsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var uploaded = await _db.UploadedFiles.CountAsync(f => f.UserId == userId);
            var structureEntry = await _db.FileStructures.FirstOrDefaultAsync(f => f.UserId == userId);
            int structureCount = 0;
            if (structureEntry != null)
            {
                try
                {
                    using var doc = JsonDocument.Parse(structureEntry.Data);
                    structureCount = CountItems(doc.RootElement);
                }
                catch
                {
                    structureCount = 0;
                }
            }
            var totalAssets = uploaded + structureCount;

            var collectionsEntry = await _db.UserData.FirstOrDefaultAsync(u => u.UserId == userId && u.Type == "collections");
            int activeProjects = 0;
            if (collectionsEntry != null)
            {
                try
                {
                    using var doc = JsonDocument.Parse(collectionsEntry.Data);
                    activeProjects = doc.RootElement.GetArrayLength();
                }
                catch
                {
                    activeProjects = 0;
                }
            }

            var since = DateTime.UtcNow.AddDays(-30);
            var monthlyViews = await _db.ActivityLogs.CountAsync(a => a.UserId == userId && a.Timestamp >= since);

            var contributors = await _db.Users.CountAsync();

            return Ok(new
            {
                totalAssets,
                activeProjects,
                monthlyViews,
                contributors
            });
        }

        private static int CountItems(JsonElement element)
        {
            int count = 0;
            foreach (var item in element.EnumerateArray())
            {
                if (item.TryGetProperty("children", out var children) && children.ValueKind == JsonValueKind.Array)
                {
                    count += CountItems(children);
                }
                var type = item.GetProperty("type").GetString();
                if (type != "folder")
                {
                    count++;
                }
            }
            return count;
        }
    }
}

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

            int collectionCount = 0;
            var collectionFiles = await _db.UserData.FirstOrDefaultAsync(u => u.UserId == userId && u.Type == "collection_files");
            if (collectionFiles != null)
            {
                try
                {
                    using var doc = JsonDocument.Parse(collectionFiles.Data);
                    foreach (var prop in doc.RootElement.EnumerateObject())
                    {
                        if (prop.Value.ValueKind == JsonValueKind.Array)
                        {
                            collectionCount += CountItems(prop.Value);
                        }
                    }
                }
                catch { }
            }

            int archiveCount = 0;
            var archiveFiles = await _db.UserData.FirstOrDefaultAsync(u => u.UserId == userId && u.Type == "archive_files");
            if (archiveFiles != null)
            {
                try
                {
                    using var doc = JsonDocument.Parse(archiveFiles.Data);
                    foreach (var prop in doc.RootElement.EnumerateObject())
                    {
                        if (prop.Value.ValueKind == JsonValueKind.Array)
                        {
                            archiveCount += CountItems(prop.Value);
                        }
                    }
                }
                catch { }
            }

            int galleryCount = 0;
            var galleryEntry = await _db.UserData.FirstOrDefaultAsync(u => u.UserId == userId && u.Type == "gallery_items");
            if (galleryEntry != null)
            {
                try
                {
                    using var doc = JsonDocument.Parse(galleryEntry.Data);
                    galleryCount = doc.RootElement.GetArrayLength();
                }
                catch { }
            }

            var totalAssets = uploaded + structureCount + collectionCount + archiveCount + galleryCount;

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

        [HttpGet("assets")]
        public async Task<IActionResult> GetAssetBreakdown()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var counts = new Dictionary<string, int>
            {
                ["images"] = 0,
                ["documents"] = 0,
                ["videos"] = 0,
                ["audio"] = 0
            };

            var structureEntry = await _db.FileStructures.FirstOrDefaultAsync(f => f.UserId == userId);
            if (structureEntry != null)
            {
                try
                {
                    using var doc = JsonDocument.Parse(structureEntry.Data);
                    CountFileTypes(doc.RootElement, counts);
                }
                catch { }
            }

            var collectionEntry = await _db.UserData.FirstOrDefaultAsync(u => u.UserId == userId && u.Type == "collection_files");
            if (collectionEntry != null)
            {
                try
                {
                    using var doc = JsonDocument.Parse(collectionEntry.Data);
                    foreach (var prop in doc.RootElement.EnumerateObject())
                    {
                        if (prop.Value.ValueKind == JsonValueKind.Array)
                        {
                            CountFileTypes(prop.Value, counts);
                        }
                    }
                }
                catch { }
            }

            var galleryEntry = await _db.UserData.FirstOrDefaultAsync(u => u.UserId == userId && u.Type == "gallery_items");
            if (galleryEntry != null)
            {
                try
                {
                    using var doc = JsonDocument.Parse(galleryEntry.Data);
                    foreach (var item in doc.RootElement.EnumerateArray())
                    {
                        if (item.TryGetProperty("type", out var t))
                        {
                            AddAsset(counts, t.GetString());
                        }
                    }
                }
                catch { }
            }

            var archiveEntry = await _db.UserData.FirstOrDefaultAsync(u => u.UserId == userId && u.Type == "archive_files");
            if (archiveEntry != null)
            {
                try
                {
                    using var doc = JsonDocument.Parse(archiveEntry.Data);
                    foreach (var prop in doc.RootElement.EnumerateObject())
                    {
                        if (prop.Value.ValueKind == JsonValueKind.Array)
                        {
                            CountFileTypes(prop.Value, counts);
                        }
                    }
                }
                catch { }
            }

            return Ok(counts);
        }

        private static void CountFileTypes(JsonElement element, Dictionary<string, int> counts)
        {
            foreach (var item in element.EnumerateArray())
            {
                if (item.TryGetProperty("children", out var children) && children.ValueKind == JsonValueKind.Array)
                {
                    CountFileTypes(children, counts);
                }
                if (item.TryGetProperty("type", out var t))
                {
                    AddAsset(counts, t.GetString());
                }
            }
        }

        private static void AddAsset(Dictionary<string, int> counts, string? type)
        {
            if (string.IsNullOrEmpty(type) || type == "folder") return;
            var key = type switch
            {
                "image" => "images",
                "video" => "videos",
                "audio" => "audio",
                _ => "documents"
            };
            counts[key] = counts.GetValueOrDefault(key) + 1;
        }
    }
}

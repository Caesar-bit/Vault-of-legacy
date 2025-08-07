using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.Models;
using VaultBackend.Services;
using System.Security.Claims;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/userdata")]
    public class UserDataController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ActivityLogger _logger;

        public UserDataController(AppDbContext db, ActivityLogger logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpGet("{type}")]
        public async Task<IActionResult> Get(string type)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var data = await _db.UserData.FirstOrDefaultAsync(u => u.UserId == userId && u.Type == type);
            var json = data?.Data ?? "[]";
            return Content(json, "application/json");
        }

        [HttpPost("{type}")]
        public async Task<IActionResult> Save(string type, [FromBody] object payload, [FromQuery] bool log = true)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var text = payload?.ToString() ?? "[]";
            var entry = await _db.UserData.FirstOrDefaultAsync(u => u.UserId == userId && u.Type == type);
            if (entry == null)
            {
                entry = new UserData { UserId = userId, Type = type, Data = text };
                _db.UserData.Add(entry);
                await _db.SaveChangesAsync();
                if (log)
                    await _logger.LogAsync(userId, "Saved user data", type);
            }
            else if (entry.Data != text)
            {
                entry.Data = text;
                await _db.SaveChangesAsync();
                if (log)
                    await _logger.LogAsync(userId, "Saved user data", type);
            }
            // if data unchanged, do nothing
            return NoContent();
        }
    }
}

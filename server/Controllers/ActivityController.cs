using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using System.Security.Claims;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/activity")]
    public class ActivityController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ActivityController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecent()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var items = await _db.ActivityLogs
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .Take(20)
                .Select(a => new
                {
                    a.Id,
                    a.UserId,
                    a.Action,
                    a.Item,
                    a.Timestamp
                })
                .ToListAsync();
            return Ok(items);
        }
    }
}

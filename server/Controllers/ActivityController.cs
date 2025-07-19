using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;

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
            var items = await _db.ActivityLogs
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

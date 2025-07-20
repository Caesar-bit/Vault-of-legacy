using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/chat")]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ChatController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("history")]
        public async Task<IActionResult> History()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var items = await _db.ChatMessages
                .Where(m => m.UserId == userId || m.UserId == "bot")
                .OrderBy(m => m.Timestamp)
                .Take(50)
                .Select(m => new
                {
                    m.Id,
                    m.UserId,
                    m.Content,
                    m.Timestamp
                })
                .ToListAsync();
            return Ok(items);
        }
    }
}

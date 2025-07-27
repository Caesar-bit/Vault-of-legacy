using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VaultBackend.Data;
using VaultBackend.Models;
using VaultBackend.Services;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/trustees")]
    public class TrusteesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ActivityLogger _logger;

        public TrusteesController(AppDbContext db, ActivityLogger logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> List()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var trustees = await _db.Trustees.Where(t => t.UserId == userId).ToListAsync();
            return Ok(trustees);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TrusteeRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var trustee = new Trustee
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                Name = request.Name,
                Email = request.Email,
                Tier = request.Tier,
                CreatedAt = DateTime.UtcNow
            };
            _db.Trustees.Add(trustee);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Added trustee", trustee.Email);
            return Ok(trustee);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateTrusteeRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var item = await _db.Trustees.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (item == null) return NotFound();

            if (!string.IsNullOrEmpty(request.Name)) item.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Email)) item.Email = request.Email;
            if (!string.IsNullOrEmpty(request.Tier)) item.Tier = request.Tier;

            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Updated trustee", item.Email);
            return Ok(item);
        }

        [HttpPost("{id}/verify")]
        public async Task<IActionResult> Verify(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var item = await _db.Trustees.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (item == null) return NotFound();

            item.Verified = true;
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Verified trustee", item.Email);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var trustee = await _db.Trustees.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (trustee == null) return NotFound();

            _db.Trustees.Remove(trustee);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Removed trustee", trustee.Email);
            return Ok();
        }
    }
}

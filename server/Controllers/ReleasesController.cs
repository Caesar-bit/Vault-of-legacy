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
    [Route("api/releases")]
    public class ReleasesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ActivityLogger _logger;

        public ReleasesController(AppDbContext db, ActivityLogger logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> List()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var items = await _db.ReleaseSchedules
                .Include(r => r.Beneficiary)
                .Where(r => r.UserId == userId)
                .ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReleaseSchedule schedule)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            schedule.Id = Guid.NewGuid().ToString();
            schedule.UserId = userId;
            schedule.CreatedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(schedule.BeneficiaryId))
            {
                var ben = await _db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == schedule.BeneficiaryId && b.UserId == userId);
                if (ben != null)
                {
                    schedule.BeneficiaryEmail = ben.Email;
                }
            }

            if (schedule.TriggerEvent == "trustee")
            {
                schedule.RequiresApproval = true;
            }

            _db.ReleaseSchedules.Add(schedule);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Scheduled release", schedule.FilePath);
            return Ok(schedule);
        }

        [HttpPost("{id}/trigger")]
        public async Task<IActionResult> Trigger(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var schedule = await _db.ReleaseSchedules.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (schedule == null) return NotFound();

            schedule.Released = true;
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Triggered release", schedule.FilePath);
            await _logger.LogAsync(userId, "Release sent", schedule.BeneficiaryEmail);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var schedule = await _db.ReleaseSchedules.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (schedule == null) return NotFound();

            _db.ReleaseSchedules.Remove(schedule);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Deleted release", schedule.FilePath);
            return Ok();
        }
    }
}

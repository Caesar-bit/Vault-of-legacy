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
    [Route("api/beneficiaries")]
    public class BeneficiariesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ActivityLogger _logger;

        public BeneficiariesController(AppDbContext db, ActivityLogger logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> List()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var items = await _db.Beneficiaries.Where(b => b.UserId == userId).ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BeneficiaryRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var beneficiary = new Beneficiary
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Relationship = request.Relationship,
                CreatedAt = DateTime.UtcNow,
            };
            _db.Beneficiaries.Add(beneficiary);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Added beneficiary", beneficiary.Email);
            return Ok(beneficiary);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateBeneficiaryRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var item = await _db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
            if (item == null) return NotFound();

            if (!string.IsNullOrEmpty(request.Name)) item.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Email)) item.Email = request.Email;
            if (!string.IsNullOrEmpty(request.Phone)) item.Phone = request.Phone;
            if (!string.IsNullOrEmpty(request.Relationship)) item.Relationship = request.Relationship;

            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Updated beneficiary", item.Email);
            return Ok(item);
        }

        [HttpPost("{id}/verify")]
        public async Task<IActionResult> Verify(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var item = await _db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
            if (item == null) return NotFound();

            item.Verified = true;
            item.VerifiedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Verified beneficiary", item.Email);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var item = await _db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
            if (item == null) return NotFound();

            _db.Beneficiaries.Remove(item);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Removed beneficiary", item.Email);
            return Ok();
        }
    }

    public record BeneficiaryRequest(string Name, string Email, string Phone, string Relationship);

    public record UpdateBeneficiaryRequest(string? Name, string? Email, string? Phone, string? Relationship);
}

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
    [Route("api/fingerprint")]
    public class FingerprintController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly TokenService _tokens;

        public FingerprintController(AppDbContext db, TokenService tokens)
        {
            _db = db;
            _tokens = tokens;
        }

        [Authorize]
        [HttpGet("status")]
        public async Task<IActionResult> Status()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var exists = await _db.FingerprintCredentials.AnyAsync(f => f.UserId == userId);
            return Ok(new { enabled = exists });
        }

        [Authorize]
        [HttpPost("enroll")]
        public async Task<IActionResult> Enroll([FromBody] EnrollRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            if (await _db.FingerprintCredentials.AnyAsync(f => f.UserId == userId))
                return BadRequest("Fingerprint already enrolled");

            if (await _db.FingerprintCredentials.AnyAsync(f => f.CredentialId == request.CredentialId))
                return BadRequest("Credential already exists");

            var credential = new FingerprintCredential
            {
                UserId = userId,
                CredentialId = request.CredentialId
            };
            _db.FingerprintCredentials.Add(credential);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> Remove()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var creds = await _db.FingerprintCredentials.Where(f => f.UserId == userId).ToListAsync();
            if (creds.Count == 0) return NotFound();
            _db.FingerprintCredentials.RemoveRange(creds);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] FpLoginRequest request)
        {
            var cred = await _db.FingerprintCredentials.FirstOrDefaultAsync(f => f.UserId == request.UserId && f.CredentialId == request.CredentialId);
            if (cred == null) return Unauthorized();
            var user = await _db.Users.FindAsync(request.UserId);
            if (user == null) return Unauthorized();
            user.LastLogin = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            var token = _tokens.GenerateToken(user);
            return Ok(new
            {
                user = new { user.Id, user.Email, user.Name, user.Role, user.Status, user.CreatedAt, user.LastLogin },
                token
            });
        }

        public record EnrollRequest(string CredentialId);
        public record FpLoginRequest(string UserId, string CredentialId);
    }
}

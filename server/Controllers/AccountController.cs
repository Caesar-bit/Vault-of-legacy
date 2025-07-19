using System.Security.Claims;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.Models;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/account")]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AccountController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();
            return Ok(new { user.Id, user.Email, user.Name, user.Role, user.Status, user.CreatedAt, user.LastLogin });
        }

        [HttpPatch("me")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
            {
                if (await _db.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId))
                    return BadRequest("Email already registered");
                user.Email = request.Email;
            }
            if (!string.IsNullOrEmpty(request.Name))
            {
                user.Name = request.Name;
            }
            await _db.SaveChangesAsync();
            return Ok(new { user.Id, user.Email, user.Name, user.Role, user.Status, user.CreatedAt, user.LastLogin });
        }

        [HttpPost("password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return BadRequest("Invalid current password");
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public record UpdateProfileRequest(string? Name, string? Email);
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
}

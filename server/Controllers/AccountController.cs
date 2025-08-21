using System.Security.Claims;
using System.Text.RegularExpressions;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.Models;
using VaultBackend.Services;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/account")]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ActivityLogger _logger;

        public AccountController(AppDbContext db, ActivityLogger logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();
            return Ok(new { user.Id, user.Email, user.Name, user.Role, user.Status, user.CreatedAt, user.LastLogin, user.Avatar, HasVaultPin = user.VaultPinHash != null });
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
            if (!string.IsNullOrEmpty(request.Avatar))
            {
                user.Avatar = request.Avatar;
            }
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Updated profile", user.Email);
            return Ok(new { user.Id, user.Email, user.Name, user.Role, user.Status, user.CreatedAt, user.LastLogin, user.Avatar, HasVaultPin = user.VaultPinHash != null });
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
            await _logger.LogAsync(userId, "Changed password", user.Email);
            return NoContent();
        }

        [HttpPost("pin")]
        public async Task<IActionResult> SetPin(SetPinRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (!Regex.IsMatch(request.NewPin, "^\\d{6}$"))
                return BadRequest("PIN must be exactly 6 digits");

            if (user.VaultPinHash != null)
            {
                if (string.IsNullOrEmpty(request.CurrentPin) || !BCrypt.Net.BCrypt.Verify(request.CurrentPin, user.VaultPinHash))
                    return BadRequest("Current PIN incorrect");
            }

            user.VaultPinHash = BCrypt.Net.BCrypt.HashPassword(request.NewPin);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Updated vault PIN", user.Email);
            return NoContent();
        }

        [HttpDelete("pin")]
        public async Task<IActionResult> RemovePin(RemovePinRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();
            if (user.VaultPinHash == null) return BadRequest("PIN not set");
            if (!BCrypt.Net.BCrypt.Verify(request.Pin, user.VaultPinHash))
                return BadRequest("Invalid PIN");
            user.VaultPinHash = null;
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Removed vault PIN", user.Email);
            return NoContent();
        }

        [HttpPost("pin/verify")]
        public async Task<IActionResult> VerifyPin(VerifyPinRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var user = await _db.Users.FindAsync(userId);
            if (user == null || user.VaultPinHash == null || !BCrypt.Net.BCrypt.Verify(request.Pin, user.VaultPinHash))
                return BadRequest("Invalid PIN");
            return NoContent();
        }
    }

    public record UpdateProfileRequest(string? Name, string? Email, string? Avatar);
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
    public record SetPinRequest(string? CurrentPin, string NewPin);
    public record RemovePinRequest(string Pin);
    public record VerifyPinRequest(string Pin);
}

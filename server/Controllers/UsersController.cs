using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using VaultBackend.Data;
using VaultBackend.Models;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize(Roles = "admin")]
    [Route("api/user")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _db.Users
                .Select(u => new { u.Id, u.Email, u.Name, u.Role, u.Status, u.CreatedAt, u.LastLogin })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser(InviteUserRequest request)
        {
            if (await _db.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email already registered");

            var user = new User
            {
                Email = request.Email,
                Name = request.Name,
                Role = request.Role,
                Status = "pending",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new { user.Id, user.Email, user.Name, user.Role, user.Status, user.CreatedAt, user.LastLogin });
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateUser(string id, UpdateUserRequest request)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(request.Name)) user.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Email)) user.Email = request.Email;
            if (!string.IsNullOrEmpty(request.Role)) user.Role = request.Role;
            if (!string.IsNullOrEmpty(request.Status)) user.Status = request.Status;

            await _db.SaveChangesAsync();
            return Ok(new { user.Id, user.Email, user.Name, user.Role, user.Status, user.CreatedAt, user.LastLogin });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return Ok();
        }
    }

    public record UpdateUserRequest(string? Name, string? Email, string? Role, string? Status);
    public record InviteUserRequest(string Email, string Name, string Role);
}

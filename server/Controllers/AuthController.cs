using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.Models;
using VaultBackend.Services;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly TokenService _tokens;

        public AuthController(AppDbContext db, TokenService tokens)
        {
            _db = db;
            _tokens = tokens;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(SignupRequest request)
        {
            if (await _db.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email already registered");

            // If the local part (before '@') ends with '.admin', grant admin role
            var atPos = request.Email.IndexOf('@');
            var localPart = atPos > 0 ? request.Email.Substring(0, atPos) : request.Email;
            var role = localPart.EndsWith(".admin") ? "admin" : "user";
            var user = new User
            {
                Email = request.Email,
                Name = request.Name,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = role,
                Status = "active",
                LastLogin = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = _tokens.GenerateToken(user);
            return Ok(new { user.Id, user.Email, user.Name, user.Role, user.Status, user.CreatedAt, user.LastLogin, user.Avatar, token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return BadRequest("Invalid credentials");

            if (user.Status != "active")
                return BadRequest("Account inactive. Contact your administrator.");

            user.LastLogin = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var token = _tokens.GenerateToken(user);
            return Ok(new { user.Id, user.Email, user.Name, user.Role, user.Status, user.CreatedAt, user.LastLogin, user.Avatar, token });
        }
    }

    public record SignupRequest(string Email, string Password, string Name);
    public record LoginRequest(string Email, string Password);
}

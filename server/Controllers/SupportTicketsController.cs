using System.Security.Claims;
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
    [Route("api/tickets")]
    public class SupportTicketsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ActivityLogger _logger;
        private readonly SupportEscalationService _escalation;

        public SupportTicketsController(AppDbContext db, ActivityLogger logger, SupportEscalationService escalation)
        {
            _db = db;
            _logger = logger;
            _escalation = escalation;
        }

        [HttpGet]
        public async Task<IActionResult> List()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "user";
            var query = _db.SupportTickets.AsQueryable();
            if (role != "admin")
            {
                query = query.Where(t => t.UserId == userId);
            }
            var items = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SupportTicket ticket)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            ticket.Id = Guid.NewGuid().ToString();
            ticket.UserId = userId;
            ticket.Status = "open";
            ticket.CreatedAt = DateTime.UtcNow;
            _db.SupportTickets.Add(ticket);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Created support ticket", ticket.Title);
            await _escalation.NotifyAsync(userId, ticket.Description);
            return Ok(ticket);
        }
    }
}

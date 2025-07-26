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
        public async Task<IActionResult> Create([FromBody] SupportTicketRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var ticket = new SupportTicket
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                Title = request.Title,
                Description = request.Description,
                Status = "open",
                CreatedAt = DateTime.UtcNow
            };
            _db.SupportTickets.Add(ticket);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Created support ticket", ticket.Title);
            await _escalation.NotifyAsync(userId, ticket.Description);
            return Ok(ticket);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "user";
            var ticket = await _db.SupportTickets.FirstOrDefaultAsync(t => t.Id == id);
            if (ticket == null) return NotFound();
            if (role != "admin" && ticket.UserId != userId) return Forbid();
            return Ok(ticket);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateTicketRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "user";
            var ticket = await _db.SupportTickets.FirstOrDefaultAsync(t => t.Id == id);
            if (ticket == null) return NotFound();
            if (role != "admin" && ticket.UserId != userId) return Forbid();

            if (!string.IsNullOrEmpty(request.Title)) ticket.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Description)) ticket.Description = request.Description;
            if (!string.IsNullOrEmpty(request.Status)) ticket.Status = request.Status;

            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Updated support ticket", ticket.Title);
            return Ok(ticket);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "user";
            var ticket = await _db.SupportTickets.FirstOrDefaultAsync(t => t.Id == id);
            if (ticket == null) return NotFound();
            if (role != "admin" && ticket.UserId != userId) return Forbid();

            _db.SupportTickets.Remove(ticket);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Deleted support ticket", ticket.Title);
            return Ok();
        }
    }

    public record UpdateTicketRequest(string? Title, string? Description, string? Status);
}

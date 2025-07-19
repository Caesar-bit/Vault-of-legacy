using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TimelineEventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public TimelineEventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IEnumerable<TimelineEvent>> GetAll()
        {
            return await _context.TimelineEvents.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TimelineEvent>> Get(int id)
        {
            var item = await _context.TimelineEvents.FindAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<TimelineEvent>> Create(TimelineEvent item)
        {
            _context.TimelineEvents.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TimelineEvent item)
        {
            if (id != item.Id) return BadRequest();
            if (!await _context.TimelineEvents.AnyAsync(t => t.Id == id)) return NotFound();
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.TimelineEvents.FindAsync(id);
            if (item == null) return NotFound();
            _context.TimelineEvents.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

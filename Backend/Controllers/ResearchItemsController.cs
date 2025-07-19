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
    public class ResearchItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ResearchItemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IEnumerable<ResearchItem>> GetAll()
        {
            return await _context.ResearchItems.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ResearchItem>> Get(int id)
        {
            var item = await _context.ResearchItems.FindAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<ResearchItem>> Create(ResearchItem item)
        {
            _context.ResearchItems.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ResearchItem item)
        {
            if (id != item.Id) return BadRequest();
            if (!await _context.ResearchItems.AnyAsync(r => r.Id == id)) return NotFound();
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.ResearchItems.FindAsync(id);
            if (item == null) return NotFound();
            _context.ResearchItems.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

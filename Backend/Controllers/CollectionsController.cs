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
    public class CollectionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public CollectionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IEnumerable<Collection>> GetAll()
        {
            return await _context.Collections.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Collection>> Get(int id)
        {
            var item = await _context.Collections.FindAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<Collection>> Create(Collection item)
        {
            _context.Collections.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Collection item)
        {
            if (id != item.Id) return BadRequest();
            if (!await _context.Collections.AnyAsync(c => c.Id == id)) return NotFound();
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Collections.FindAsync(id);
            if (item == null) return NotFound();
            _context.Collections.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

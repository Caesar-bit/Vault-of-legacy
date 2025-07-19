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
    public class GalleryItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public GalleryItemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IEnumerable<GalleryItem>> GetAll()
        {
            return await _context.GalleryItems.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GalleryItem>> Get(int id)
        {
            var item = await _context.GalleryItems.FindAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<GalleryItem>> Create(GalleryItem item)
        {
            _context.GalleryItems.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, GalleryItem item)
        {
            if (id != item.Id) return BadRequest();
            if (!await _context.GalleryItems.AnyAsync(g => g.Id == id)) return NotFound();
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.GalleryItems.FindAsync(id);
            if (item == null) return NotFound();
            _context.GalleryItems.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.Models;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/apikey")]
    public class ApiKeysController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ApiKeysController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetKeys()
        {
            var keys = await _db.ApiKeys.ToListAsync();
            return Ok(keys);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ApiKeyRequest request)
        {
            var value = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            var key = new ApiKey
            {
                Name = request.Name,
                Key = value,
                Permissions = request.Permissions,
                Created = DateTime.UtcNow,
                Status = "active"
            };
            _db.ApiKeys.Add(key);
            await _db.SaveChangesAsync();
            return Ok(key);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var key = await _db.ApiKeys.FindAsync(id);
            if (key == null) return NotFound();
            _db.ApiKeys.Remove(key);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPatch("{id}/regenerate")]
        public async Task<IActionResult> Regenerate(string id)
        {
            var key = await _db.ApiKeys.FindAsync(id);
            if (key == null) return NotFound();
            key.Key = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            await _db.SaveChangesAsync();
            return Ok(key);
        }
    }

    public record ApiKeyRequest(string Name, string[] Permissions);
}

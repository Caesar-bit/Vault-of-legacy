using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.Models;
using System.Text.Json;
using VaultBackend.Services;
using System.Security.Claims;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/file")]
    public class FilesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;
        private readonly ActivityLogger _logger;

        public FilesController(AppDbContext db, IWebHostEnvironment env, ActivityLogger logger)
        {
            _db = db;
            _env = env;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload()
        {
            if (!Request.HasFormContentType)
                return BadRequest("Invalid form");

            var form = await Request.ReadFormAsync();
            var file = form.Files.FirstOrDefault();
            if (file == null)
                return BadRequest("No file provided");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";

            var relativePath = Path.Combine("UploadedFiles", userId, Guid.NewGuid().ToString() + "_" + file.FileName);
            var filePath = Path.Combine(_env.ContentRootPath, relativePath);
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
            using var stream = System.IO.File.OpenWrite(filePath);
            await file.CopyToAsync(stream);

            var uploaded = new UploadedFile { Path = relativePath, OriginalName = file.FileName, UserId = userId };
            _db.UploadedFiles.Add(uploaded);
            await _db.SaveChangesAsync();
            await _logger.LogAsync(userId, "Uploaded file", file.FileName);

            return Ok(new { uploaded.Path, uploaded.OriginalName });
        }

        [HttpGet("list")]
        public async Task<IActionResult> List()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var files = await _db.UploadedFiles
                .Where(f => f.UserId == userId)
                .Select(f => new { f.Path, f.OriginalName })
                .ToListAsync();
            return Ok(files);
        }

        [HttpGet("structure")]
        public async Task<IActionResult> GetStructure()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var s = await _db.FileStructures.FirstOrDefaultAsync(f => f.UserId == userId);
            if (s == null) return Ok("[]");
            return Ok(JsonDocument.Parse(s.Data).RootElement);
        }

        [HttpPost("structure")]
        public async Task<IActionResult> SaveStructure([FromBody] JsonElement data, [FromQuery] bool log = true)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var s = await _db.FileStructures.FirstOrDefaultAsync(f => f.UserId == userId);
            var newData = data.GetRawText();
            if (s == null)
            {
                s = new FileStructure { UserId = userId, Data = newData };
                _db.FileStructures.Add(s);
                await _db.SaveChangesAsync();
                if (log)
                    await _logger.LogAsync(userId, "Updated vault structure", "");
            }
            else if (s.Data != newData)
            {
                s.Data = newData;
                await _db.SaveChangesAsync();
                if (log)
                    await _logger.LogAsync(userId, "Updated vault structure", "");
            }
            else
            {
                // No changes, so don't log another activity entry
            }
            return NoContent();
        }
    }
}

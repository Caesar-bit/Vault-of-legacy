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

            var dir = Path.Combine(_env.ContentRootPath, "UploadedFiles");
            Directory.CreateDirectory(dir);
            var filePath = Path.Combine(dir, Guid.NewGuid().ToString() + "_" + file.FileName);
            using var stream = System.IO.File.OpenWrite(filePath);
            await file.CopyToAsync(stream);

            var uploaded = new UploadedFile { Path = filePath, OriginalName = file.FileName };
            _db.UploadedFiles.Add(uploaded);
            await _db.SaveChangesAsync();
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
            await _logger.LogAsync(userId, "Uploaded file", file.FileName);

            return Ok(new { uploaded.Path, uploaded.OriginalName });
        }

        [HttpGet("list")]
        public async Task<IActionResult> List()
        {
            var files = await _db.UploadedFiles.Select(f => new { f.Path, f.OriginalName }).ToListAsync();
            return Ok(files);
        }

        [HttpGet("structure")]
        public async Task<IActionResult> GetStructure()
        {
            var s = await _db.FileStructures.FirstOrDefaultAsync();
            if (s == null) return Ok("[]");
            return Ok(JsonDocument.Parse(s.Data).RootElement);
        }

        [HttpPost("structure")]
        public async Task<IActionResult> SaveStructure([FromBody] JsonElement data)
        {
            var s = await _db.FileStructures.FirstOrDefaultAsync();
            if (s == null)
            {
                s = new FileStructure { Id = "main", Data = data.GetRawText() };
                _db.FileStructures.Add(s);
            }
            else
            {
                s.Data = data.GetRawText();
            }
            await _db.SaveChangesAsync();
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
            await _logger.LogAsync(userId, "Updated vault structure", "");
            return NoContent();
        }
    }
}

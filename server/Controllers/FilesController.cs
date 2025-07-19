using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.Models;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/file")]
    public class FilesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public FilesController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
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

            return Ok(new { uploaded.Path, uploaded.OriginalName });
        }

        [HttpGet("list")]
        public async Task<IActionResult> List()
        {
            var files = await _db.UploadedFiles.Select(f => new { f.Path, f.OriginalName }).ToListAsync();
            return Ok(files);
        }
    }
}

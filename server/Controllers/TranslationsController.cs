using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Route("api/translations")]
    public class TranslationsController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public TranslationsController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpGet("{lang}")]
        public IActionResult Get(string lang)
        {
            var file = Path.Combine(_env.ContentRootPath, "Resources", "Translations", $"{lang}.json");
            if (!System.IO.File.Exists(file))
                return NotFound();

            var json = System.IO.File.ReadAllText(file);
            var data = JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? new();
            return Ok(data);
        }
    }
}

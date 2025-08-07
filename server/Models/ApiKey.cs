using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class ApiKey
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Key { get; set; } = string.Empty;

        public string[] Permissions { get; set; } = Array.Empty<string>();

        public DateTime Created { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "active";

        public DateTime? LastUsed { get; set; }

        public int Requests { get; set; }
    }
}

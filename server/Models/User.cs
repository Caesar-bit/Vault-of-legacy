using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "user";

        public string Status { get; set; } = "active";

        public string? Avatar { get; set; }

        public DateTime? LastLogin { get; set; }

        // Older databases may not have populated this column so make it nullable
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class ActivityLog
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string Action { get; set; } = string.Empty;

        [Required]
        public string Item { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}

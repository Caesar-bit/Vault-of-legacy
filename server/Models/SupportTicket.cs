using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class SupportTicket
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string Status { get; set; } = "open";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class Beneficiary
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Phone]
        public string Phone { get; set; } = string.Empty;

        public string Relationship { get; set; } = string.Empty;

        public bool Verified { get; set; } = false;

        public DateTime? VerifiedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

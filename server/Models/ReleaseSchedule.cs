using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class ReleaseSchedule
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string FilePath { get; set; } = string.Empty;

        public DateTime ReleaseDate { get; set; }

        [Required]
        public string TriggerEvent { get; set; } = "date"; // date, inactivity, trustee

        [EmailAddress]
        public string BeneficiaryEmail { get; set; } = string.Empty;

        public string? BeneficiaryId { get; set; }
        public Beneficiary? Beneficiary { get; set; }

        public bool RequiresApproval { get; set; } = false;

        public bool Released { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

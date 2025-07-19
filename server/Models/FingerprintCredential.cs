using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class FingerprintCredential
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string CredentialId { get; set; } = string.Empty;
    }
}

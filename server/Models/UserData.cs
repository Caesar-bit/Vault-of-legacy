using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class UserData
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        public string Data { get; set; } = "[]";
    }
}

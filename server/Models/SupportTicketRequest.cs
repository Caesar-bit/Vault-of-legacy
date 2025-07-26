using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class SupportTicketRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;
    }
}

using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class FileStructure
    {
        [Key]
        public string Id { get; set; } = "main";

        [Required]
        public string Data { get; set; } = "[]";
    }
}

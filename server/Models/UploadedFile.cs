using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class UploadedFile
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        // Path relative to the application root, e.g. "UploadedFiles/{userId}/filename"
        [Required]
        public string Path { get; set; } = string.Empty;

        [Required]
        public string OriginalName { get; set; } = string.Empty;
    }
}

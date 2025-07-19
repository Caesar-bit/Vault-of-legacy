namespace Backend.Models
{
    public class Collection
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int AssetCount { get; set; }
        public bool IsPublic { get; set; }
        public string? Password { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Thumbnail { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty; // comma separated
    }
}

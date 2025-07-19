namespace Backend.Models
{
    public class GalleryItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = "image"; // image or video
        public string Url { get; set; } = string.Empty;
        public string Thumbnail { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Location { get; set; } = string.Empty;
        public int Views { get; set; }
        public int Likes { get; set; }
        public string Tags { get; set; } = string.Empty; // comma separated
        public bool Featured { get; set; }
        public string? Duration { get; set; }
    }
}

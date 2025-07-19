namespace Backend.Models
{
    public class ResearchItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public bool Verified { get; set; }
        public string Reliability { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string Citations { get; set; } = string.Empty; // comma separated
        public string Tags { get; set; } = string.Empty; // comma separated
    }
}

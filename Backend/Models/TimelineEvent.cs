namespace Backend.Models
{
    public class TimelineEvent
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
    }
}

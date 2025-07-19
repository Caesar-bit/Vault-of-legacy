using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<TimelineEvent> TimelineEvents => Set<TimelineEvent>();
        public DbSet<GalleryItem> GalleryItems => Set<GalleryItem>();
        public DbSet<Collection> Collections => Set<Collection>();
        public DbSet<ResearchItem> ResearchItems => Set<ResearchItem>();
    }
}

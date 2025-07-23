using Microsoft.EntityFrameworkCore;
using VaultBackend.Models;

namespace VaultBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<ApiKey> ApiKeys => Set<ApiKey>();
        public DbSet<UploadedFile> UploadedFiles => Set<UploadedFile>();
        public DbSet<FingerprintCredential> FingerprintCredentials => Set<FingerprintCredential>();
        public DbSet<FileStructure> FileStructures => Set<FileStructure>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
        public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
        public DbSet<UserData> UserData => Set<UserData>();
        public DbSet<Trustee> Trustees => Set<Trustee>();
        public DbSet<ReleaseSchedule> ReleaseSchedules => Set<ReleaseSchedule>();
    }
}

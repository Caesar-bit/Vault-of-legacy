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
    }
}

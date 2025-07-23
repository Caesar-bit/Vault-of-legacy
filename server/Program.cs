using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using VaultBackend.Data;
using VaultBackend.Services;
using VaultBackend.Hubs;
using VaultBackend.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddSingleton<FaqService>();
builder.Services.AddScoped<ActivityLogger>();
builder.Services.AddHttpClient();
builder.Services.AddSingleton<AiService>();
builder.Services.AddSingleton<SupportEscalationService>();
builder.Services.AddHostedService<ReleaseEngine>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Vault API", Version = "v1" });
});

var jwtKey = builder.Configuration["JwtKey"] ?? "0123456789ABCDEF0123456789ABCDEF";
var tokenService = new TokenService(jwtKey);
builder.Services.AddSingleton(tokenService);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = tokenService.GetValidationParameters();
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var connection = builder.Configuration.GetConnectionString("Default") ??
    $"Data Source={Path.Combine(builder.Environment.ContentRootPath, "vault.db")}";
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlite(connection));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // Ensure the Users table has the LastLogin and CreatedAt columns when
    // upgrading from older database versions where the columns might be missing.
    var conn = db.Database.GetDbConnection();
    conn.Open();
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = "PRAGMA table_info('Users');";
        using var reader = cmd.ExecuteReader();
        var hasLastLogin = false;
        var hasCreatedAt = false;
        var hasRole = false;
        var hasStatus = false;
        var hasAvatar = false;
        while (reader.Read())
        {
            var column = reader.GetString(1);
            if (column == "LastLogin")
            {
                hasLastLogin = true;
            }
            if (column == "CreatedAt")
            {
                hasCreatedAt = true;
            }
            if (column == "Role")
            {
                hasRole = true;
            }
            if (column == "Status")
            {
                hasStatus = true;
            }
            if (column == "Avatar")
            {
                hasAvatar = true;
            }
        }

        if (!hasLastLogin)
        {
            using var alter = conn.CreateCommand();
            alter.CommandText = "ALTER TABLE Users ADD COLUMN LastLogin TEXT;";
            alter.ExecuteNonQuery();
        }

        if (!hasCreatedAt)
        {
            using var alter = conn.CreateCommand();
            alter.CommandText = "ALTER TABLE Users ADD COLUMN CreatedAt TEXT;";
            alter.ExecuteNonQuery();
        }
        // Fill missing CreatedAt values to avoid null dereference issues
        using (var update = conn.CreateCommand())
        {
            update.CommandText = "UPDATE Users SET CreatedAt = datetime('now') WHERE CreatedAt IS NULL;";
            update.ExecuteNonQuery();
        }

        if (!hasRole)
        {
            using var alter = conn.CreateCommand();
            alter.CommandText = "ALTER TABLE Users ADD COLUMN Role TEXT DEFAULT 'user';";
            alter.ExecuteNonQuery();
        }

        if (!hasStatus)
        {
            using var alter = conn.CreateCommand();
            alter.CommandText = "ALTER TABLE Users ADD COLUMN Status TEXT DEFAULT 'active';";
            alter.ExecuteNonQuery();
        }

        if (!hasAvatar)
        {
            using var alter = conn.CreateCommand();
            alter.CommandText = "ALTER TABLE Users ADD COLUMN Avatar TEXT;";
            alter.ExecuteNonQuery();
        }
    }

    // Ensure FingerprintCredentials table exists for new fingerprint login feature
    using (var check = conn.CreateCommand())
    {
        check.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='FingerprintCredentials';";
        var exists = check.ExecuteScalar() != null;
        if (!exists)
        {
            using var create = conn.CreateCommand();
            create.CommandText = "CREATE TABLE FingerprintCredentials (Id TEXT PRIMARY KEY, UserId TEXT NOT NULL, CredentialId TEXT NOT NULL);";
            create.ExecuteNonQuery();
        }
    }

    // Ensure FileStructures table exists for storing vault files
    using (var check = conn.CreateCommand())
    {
        check.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='FileStructures';";
        var exists = check.ExecuteScalar() != null;
        if (!exists)
        {
            using var create = conn.CreateCommand();
            create.CommandText = "CREATE TABLE FileStructures (Id TEXT PRIMARY KEY, UserId TEXT NOT NULL, Data TEXT NOT NULL);";
            create.ExecuteNonQuery();
        }
        else
        {
            using var info = conn.CreateCommand();
            info.CommandText = "PRAGMA table_info('FileStructures');";
            using var reader = info.ExecuteReader();
            var hasUserId = false;
            while (reader.Read())
            {
                if (reader.GetString(1) == "UserId")
                {
                    hasUserId = true;
                }
            }
            if (!hasUserId)
            {
                using var alter = conn.CreateCommand();
                alter.CommandText = "ALTER TABLE FileStructures ADD COLUMN UserId TEXT;";
                alter.ExecuteNonQuery();
            }
        }
    }

    // Ensure UploadedFiles table has UserId column
    using (var info = conn.CreateCommand())
    {
        info.CommandText = "PRAGMA table_info('UploadedFiles');";
        using var reader = info.ExecuteReader();
        var hasUserId = false;
        while (reader.Read())
        {
            if (reader.GetString(1) == "UserId")
            {
                hasUserId = true;
            }
        }
        if (!hasUserId)
        {
            using var alter = conn.CreateCommand();
            alter.CommandText = "ALTER TABLE UploadedFiles ADD COLUMN UserId TEXT;";
            alter.ExecuteNonQuery();
        }
    }


    // Ensure ActivityLogs table exists
    using (var check = conn.CreateCommand())
    {
        check.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='ActivityLogs';";
        var exists = check.ExecuteScalar() != null;
        if (!exists)
        {
            using var create = conn.CreateCommand();
            create.CommandText = "CREATE TABLE ActivityLogs (Id TEXT PRIMARY KEY, UserId TEXT NOT NULL, Action TEXT NOT NULL, Item TEXT NOT NULL, Timestamp TEXT NOT NULL);";
            create.ExecuteNonQuery();
        }
    }

    // Ensure UserData table exists for storing user-specific data
    using (var check = conn.CreateCommand())
    {
        check.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='UserData';";
        var exists = check.ExecuteScalar() != null;
        if (!exists)
        {
            using var create = conn.CreateCommand();
            create.CommandText = "CREATE TABLE UserData (Id TEXT PRIMARY KEY, UserId TEXT NOT NULL, Type TEXT NOT NULL, Data TEXT NOT NULL);";
            create.ExecuteNonQuery();
        }
    }

    // Ensure ChatMessages table exists for chat history
    using (var check = conn.CreateCommand())
    {
        check.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='ChatMessages';";
        var exists = check.ExecuteScalar() != null;
        if (!exists)
        {
            using var create = conn.CreateCommand();
            create.CommandText = "CREATE TABLE ChatMessages (Id TEXT PRIMARY KEY, UserId TEXT NOT NULL, Content TEXT NOT NULL, Timestamp TEXT NOT NULL);";
            create.ExecuteNonQuery();
        }
    }

    // Ensure Trustees table exists
    using (var check = conn.CreateCommand())
    {
        check.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='Trustees';";
        var exists = check.ExecuteScalar() != null;
        if (!exists)
        {
            using var create = conn.CreateCommand();
            create.CommandText = "CREATE TABLE Trustees (Id TEXT PRIMARY KEY, UserId TEXT NOT NULL, Name TEXT NOT NULL, Email TEXT NOT NULL, Tier TEXT NOT NULL, Verified INTEGER NOT NULL, CreatedAt TEXT NOT NULL);";
            create.ExecuteNonQuery();
        }
    }

    // Ensure ReleaseSchedules table exists
    using (var check = conn.CreateCommand())
    {
        check.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='ReleaseSchedules';";
        var exists = check.ExecuteScalar() != null;
        if (!exists)
        {
            using var create = conn.CreateCommand();
            create.CommandText = "CREATE TABLE ReleaseSchedules (Id TEXT PRIMARY KEY, UserId TEXT NOT NULL, FilePath TEXT NOT NULL, ReleaseDate TEXT NOT NULL, TriggerEvent TEXT NOT NULL, BeneficiaryEmail TEXT, BeneficiaryId TEXT, RequiresApproval INTEGER NOT NULL, Released INTEGER NOT NULL, CreatedAt TEXT NOT NULL);";
            create.ExecuteNonQuery();
        }
        else
        {
            using var info = conn.CreateCommand();
            info.CommandText = "PRAGMA table_info('ReleaseSchedules');";
            using var reader = info.ExecuteReader();
            var hasBeneficiaryId = false;
            while (reader.Read())
            {
                if (reader.GetString(1) == "BeneficiaryId") hasBeneficiaryId = true;
            }
            if (!hasBeneficiaryId)
            {
                using var alter = conn.CreateCommand();
                alter.CommandText = "ALTER TABLE ReleaseSchedules ADD COLUMN BeneficiaryId TEXT;";
                alter.ExecuteNonQuery();
            }
        }
    }

    // Ensure Beneficiaries table exists
    using (var check = conn.CreateCommand())
    {
        check.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='Beneficiaries';";
        var exists = check.ExecuteScalar() != null;
        if (!exists)
        {
            using var create = conn.CreateCommand();
            create.CommandText = "CREATE TABLE Beneficiaries (Id TEXT PRIMARY KEY, UserId TEXT NOT NULL, Name TEXT NOT NULL, Email TEXT NOT NULL, Verified INTEGER NOT NULL, CreatedAt TEXT NOT NULL);";
            create.ExecuteNonQuery();
        }
    }

    conn.Close();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ActivityHub>("/hubs/activity");
app.MapHub<ChatHub>("/hubs/chat");

app.Run();

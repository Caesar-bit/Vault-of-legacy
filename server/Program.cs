using BCrypt.Net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtKey = builder.Configuration["JwtKey"] ?? "very_secret_key";
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

var users = new List<User>();
var apiKeys = new List<ApiKey>();
var files = new List<UploadedFile>();

string GenerateToken(User user)
{
    var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        claims: new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", user.Name)
        },
        expires: DateTime.UtcNow.AddHours(1),
        signingCredentials: creds);
    return new JwtSecurityTokenHandler().WriteToken(token);
}

app.MapPost("/api/auth/signup", (SignupRequest req) =>
{
    if (users.Any(u => u.Email == req.Email))
        return Results.BadRequest("Email already registered");

    var user = new User(Guid.NewGuid().ToString(), req.Email, req.Name, BCrypt.Net.BCrypt.HashPassword(req.Password));
    users.Add(user);
    var token = GenerateToken(user);
    return Results.Ok(new { user.Id, user.Email, user.Name, token });
});

app.MapPost("/api/auth/login", (LoginRequest req) =>
{
    var user = users.FirstOrDefault(u => u.Email == req.Email);
    if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        return Results.BadRequest("Invalid credentials");

    var token = GenerateToken(user);
    return Results.Ok(new { user.Id, user.Email, user.Name, token });
});

app.MapPost("/api/file/upload", async (HttpRequest http) =>
{
    if (!http.HasFormContentType) return Results.BadRequest("Invalid form");
    var form = await http.ReadFormAsync();
    var file = form.Files.FirstOrDefault();
    if (file == null) return Results.BadRequest("No file provided");

    var dir = Path.Combine(app.Environment.ContentRootPath, "UploadedFiles");
    Directory.CreateDirectory(dir);
    var filePath = Path.Combine(dir, Guid.NewGuid().ToString() + "_" + file.FileName);
    using var stream = File.OpenWrite(filePath);
    await file.CopyToAsync(stream);

    var uploaded = new UploadedFile(filePath, file.FileName);
    files.Add(uploaded);
    return Results.Ok(new { uploaded.Path, uploaded.OriginalName });
}).RequireAuthorization();

app.MapGet("/api/file/list", () => files.Select(f => new { f.Path, f.OriginalName })).RequireAuthorization();

app.MapGet("/api/apikey", () => apiKeys).RequireAuthorization();

app.MapPost("/api/apikey", (ApiKeyRequest request) =>
{
    var keyValue = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    var key = new ApiKey(
        Guid.NewGuid().ToString(),
        request.Name,
        keyValue,
        request.Permissions,
        DateTime.UtcNow,
        "active");
    apiKeys.Add(key);
    return Results.Ok(key);
}).RequireAuthorization();

app.MapDelete("/api/apikey/{id}", (string id) =>
{
    var key = apiKeys.FirstOrDefault(k => k.Id == id);
    if (key == null) return Results.NotFound();
    apiKeys.Remove(key);
    return Results.Ok();
}).RequireAuthorization();

app.MapPatch("/api/apikey/{id}/regenerate", (string id) =>
{
    var key = apiKeys.FirstOrDefault(k => k.Id == id);
    if (key == null) return Results.NotFound();
    var newValue = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    var updated = key with { Key = newValue };
    apiKeys.Remove(key);
    apiKeys.Add(updated);
    return Results.Ok(updated);
}).RequireAuthorization();

app.Run();

record User(string Id, string Email, string Name, string PasswordHash);
record SignupRequest(string Email, string Password, string Name);
record LoginRequest(string Email, string Password);
record ApiKey(string Id, string Name, string Key, string[] Permissions, DateTime Created, string Status, DateTime? LastUsed = null, int Requests = 0);
record ApiKeyRequest(string Name, string[] Permissions);
record UploadedFile(string Path, string OriginalName);

using BCrypt.Net;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

var users = new List<User>();
var apiKeys = new List<ApiKey>();
var files = new List<UploadedFile>();

app.MapPost("/api/auth/signup", (SignupRequest req) =>
{
    if (users.Any(u => u.Email == req.Email))
        return Results.BadRequest("Email already registered");

    var user = new User(Guid.NewGuid().ToString(), req.Email, req.Name, BCrypt.Net.BCrypt.HashPassword(req.Password));
    users.Add(user);
    return Results.Ok(new { user.Id, user.Email, user.Name });
});

app.MapPost("/api/auth/login", (LoginRequest req) =>
{
    var user = users.FirstOrDefault(u => u.Email == req.Email);
    if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        return Results.BadRequest("Invalid credentials");

    return Results.Ok(new { user.Id, user.Email, user.Name });
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
});

app.MapGet("/api/file/list", () => files.Select(f => new { f.Path, f.OriginalName }));

app.MapGet("/api/apikey", () => apiKeys);

app.MapPost("/api/apikey", (ApiKeyRequest request) =>
{
    var key = new ApiKey(Guid.NewGuid().ToString(), request.Name, request.Permissions);
    apiKeys.Add(key);
    return Results.Ok(key);
});

app.MapDelete("/api/apikey/{id}", (string id) =>
{
    var key = apiKeys.FirstOrDefault(k => k.Id == id);
    if (key == null) return Results.NotFound();
    apiKeys.Remove(key);
    return Results.Ok();
});

app.Run();

record User(string Id, string Email, string Name, string PasswordHash);
record SignupRequest(string Email, string Password, string Name);
record LoginRequest(string Email, string Password);
record ApiKey(string Id, string Name, string[] Permissions);
record ApiKeyRequest(string Name, string[] Permissions);
record UploadedFile(string Path, string OriginalName);

namespace VaultBackend.Models;

public record TrusteeRequest(string Name, string Email, string Tier);

public record UpdateTrusteeRequest(string? Name, string? Email, string? Tier);

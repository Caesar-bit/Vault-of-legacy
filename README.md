# Vault of Legacy

This project now includes a small ASP.NET Core backend located in the `server` directory.

## Running the backend

```bash
cd server
# build the project
 dotnet build
# run the API
 dotnet run
```

The API provides in-memory endpoints for user authentication, API key management and file uploads which the React frontend can call using the `/api` path.

During development the React dev server proxies `/api` requests to the ASP.NET backend running on port `5266`. If your backend runs on a different port set `VITE_API_URL` before starting `npm run dev`.

### Configuration

The backend issues JWT tokens for authenticated users. Configure the signing key through the `JwtKey` setting in `appsettings.json` or via environment variables.

# Vault of Legacy

This project now includes a full ASP.NET Core backend located in the `server` directory.

## Running the backend

```bash
cd server
# build the project
 dotnet build
# run the API
 dotnet run
```

The backend exposes RESTful endpoints for authentication, API key management and file uploads backed by a SQLite database. All routes are prefixed with `/api` and secured with JWT bearer authentication where appropriate.

During development the React dev server proxies `/api` requests to the ASP.NET backend running on port `5266`. If your backend runs on a different port set `VITE_API_URL` before starting `npm run dev`.

### Configuration

The backend issues JWT tokens for authenticated users. Configure the signing key through the `JwtKey` setting in `appsettings.json` (or via environment variables). **The value must be at least 32 characters long** to satisfy the security requirements of the token library. A connection string is also provided for the SQLite database in `ConnectionStrings:Default`.

### Translations endpoint

Localization files live under `server/Resources/Translations`. Each language is a JSON file (e.g. `en.json`). The API exposes `/api/translations/{lang}` to fetch the key/value pairs for a given language.

### API listing endpoint

Authenticated users can retrieve a list of available API routes via `/api/info/routes`. Each entry contains the HTTP method and path, which is useful for building dynamic API documentation in the frontend.

### Real-time support tickets

Clients can subscribe to ticket updates over SignalR at `/hubs/tickets`. Events `TicketCreated`, `TicketUpdated`, and `TicketDeleted` notify the relevant user (and admins) when their tickets change.

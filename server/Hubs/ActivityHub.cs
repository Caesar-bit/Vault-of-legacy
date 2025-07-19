using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace VaultBackend.Hubs
{
    [Authorize]
    public class ActivityHub : Hub
    {
    }
}

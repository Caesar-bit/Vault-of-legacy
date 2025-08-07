using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace VaultBackend.Hubs
{
    [Authorize]
    public class SupportTicketHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }
            var role = Context.User?.FindFirstValue(ClaimTypes.Role);
            if (role == "admin")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "admin");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }
            var role = Context.User?.FindFirstValue(ClaimTypes.Role);
            if (role == "admin")
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admin");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}

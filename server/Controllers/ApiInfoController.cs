using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/info")]
    public class ApiInfoController : ControllerBase
    {
        private readonly EndpointDataSource _endpointSource;

        public ApiInfoController(EndpointDataSource endpointSource)
        {
            _endpointSource = endpointSource;
        }

        [HttpGet("routes")]
        public IActionResult GetRoutes()
        {
            var routes = _endpointSource.Endpoints
                .OfType<RouteEndpoint>()
                .Where(e => e.RoutePattern?.RawText != null && e.RoutePattern.RawText.StartsWith("api"))
                .SelectMany(e =>
                    e.Metadata.OfType<HttpMethodMetadata>().SelectMany(meta =>
                        meta.HttpMethods.Select(m => new
                        {
                            method = m,
                            endpoint = "/" + e.RoutePattern.RawText
                        })))
                .Distinct()
                .OrderBy(r => r.endpoint)
                .ThenBy(r => r.method)
                .ToList();

            return Ok(routes);
        }
    }
}

using _3DSkypeServer.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace _3DSkypeServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ILogger<TestController> _logger;

        public TestController(ILogger<TestController> logger)
        {
            _logger = logger;
        }

        [Authorize]
        [HttpGet, Route("user")]
        public string GetUser() => "Successful response for Authorized user";

        [Authorize(Roles=UserRoles.Admin)]
        [HttpGet, Route("admin")]
        public string GetAdminUser() => "Successful response for Authorized Admin user";
    }
}

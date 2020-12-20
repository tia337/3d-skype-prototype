using _3DSkypeServer.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using Microsoft.AspNetCore.Cors;

namespace _3DSkypeServer.Controllers
{
  [EnableCors("AllowAny")]
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

    [Authorize]
    [HttpGet, Route("db")]
    public string GetDb() => Environment.GetEnvironmentVariable("DATABASE_URL");

    [Authorize(Roles = UserRoles.Admin)]
    [HttpGet, Route("admin")]
    public string GetAdminUser() => "Successful response for Authorized Admin user";
  }
}

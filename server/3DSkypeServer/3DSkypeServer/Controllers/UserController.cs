using System.Linq;
using Microsoft.AspNetCore.Mvc;
using _3DSkypeServer.Auth;
using _3DSkypeServer.Auth.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace _3DSkypeServer.Controllers
{
  [EnableCors("AllowAny")]
  [ApiController]
  [Route("api/[controller]")]
  public class UserController : ControllerBase
  {
    private readonly ILogger<UserController> _logger;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserController(ILogger<UserController> logger, UserManager<ApplicationUser> userManager)
    {
      _logger = logger;
      _userManager = userManager;
    }

    [Authorize]
    [HttpGet]
    public IActionResult GetUser([FromQuery] string emailAddress)
    {
      var user = _userManager.Users.FirstOrDefault(u => u.Email.Equals(emailAddress));

      if (user is null)
        return NotFound(emailAddress);

      return Ok(new UserSearchResult
      {
        Email = user.Email,
        Name = user.UserName,
        Id = user.Id
      });
    }
  }
}

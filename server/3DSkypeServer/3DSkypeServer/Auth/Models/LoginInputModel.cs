using System.ComponentModel.DataAnnotations;

namespace _3DSkypeServer.Auth.Models
{
  public class LoginInputModel
  {
    [Required(ErrorMessage = "Email is required")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; }
  }
}

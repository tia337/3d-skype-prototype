using System.ComponentModel.DataAnnotations;

namespace _3DSkypeServer.Auth.Models
{
  public class RegisterModel
  {
    [Required(ErrorMessage = "User Name is required")]
    public string Name { get; set; }

    [Required(ErrorMessage = "Email is required")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; }
  }
}

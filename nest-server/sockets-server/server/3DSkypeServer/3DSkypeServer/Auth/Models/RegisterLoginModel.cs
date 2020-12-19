using System.ComponentModel.DataAnnotations;

namespace _3DSkypeServer.Auth.Models
{
    public class RegisterLoginModel
    {

        [Required(ErrorMessage = "User Name is required")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Project_C.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        
        [HttpGet, Authorize]
        public async Task<ActionResult<GetUserDto>> GetCurrentUser()
        {
            var response = await _authService.GetCurrentUser();
            if (response == null) return BadRequest(new {message = "Invalid credentials"});
            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserLoginDto>> Register(UserRegistrationDto request)
        {
            var response = await _authService.Register(request);
            if (response == null) return BadRequest(new {message = "Email already exists"});
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserLoginDto request)
        {
            var response = await _authService.Login(request);
            if (response == null) return BadRequest(new {message = "Invalid credentials"});
            return Ok(response);
        }
    }
}
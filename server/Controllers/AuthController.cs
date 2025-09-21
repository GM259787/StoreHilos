using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.DTOs;
using Server.Services;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var response = await _authService.LoginAsync(loginDto);
            return Ok(response);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Credenciales inválidas" });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            var response = await _authService.RegisterAsync(registerDto);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponseDto>> GoogleAuth([FromBody] GoogleAuthDto googleAuthDto)
    {
        try
        {
            var response = await _authService.GoogleAuthAsync(googleAuthDto);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _authService.GetUserAsync(userId);
            return Ok(user);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Usuario no encontrado" });
        }
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<UserDto>> UpdateCurrentUser([FromBody] UserDto userDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _authService.UpdateUserAsync(userId, userDto);
            return Ok(user);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Usuario no encontrado" });
        }
    }

    [Authorize]
    [HttpPut("shipping-info")]
    public async Task<ActionResult<UserDto>> UpdateShippingInfo([FromBody] UpdateShippingInfoDto shippingInfoDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _authService.UpdateShippingInfoAsync(userId, shippingInfoDto);
            return Ok(user);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Usuario no encontrado" });
        }
    }

    [HttpPost("google-callback")]
    public async Task<ActionResult<AuthResponseDto>> GoogleCallback([FromBody] GoogleCallbackDto callbackDto)
    {
        try
        {
            var response = await _authService.GoogleCallbackAsync(callbackDto);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        try
        {
            var result = await _authService.ForgotPasswordAsync(forgotPasswordDto.Email);
            if (result)
            {
                return Ok(new { message = "Si el email existe, se ha enviado un enlace de recuperación" });
            }
            return BadRequest(new { message = "Error al procesar la solicitud" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        try
        {
            var result = await _authService.ResetPasswordAsync(resetPasswordDto.Token, resetPasswordDto.NewPassword);
            if (result)
            {
                return Ok(new { message = "Contraseña restablecida exitosamente" });
            }
            return BadRequest(new { message = "Token inválido o expirado" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

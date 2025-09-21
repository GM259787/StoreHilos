using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Services;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> GoogleAuthAsync(GoogleAuthDto googleAuthDto);
    Task<AuthResponseDto> GoogleCallbackAsync(GoogleCallbackDto callbackDto);
    Task<UserDto> GetUserAsync(int userId);
    Task<UserDto> UpdateUserAsync(int userId, UserDto userDto);
    Task<UserDto> UpdateShippingInfoAsync(int userId, UpdateShippingInfoDto shippingInfoDto);
    Task<bool> ForgotPasswordAsync(string email);
    Task<bool> ResetPasswordAsync(string token, string newPassword);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public AuthService(AppDbContext context, IConfiguration configuration, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == loginDto.Email && u.IsActive);

        if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // Verificar si el email ya existe
        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
        {
            throw new InvalidOperationException("El email ya está registrado");
        }

        // Obtener el rol Customer por defecto
        var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
        if (customerRole == null)
        {
            throw new InvalidOperationException("No se encontró el rol Customer");
        }

        var user = new User
        {
            Email = registerDto.Email,
            PasswordHash = HashPassword(registerDto.Password),
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Phone = registerDto.Phone,
            EmailConfirmed = false, // Requeriría confirmación por email
            IsActive = true,
            RoleId = customerRole.Id
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Recargar el usuario con el rol
        await _context.Entry(user).Reference(u => u.Role).LoadAsync();

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> GoogleAuthAsync(GoogleAuthDto googleAuthDto)
    {
        // En producción, validar el token con Google
        // Por ahora, asumimos que el token es válido
        
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == googleAuthDto.Email);

        if (user == null)
        {
            // Obtener el rol Customer por defecto
            var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
            if (customerRole == null)
            {
                throw new InvalidOperationException("No se encontró el rol Customer");
            }

            // Crear nuevo usuario
            user = new User
            {
                Email = googleAuthDto.Email,
                FirstName = googleAuthDto.FirstName,
                LastName = googleAuthDto.LastName,
                GooglePicture = googleAuthDto.Picture,
                EmailConfirmed = true, // Google ya verificó el email
                IsActive = true,
                RoleId = customerRole.Id
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            // Recargar el usuario con el rol
            await _context.Entry(user).Reference(u => u.Role).LoadAsync();
        }
        else
        {
            // Actualizar información del usuario existente
            user.FirstName = googleAuthDto.FirstName;
            user.LastName = googleAuthDto.LastName;
            user.GooglePicture = googleAuthDto.Picture;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<UserDto> GetUserAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user == null)
            throw new UnauthorizedAccessException("Usuario no encontrado");

        return MapToUserDto(user);
    }

    public async Task<UserDto> UpdateUserAsync(int userId, UserDto userDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user == null)
            throw new UnauthorizedAccessException("Usuario no encontrado");

        user.FirstName = userDto.FirstName;
        user.LastName = userDto.LastName;
        user.Phone = userDto.Phone;
        user.Address = userDto.Address;
        user.City = userDto.City;
        user.PostalCode = userDto.PostalCode;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToUserDto(user);
    }

    public async Task<UserDto> UpdateShippingInfoAsync(int userId, UpdateShippingInfoDto shippingInfoDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user == null)
            throw new UnauthorizedAccessException("Usuario no encontrado");

        user.ShippingPhone = shippingInfoDto.ShippingPhone;
        user.ShippingAddress = shippingInfoDto.ShippingAddress;
        user.ShippingCity = shippingInfoDto.ShippingCity;
        user.ShippingPostalCode = shippingInfoDto.ShippingPostalCode;
        user.ShippingInstructions = shippingInfoDto.ShippingInstructions;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToUserDto(user);
    }

    public async Task<AuthResponseDto> GoogleCallbackAsync(GoogleCallbackDto callbackDto)
    {
        try
        {
            // Intercambiar código por token
            var tokenResponse = await ExchangeCodeForTokenAsync(callbackDto.Code, callbackDto.RedirectUri);
            
            // Obtener información del usuario
            var userInfo = await GetUserInfoFromGoogleAsync(tokenResponse.AccessToken);
            
            // Crear DTO para Google Auth
            var googleAuthDto = new GoogleAuthDto
            {
                IdToken = tokenResponse.IdToken,
                Email = userInfo.Email,
                FirstName = userInfo.GivenName,
                LastName = userInfo.FamilyName,
                Picture = userInfo.Picture
            };
            
            // Usar el método existente de Google Auth
            return await GoogleAuthAsync(googleAuthDto);
        }
        catch (Exception ex)
        {
            throw new Exception($"Error en callback de Google: {ex.Message}");
        }
    }

    private async Task<dynamic> ExchangeCodeForTokenAsync(string code, string redirectUri)
    {
        using var httpClient = new HttpClient();
        
        var requestBody = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("client_id", "1090797777834-161rou9sg4j103lh8f68052kmu6kv493.apps.googleusercontent.com"),
            new KeyValuePair<string, string>("client_secret", "GOCSPX-your-client-secret-here"), // Necesitas configurar esto
            new KeyValuePair<string, string>("code", code),
            new KeyValuePair<string, string>("grant_type", "authorization_code"),
            new KeyValuePair<string, string>("redirect_uri", redirectUri)
        });

        var response = await httpClient.PostAsync("https://oauth2.googleapis.com/token", requestBody);
        var content = await response.Content.ReadAsStringAsync();
        
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Error al intercambiar código: {content}");
        }

        return System.Text.Json.JsonSerializer.Deserialize<dynamic>(content);
    }

    private async Task<dynamic> GetUserInfoFromGoogleAsync(string accessToken)
    {
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
        
        var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
        var content = await response.Content.ReadAsStringAsync();
        
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Error al obtener información del usuario: {content}");
        }

        return System.Text.Json.JsonSerializer.Deserialize<dynamic>(content);
    }

    private async Task<AuthResponseDto> GenerateAuthResponseAsync(User user)
    {
        var token = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddDays(7); // Token válido por 7 días

        return new AuthResponseDto
        {
            Token = token,
            User = MapToUserDto(user),
            ExpiresAt = expiresAt
        };
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "your-super-secret-key-with-at-least-32-characters"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.GivenName, user.FirstName),
            new Claim(ClaimTypes.Surname, user.LastName)
        };

        // Agregar el rol del usuario al token
        if (user.Role != null)
        {
            claims.Add(new Claim(ClaimTypes.Role, user.Role.Name));
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "your-app",
            audience: _configuration["Jwt:Audience"] ?? "your-app",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private bool VerifyPassword(string password, string? hash)
    {
        if (string.IsNullOrEmpty(hash)) return false;
        return HashPassword(password) == hash;
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Phone = user.Phone,
            Address = user.Address,
            City = user.City,
            PostalCode = user.PostalCode,
            GooglePicture = user.GooglePicture,
            EmailConfirmed = user.EmailConfirmed,
            Role = user.Role?.Name ?? "Customer",
            ShippingPhone = user.ShippingPhone,
            ShippingAddress = user.ShippingAddress,
            ShippingCity = user.ShippingCity,
            ShippingPostalCode = user.ShippingPostalCode,
            ShippingInstructions = user.ShippingInstructions
        };
    }

    public async Task<bool> ForgotPasswordAsync(string email)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                // Por seguridad, no revelamos si el email existe o no
                return true;
            }

            // Invalidar tokens anteriores
            var existingTokens = await _context.PasswordResetTokens
                .Where(t => t.Email == email && !t.IsUsed)
                .ToListAsync();
            
            foreach (var token in existingTokens)
            {
                token.IsUsed = true;
                token.UsedAt = DateTime.UtcNow;
            }

            // Crear nuevo token
            var resetToken = Guid.NewGuid().ToString();
            var passwordResetToken = new PasswordResetToken
            {
                Token = resetToken,
                Email = email,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1) // Token válido por 1 hora
            };

            _context.PasswordResetTokens.Add(passwordResetToken);
            await _context.SaveChangesAsync();

            // Enviar email
            await _emailService.SendPasswordResetEmailAsync(email, resetToken, $"{user.FirstName} {user.LastName}");

            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword)
    {
        try
        {
            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == token && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow);

            if (resetToken == null)
            {
                return false; // Token inválido o expirado
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == resetToken.Email);
            if (user == null)
            {
                return false;
            }

            // Actualizar contraseña
            user.PasswordHash = HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;

            // Marcar token como usado
            resetToken.IsUsed = true;
            resetToken.UsedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }
}

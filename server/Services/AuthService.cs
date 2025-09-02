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
    Task<UserDto> GetUserAsync(int userId);
    Task<UserDto> UpdateUserAsync(int userId, UserDto userDto);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
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
            Role = user.Role?.Name ?? "Customer"
        };
    }
}

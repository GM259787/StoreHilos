using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Server.Data;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Agregar servicios básicos
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Agregar Memory Cache
builder.Services.AddMemoryCache();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configurar Entity Framework con SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// Configurar JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "your-super-secret-key-with-at-least-32-characters");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

// Configurar Authorization
builder.Services.AddAuthorization();

// Registrar servicios
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHttpClient<MercadoPagoService>();

var app = builder.Build();

// Configurar Swagger en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Usar CORS
app.UseCors("AllowFrontend");

// Usar Authentication y Authorization
app.UseAuthentication();
app.UseAuthorization();

// Servir archivos estáticos (imágenes, CSS, JS, etc.)
app.UseStaticFiles();

// Mapear controladores
app.MapControllers();

// Endpoint de prueba simple
app.MapGet("/test", () => "Hello World!");

// Endpoint de health
app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow });

// Migrar base de datos
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();
    
    // Seed de datos
    await Seed.SeedDataAsync(context);
}

app.Run();

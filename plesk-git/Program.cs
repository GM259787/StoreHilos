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

// Configurar Entity Framework - MySQL para desarrollo local, PostgreSQL para Docker
var connectionString = builder.Configuration.GetConnectionString("Default");
if (connectionString.Contains("Host=db"))
{
    // PostgreSQL para Docker
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    // MySQL para desarrollo local y producción
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
}

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

// Migrar base de datos solo si es necesario
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    try
    {
        // Verificar si la base de datos existe y tiene tablas
        var pendingMigrations = context.Database.GetPendingMigrations().ToList();
        
        if (pendingMigrations.Any())
        {
            Console.WriteLine($"Aplicando {pendingMigrations.Count} migraciones pendientes...");
            context.Database.Migrate();
            Console.WriteLine("Migraciones aplicadas exitosamente.");
        }
        else
        {
            Console.WriteLine("Base de datos está actualizada, no se requieren migraciones.");
        }
    }
    catch (Exception ex) when (ex.Message.Contains("already exists"))
    {
        Console.WriteLine("⚠️  Las tablas ya existen, creando tabla de migraciones manualmente...");
        
        // Crear la tabla de migraciones si no existe
        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
                    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
                    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
                    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
                ) CHARACTER SET=utf8mb4;
            ");
            
            // Insertar la migración actual
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) 
                VALUES ('20250913045827_InitialCreate', '8.0.4');
            ");
            
            Console.WriteLine("✅ Tabla de migraciones creada y configurada.");
        }
        catch (Exception migrationEx)
        {
            Console.WriteLine($"❌ Error configurando migraciones: {migrationEx.Message}");
        }
    }
    
    // Verificar si ya hay datos en la base de datos
    try
    {
        var hasCategories = await context.Categories.AnyAsync();
        var hasRoles = await context.Roles.AnyAsync();
        
        if (!hasCategories || !hasRoles)
        {
            Console.WriteLine("Inicializando datos de la base de datos...");
            await Seed.SeedDataAsync(context);
            Console.WriteLine("Datos inicializados exitosamente.");
        }
        else
        {
            Console.WriteLine("Base de datos ya contiene datos, omitiendo inicialización.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️  Error verificando datos: {ex.Message}");
        Console.WriteLine("Continuando sin inicializar datos...");
    }
}

app.Run();

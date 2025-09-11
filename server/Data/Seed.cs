using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public static class Seed
{
    public static async Task SeedDataAsync(AppDbContext context)
    {
        // En desarrollo, siempre cargar datos de ejemplo
        // Limpiar datos existentes primero (en orden correcto para evitar restricciones de FK)
        
        // Deshabilitar temporalmente las restricciones de FK
        await context.Database.ExecuteSqlRawAsync("PRAGMA foreign_keys = OFF;");
        
        try
        {
            context.CartItems.RemoveRange(context.CartItems);
            context.ShoppingCarts.RemoveRange(context.ShoppingCarts);
            context.OrderItems.RemoveRange(context.OrderItems);
            context.Orders.RemoveRange(context.Orders);
            context.Products.RemoveRange(context.Products);
            context.Users.RemoveRange(context.Users);
            context.Roles.RemoveRange(context.Roles);
            context.Categories.RemoveRange(context.Categories);
            await context.SaveChangesAsync();
        }
        finally
        {
            // Rehabilitar las restricciones de FK
            await context.Database.ExecuteSqlRawAsync("PRAGMA foreign_keys = ON;");
        }

        // Crear categorías de hilos por milimetraje
        var categories = new List<Category>
        {
            new Category { Name = "Hilo 0.6mm - Fantasía", Slug = "hilo-06mm-fantasia" },
            new Category { Name = "Hilo 0.8mm - Estándar", Slug = "hilo-08mm-estandar" },
            new Category { Name = "Hilo 1.0mm - Grueso", Slug = "hilo-10mm-grueso" },
            new Category { Name = "Hilo 1.2mm - Extra Grueso", Slug = "hilo-12mm-extra-grueso" },
            new Category { Name = "Hilo 1.5mm - Industrial", Slug = "hilo-15mm-industrial" }
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();

        // Crear roles
        var roles = new List<Role>
        {
            new Role { Name = "Customer", Description = "Cliente regular" },
            new Role { Name = "Armador", Description = "Usuario que arma los pedidos" },
            new Role { Name = "Cobrador", Description = "Usuario que maneja los pagos" }
        };

        await context.Roles.AddRangeAsync(roles);
        await context.SaveChangesAsync();

        // Crear 10 productos de hilos con especificaciones realistas
        var products = new List<Product>
        {
            // Hilos Fantasía 0.6mm - Categoría 0
            new Product { 
                Name = "Hilo Fantasía 610m - Branco e Mostarda", 
                Description = "Hilo de fantasía de 610 metros, grosor 0.6mm, color blanco y mostaza. Ideal para bordados decorativos, costura fina y proyectos artesanales. Material: 100% poliéster con acabado brillante.", 
                ImageUrl = "/data/Hilos/Fantasia 610m nº6 5023 Branco e Mostarda.jpg", 
                Stock = 25, 
                Price = 12.99m, 
                CategoryId = categories[0].Id 
            },
            new Product { 
                Name = "Hilo Fantasía 610m - Branco e Vermelho", 
                Description = "Hilo de fantasía de 610 metros, grosor 0.6mm, color blanco y rojo. Perfecto para proyectos festivos, bordados patrióticos y costura decorativa. Material: 100% poliéster premium.", 
                ImageUrl = "/data/Hilos/Fantasia 610m nº6 5003 Branco e Vermelho.jpg", 
                Stock = 30, 
                Price = 12.99m, 
                CategoryId = categories[0].Id 
            },
            new Product { 
                Name = "Hilo Fantasía 610m - Branco e Verde Bandeira", 
                Description = "Hilo de fantasía de 610 metros, grosor 0.6mm, color blanco y verde bandera. Ideal para proyectos patrióticos, bordados nacionales y costura especial. Material: 100% poliéster.", 
                ImageUrl = "/data/Hilos/Fantasia 610m nº6 5025 Branco e Verde Bandeira.jpg", 
                Stock = 22, 
                Price = 12.99m, 
                CategoryId = categories[0].Id 
            },
            
            // Hilos Estándar 0.8mm - Categoría 1
            new Product { 
                Name = "Hilo EuroRoma 600g - Edição Limitada Citrus", 
                Description = "Hilo EuroRoma de 600 gramos, grosor 0.8mm, edición limitada en color cítrico. Ideal para costura general, bordados y proyectos que requieren resistencia. Material: 100% algodón mercerizado.", 
                ImageUrl = "/data/Hilos/EuroRoma 600g - Edição Limitada 821 Citrus.jpg", 
                Stock = 15, 
                Price = 18.99m, 
                CategoryId = categories[1].Id 
            },
            new Product { 
                Name = "Hilo 660 - Verde Fluorescente", 
                Description = "Hilo de 660 metros, grosor 0.8mm, color verde fluorescente. Perfecto para costura deportiva, uniformes de seguridad y proyectos que requieren alta visibilidad. Material: 100% poliéster.", 
                ImageUrl = "/data/Hilos/660_820 Verde Fluorescente - EuroRoma 600g Edição Limitada.jpg", 
                Stock = 20, 
                Price = 9.99m, 
                CategoryId = categories[1].Id 
            },
            new Product { 
                Name = "Hilo 660 - Verde Bandeira", 
                Description = "Hilo de 660 metros, grosor 0.8mm, color verde bandera. Ideal para costura general, bordados y proyectos patrióticos. Material: 100% algodón mercerizado.", 
                ImageUrl = "/data/Hilos/660_803 - Verde Bandeira.jpg", 
                Stock = 18, 
                Price = 9.99m, 
                CategoryId = categories[1].Id 
            },
            
            // Hilos Gruesos 1.0mm - Categoría 2
            new Product { 
                Name = "Hilo 650 - Azul Royal", 
                Description = "Hilo de 650 metros, grosor 1.0mm, color azul royal. Perfecto para costura de telas gruesas, jeans, lonas y proyectos que requieren hilo resistente. Material: 100% algodón.", 
                ImageUrl = "/data/Hilos/650_804_01.jpg", 
                Stock = 25, 
                Price = 11.99m, 
                CategoryId = categories[2].Id 
            },
            new Product { 
                Name = "Hilo 650 - Marrom", 
                Description = "Hilo de 650 metros, grosor 1.0mm, color marrón. Ideal para costura de cuero, telas oscuras y proyectos que requieren hilo grueso y resistente. Material: 100% algodón.", 
                ImageUrl = "/data/Hilos/650_801_01.jpg", 
                Stock = 20, 
                Price = 11.99m, 
                CategoryId = categories[2].Id 
            },
            
            // Hilos Extra Gruesos 1.2mm - Categoría 3
            new Product { 
                Name = "Hilo 650 - Preto", 
                Description = "Hilo de 650 metros, grosor 1.2mm, color negro. Perfecto para costura de cuero, lonas pesadas, mochilas y proyectos que requieren máxima resistencia. Material: 100% algodón.", 
                ImageUrl = "/data/Hilos/650_800_01.jpg", 
                Stock = 15, 
                Price = 13.99m, 
                CategoryId = categories[3].Id 
            },
            
            // Hilos Industriales 1.5mm - Categoría 4
            new Product { 
                Name = "Hilo 650 - Branco", 
                Description = "Hilo de 650 metros, grosor 1.5mm, color blanco. Hilo industrial para costura de lonas pesadas, toldos, carpas y proyectos que requieren máxima resistencia y durabilidad. Material: 100% poliéster.", 
                ImageUrl = "/data/Hilos/650_710_01.jpg", 
                Stock = 12, 
                Price = 15.99m, 
                CategoryId = categories[4].Id 
            }
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

                // Crear usuarios de prueba
        var testUsers = new List<User>
        {
            new User
            {
                Email = "test@example.com",
                PasswordHash = "75K3eLr+dx6JJFuJ7LwIpEpOFmwGZZkRiB84PURz6U8=", // "password123"
                FirstName = "Usuario",
                LastName = "Prueba",
                Phone = "+598 99 000 000",
                EmailConfirmed = true,
                IsActive = true,
                RoleId = roles[0].Id // Customer
            },
            new User
            {
                Email = "armador@example.com",
                PasswordHash = "75K3eLr+dx6JJFuJ7LwIpEpOFmwGZZkRiB84PURz6U8=", // "password123"
                FirstName = "Armador",
                LastName = "Sistema",
                Phone = "+598 99 000 001",
                EmailConfirmed = true,
                IsActive = true,
                RoleId = roles[1].Id // Armador
            },
            new User
            {
                Email = "cobrador@example.com",
                PasswordHash = "75K3eLr+dx6JJFuJ7LwIpEpOFmwGZZkRiB84PURz6U8=", // "password123"
                FirstName = "Cobrador",
                LastName = "Sistema",
                Phone = "+598 99 000 002",
                EmailConfirmed = true,
                IsActive = true,
                RoleId = roles[2].Id // Cobrador
            }
        };

        foreach (var user in testUsers)
        {
            if (!await context.Users.AnyAsync(u => u.Email == user.Email))
            {
                context.Users.Add(user);
            }
        }
        await context.SaveChangesAsync();
    }
}

using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public static class Seed
{
    public static async Task SeedDataAsync(AppDbContext context, string environmentName)
    {
        // SEGURIDAD: NUNCA ejecutar seed en producción
        if (environmentName == "Production")
        {
            Console.WriteLine("⛔ SEED BLOQUEADO: No se permite ejecutar seed en producción.");
            return;
        }

        Console.WriteLine($"🌱 Iniciando seed de datos en entorno: {environmentName}");
        Console.WriteLine("⚠️  ADVERTENCIA: Esto solo debe ejecutarse en desarrollo local.");
        
        // NUNCA eliminar datos existentes - solo agregar lo que falta
        // Esto protege los datos de usuarios, carritos, órdenes, etc.

        // Crear categorías solo si no existen
        var categoriesToAdd = new List<(string Name, string Slug)>
        {
            ("Hilo 0.6mm - Fantasía", "hilo-06mm-fantasia"),
            ("Hilo 0.8mm - Estándar", "hilo-08mm-estandar"),
            ("Hilo 1.0mm - Grueso", "hilo-10mm-grueso"),
            ("Hilo 1.2mm - Extra Grueso", "hilo-12mm-extra-grueso"),
            ("Hilo 1.5mm - Industrial", "hilo-15mm-industrial")
        };

        var categories = new List<Category>();
        foreach (var (name, slug) in categoriesToAdd)
        {
            var existingCategory = await context.Categories.FirstOrDefaultAsync(c => c.Slug == slug);
            if (existingCategory == null)
            {
                var newCategory = new Category { Name = name, Slug = slug };
                context.Categories.Add(newCategory);
                categories.Add(newCategory);
                Console.WriteLine($"  ✅ Categoría creada: {name}");
            }
            else
            {
                categories.Add(existingCategory);
                Console.WriteLine($"  ⏭️  Categoría existente: {name}");
            }
        }
        await context.SaveChangesAsync();

        // Crear roles solo si no existen
        var rolesToAdd = new List<(string Name, string Description)>
        {
            ("Customer", "Cliente regular"),
            ("Armador", "Usuario que arma los pedidos"),
            ("Cobrador", "Usuario que maneja los pagos")
        };

        var roles = new List<Role>();
        foreach (var (name, description) in rolesToAdd)
        {
            var existingRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == name);
            if (existingRole == null)
            {
                var newRole = new Role { Name = name, Description = description };
                context.Roles.Add(newRole);
                roles.Add(newRole);
                Console.WriteLine($"  ✅ Rol creado: {name}");
            }
            else
            {
                roles.Add(existingRole);
                Console.WriteLine($"  ⏭️  Rol existente: {name}");
            }
        }
        await context.SaveChangesAsync();

        // Crear productos solo si no existen (verificar por ImageUrl como identificador único)
        var productsToAdd = new List<Product>
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

        // Agregar productos solo si no existen (verificar por ImageUrl)
        int productsAdded = 0;
        foreach (var product in productsToAdd)
        {
            var existingProduct = await context.Products.FirstOrDefaultAsync(p => p.ImageUrl == product.ImageUrl);
            if (existingProduct == null)
            {
                context.Products.Add(product);
                productsAdded++;
            }
        }
        
        if (productsAdded > 0)
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"  ✅ {productsAdded} productos creados");
        }
        else
        {
            Console.WriteLine($"  ⏭️  Todos los productos ya existen");
        }

        // Crear usuarios de prueba solo si no existen
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

        int usersAdded = 0;
        foreach (var user in testUsers)
        {
            if (!await context.Users.AnyAsync(u => u.Email == user.Email))
            {
                context.Users.Add(user);
                usersAdded++;
                Console.WriteLine($"  ✅ Usuario creado: {user.Email}");
            }
            else
            {
                Console.WriteLine($"  ⏭️  Usuario existente: {user.Email}");
            }
        }
        
        if (usersAdded > 0)
        {
            await context.SaveChangesAsync();
        }

        Console.WriteLine("🌱 Seed completado exitosamente.");
    }
}

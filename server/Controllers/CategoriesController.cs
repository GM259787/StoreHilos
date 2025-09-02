using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache;

    public CategoriesController(AppDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    [HttpGet("test")]
    public ActionResult<string> Test()
    {
        return Ok("CategoriesController está funcionando!");
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        const string cacheKey = "categories_all";
        
        if (_cache.TryGetValue(cacheKey, out List<CategoryDto>? cachedCategories))
        {
            return Ok(cachedCategories);
        }

        var categories = await _context.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug
            })
            .ToListAsync();

        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
        
        _cache.Set(cacheKey, categories, cacheOptions);

        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound(new { message = "Categoría no encontrada" });
        }

        var categoryDto = new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug
        };

        return Ok(categoryDto);
    }

    [HttpPost]
    [Authorize(Roles = "Cobrador")]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto createCategoryDto)
    {
        try
        {
            // Log de debug
            Console.WriteLine($"CreateCategory llamado con: Name={createCategoryDto.Name}, Slug={createCategoryDto.Slug}");
            
            // Verificar si ya existe una categoría con el mismo nombre o slug
            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name.ToLower() == createCategoryDto.Name.ToLower() || 
                                        c.Slug.ToLower() == createCategoryDto.Slug.ToLower());

            if (existingCategory != null)
            {
                Console.WriteLine($"Categoría existente encontrada: {existingCategory.Name}");
                return BadRequest(new { message = "Ya existe una categoría con ese nombre o slug" });
            }

            var category = new Category
            {
                Name = createCategoryDto.Name.Trim(),
                Slug = createCategoryDto.Slug.Trim().ToLower()
            };

            Console.WriteLine($"Creando nueva categoría: {category.Name}, {category.Slug}");

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            Console.WriteLine($"Categoría creada exitosamente con ID: {category.Id}");

            // Limpiar cache
            _cache.Remove("categories_all");

            var categoryDto = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug
            };

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryDto);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en CreateCategory: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return StatusCode(500, new { message = $"Error interno del servidor: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, [FromBody] UpdateCategoryDto updateCategoryDto)
    {
        try
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound(new { message = "Categoría no encontrada" });
            }

            // Verificar si ya existe otra categoría con el mismo nombre o slug
            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id != id && 
                                        (c.Name.ToLower() == updateCategoryDto.Name.ToLower() || 
                                         c.Slug.ToLower() == updateCategoryDto.Slug.ToLower()));

            if (existingCategory != null)
            {
                return BadRequest(new { message = "Ya existe otra categoría con ese nombre o slug" });
            }

            category.Name = updateCategoryDto.Name.Trim();
            category.Slug = updateCategoryDto.Slug.Trim().ToLower();

            await _context.SaveChangesAsync();

            // Limpiar cache
            _cache.Remove("categories_all");

            var categoryDto = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug
            };

            return Ok(categoryDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error interno del servidor: {ex.Message}" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Cobrador")]
    public async Task<ActionResult> DeleteCategory(int id)
    {
        try
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new { message = "Categoría no encontrada" });
            }

            // Verificar si la categoría tiene productos asociados
            if (category.Products.Any())
            {
                return BadRequest(new { message = "No se puede eliminar una categoría que tiene productos asociados" });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            // Limpiar cache
            _cache.Remove("categories_all");

            return Ok(new { message = "Categoría eliminada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error interno del servidor: {ex.Message}" });
        }
    }
}

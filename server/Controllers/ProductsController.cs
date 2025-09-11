using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts(
        [FromQuery] int? categoryId = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? sort = null)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .AsQueryable();

        // Filtrar por categoría
        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId);
        }

        // Buscar por nombre o descripción
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));
        }

        // Ordenar
        query = sort switch
        {
            "name" => query.OrderBy(p => p.Name),
            "-name" => query.OrderByDescending(p => p.Name),
            "price" => query.OrderBy(p => p.Price),
            "-price" => query.OrderByDescending(p => p.Price),
            _ => query.OrderBy(p => p.Name)
        };

        var total = await query.CountAsync();
        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                Stock = p.Stock,
                ReservedStock = p.ReservedStock,
                AvailableStock = p.Stock - p.ReservedStock,
                Price = p.Price,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            })
            .ToListAsync();

        return Ok(new PagedResult<ProductDto>
        {
            Items = products,
            Total = total,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        return Ok(new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            ImageUrl = product.ImageUrl,
            Stock = product.Stock,
            ReservedStock = product.ReservedStock,
            AvailableStock = product.AvailableStock,
            Price = product.Price,
            CategoryId = product.CategoryId,
            CategoryName = product.Category.Name
        });
    }

    [HttpPost]
    [Authorize(Roles = "Cobrador")]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
    {
        try
        {
            // Validar que la categoría existe
            var category = await _context.Categories.FindAsync(createProductDto.CategoryId);
            if (category == null)
            {
                return BadRequest(new { message = "La categoría especificada no existe" });
            }

            // Validar datos del producto
            if (createProductDto.Stock < 0)
            {
                return BadRequest(new { message = "El stock no puede ser negativo" });
            }

            if (createProductDto.Price <= 0)
            {
                return BadRequest(new { message = "El precio debe ser mayor a 0" });
            }

            var product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                ImageUrl = createProductDto.ImageUrl,
                Stock = createProductDto.Stock,
                Price = createProductDto.Price,
                CategoryId = createProductDto.CategoryId
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                Stock = product.Stock,
                ReservedStock = product.ReservedStock,
                AvailableStock = product.AvailableStock,
                Price = product.Price,
                CategoryId = product.CategoryId,
                CategoryName = category.Name
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error interno del servidor: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Cobrador")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] UpdateProductDto updateProductDto)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Producto no encontrado" });
            }

            // Validar que la categoría existe si se está cambiando
            if (updateProductDto.CategoryId.HasValue)
            {
                var category = await _context.Categories.FindAsync(updateProductDto.CategoryId.Value);
                if (category == null)
                {
                    return BadRequest(new { message = "La categoría especificada no existe" });
                }
                product.CategoryId = updateProductDto.CategoryId.Value;
            }

            // Actualizar campos si se proporcionan
            if (!string.IsNullOrEmpty(updateProductDto.Name))
                product.Name = updateProductDto.Name;

            if (updateProductDto.Description != null)
                product.Description = updateProductDto.Description;

            if (!string.IsNullOrEmpty(updateProductDto.ImageUrl))
                product.ImageUrl = updateProductDto.ImageUrl;

            if (updateProductDto.Stock.HasValue)
            {
                if (updateProductDto.Stock.Value < 0)
                    return BadRequest(new { message = "El stock no puede ser negativo" });
                product.Stock = updateProductDto.Stock.Value;
            }

            if (updateProductDto.Price.HasValue)
            {
                if (updateProductDto.Price.Value <= 0)
                    return BadRequest(new { message = "El precio debe ser mayor a 0" });
                product.Price = updateProductDto.Price.Value;
            }

            await _context.SaveChangesAsync();

            // Obtener la categoría actualizada para la respuesta
            var updatedCategory = await _context.Categories.FindAsync(product.CategoryId);

            return Ok(new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                Stock = product.Stock,
                ReservedStock = product.ReservedStock,
                AvailableStock = product.AvailableStock,
                Price = product.Price,
                CategoryId = product.CategoryId,
                CategoryName = updatedCategory?.Name ?? "Sin categoría"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error interno del servidor: {ex.Message}" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Cobrador")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Producto no encontrado" });
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Producto eliminado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error interno del servidor: {ex.Message}" });
        }
    }
}

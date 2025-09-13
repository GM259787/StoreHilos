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
                CategoryName = p.Category.Name,
                HasQuantityDiscount = p.HasQuantityDiscount,
                MinQuantityForDiscount = p.MinQuantityForDiscount,
                DiscountedPrice = p.DiscountedPrice,
                DiscountStartDate = p.DiscountStartDate,
                DiscountEndDate = p.DiscountEndDate,
                IsDiscountActive = p.HasQuantityDiscount && 
                    p.MinQuantityForDiscount.HasValue && 
                    p.DiscountedPrice.HasValue &&
                    (!p.DiscountStartDate.HasValue || p.DiscountStartDate.Value <= DateTime.Now) &&
                    (!p.DiscountEndDate.HasValue || p.DiscountEndDate.Value >= DateTime.Now)
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
            CategoryName = product.Category.Name,
            HasQuantityDiscount = product.HasQuantityDiscount,
            MinQuantityForDiscount = product.MinQuantityForDiscount,
            DiscountedPrice = product.DiscountedPrice,
            DiscountStartDate = product.DiscountStartDate,
            DiscountEndDate = product.DiscountEndDate,
            IsDiscountActive = product.IsDiscountActive
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

            // Actualizar campos de descuento por cantidad
            if (updateProductDto.HasQuantityDiscount.HasValue)
                product.HasQuantityDiscount = updateProductDto.HasQuantityDiscount.Value;

            if (updateProductDto.MinQuantityForDiscount.HasValue)
            {
                if (updateProductDto.MinQuantityForDiscount.Value <= 0)
                    return BadRequest(new { message = "La cantidad mínima para descuento debe ser mayor a 0" });
                product.MinQuantityForDiscount = updateProductDto.MinQuantityForDiscount.Value;
            }

            if (updateProductDto.DiscountedPrice.HasValue)
            {
                if (updateProductDto.DiscountedPrice.Value <= 0)
                    return BadRequest(new { message = "El precio con descuento debe ser mayor a 0" });
                product.DiscountedPrice = updateProductDto.DiscountedPrice.Value;
            }

            if (updateProductDto.DiscountStartDate.HasValue)
                product.DiscountStartDate = updateProductDto.DiscountStartDate.Value;

            if (updateProductDto.DiscountEndDate.HasValue)
                product.DiscountEndDate = updateProductDto.DiscountEndDate.Value;

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
                CategoryName = updatedCategory?.Name ?? "Sin categoría",
                HasQuantityDiscount = product.HasQuantityDiscount,
                MinQuantityForDiscount = product.MinQuantityForDiscount,
                DiscountedPrice = product.DiscountedPrice,
                DiscountStartDate = product.DiscountStartDate,
                DiscountEndDate = product.DiscountEndDate,
                IsDiscountActive = product.IsDiscountActive
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

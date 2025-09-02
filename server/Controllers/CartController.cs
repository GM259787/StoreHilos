using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("sync")]
    public async Task<ActionResult> SyncCart([FromBody] SyncCartDto syncCartDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            // Obtener o crear el carrito del usuario
            var cart = await _context.ShoppingCarts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new ShoppingCart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ShoppingCarts.Add(cart);
                await _context.SaveChangesAsync(); // Guardar para obtener el ID
            }

            // Limpiar items existentes
            if (cart.CartItems.Any())
            {
                _context.CartItems.RemoveRange(cart.CartItems);
            }

            // Agregar nuevos items
            foreach (var itemDto in syncCartDto.Items)
            {
                var product = await _context.Products.FindAsync(itemDto.ProductId);
                if (product != null)
                {
                    var cartItem = new CartItem
                    {
                        CartId = cart.Id,
                        ProductId = itemDto.ProductId,
                        Quantity = itemDto.Quantity,
                        AddedAt = DateTime.UtcNow
                    };
                    _context.CartItems.Add(cartItem);
                }
            }

            // Guardar los items del carrito
            await _context.SaveChangesAsync();

            return Ok(new { message = "Carrito sincronizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error interno del servidor: {ex.Message}" });
        }
    }

    [HttpGet("test")]
    public ActionResult<string> Test()
    {
        return Ok("CartController está funcionando!");
    }

    [HttpGet]
    public async Task<ActionResult<List<CartItemDto>>> GetCart()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var cart = await _context.ShoppingCarts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
            return Ok(new List<CartItemDto>());

        var cartItems = cart.CartItems.Select(ci => new CartItemDto
        {
            ProductId = ci.ProductId,
            Quantity = ci.Quantity
        }).ToList();

        return Ok(cartItems);
    }
}

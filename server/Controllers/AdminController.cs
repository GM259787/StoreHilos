using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("orders")]
    public async Task<ActionResult<List<OrderDto>>> GetOrders()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return Unauthorized();

        // Solo armadores y cobradores pueden ver todos los pedidos
        if (user.Role.Name != "Armador" && user.Role.Name != "Cobrador")
            return Forbid();

        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                Status = o.Status,
                IsPaid = o.IsPaid,
                SubTotal = o.SubTotal,
                TaxAmount = o.TaxAmount,
                ShippingAmount = o.ShippingAmount,
                TotalAmount = o.TotalAmount,
                ShippingAddress = o.ShippingAddress,
                ShippingCity = o.ShippingCity,
                ShippingPostalCode = o.ShippingPostalCode,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                CustomerName = $"{o.User.FirstName} {o.User.LastName}",
                CustomerEmail = o.User.Email,
                Items = o.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductName,
                    ProductPrice = oi.ProductPrice,
                    Quantity = oi.Quantity,
                    SubTotal = oi.SubTotal
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("orders/confirmed")]
    public async Task<ActionResult<List<OrderDto>>> GetConfirmedOrders()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return Unauthorized();

        // Solo armadores y cobradores pueden ver pedidos confirmados
        if (user.Role.Name != "Armador" && user.Role.Name != "Cobrador")
            return Forbid();

        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
            .Where(o => o.Status == "Confirmed")
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                Status = o.Status,
                IsPaid = o.IsPaid,
                SubTotal = o.SubTotal,
                TaxAmount = o.TaxAmount,
                ShippingAmount = o.ShippingAmount,
                TotalAmount = o.TotalAmount,
                ShippingAddress = o.ShippingAddress,
                ShippingCity = o.ShippingCity,
                ShippingPostalCode = o.ShippingPostalCode,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                CustomerName = $"{o.User.FirstName} {o.User.LastName}",
                CustomerEmail = o.User.Email,
                Items = o.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductName,
                    ProductPrice = oi.ProductPrice,
                    Quantity = oi.Quantity,
                    SubTotal = oi.SubTotal
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpPut("orders/{id}/mark-as-paid")]
    public async Task<ActionResult> MarkOrderAsPaid(int id)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return Unauthorized();

        // Solo cobradores pueden marcar como pagado
        if (user.Role.Name != "Cobrador")
            return Forbid();

        var order = await _context.Orders.FindAsync(id);
        if (order == null)
            return NotFound();

        order.IsPaid = true;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Pedido marcado como pagado" });
    }

    [HttpPut("orders/{id}/status")]
    public async Task<ActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto updateDto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return Unauthorized();

        // Solo armadores pueden cambiar el estado
        if (user.Role.Name != "Armador")
            return Forbid();

        var order = await _context.Orders.FindAsync(id);
        if (order == null)
            return NotFound();

        order.Status = updateDto.Status;
        order.UpdatedAt = DateTime.UtcNow;
        
        // Estado del pedido actualizado

        await _context.SaveChangesAsync();

        return Ok(new { message = "Estado del pedido actualizado" });
    }
}

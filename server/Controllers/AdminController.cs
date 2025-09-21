using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Services;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWhatsAppService _whatsAppService;

    public AdminController(AppDbContext context, IWhatsAppService whatsAppService)
    {
        _context = context;
        _whatsAppService = whatsAppService;
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
                CustomerPhone = o.User.ShippingPhone,
                CustomerShippingInstructions = o.User.ShippingInstructions,
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

        // Los armadores ven pedidos pagados (Pending o Confirmed) para armar
        // Los cobradores ven pedidos NO pagados (Pending) para cobrar
        var baseQuery = _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems);

        var orders = user.Role.Name switch
        {
            "Armador" => await baseQuery
                .Where(o => o.IsPaid)
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
                    CustomerPhone = o.User.ShippingPhone,
                    CustomerShippingInstructions = o.User.ShippingInstructions,
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
                .ToListAsync(),
            "Cobrador" => await baseQuery
                .Where(o => !o.IsPaid && o.Status == "Pending")
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
                    CustomerPhone = o.User.ShippingPhone,
                    CustomerShippingInstructions = o.User.ShippingInstructions,
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
                .ToListAsync(),
            _ => new List<OrderDto>()
        };

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

        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound();

        if (order.IsPaid)
            return BadRequest(new { message = "El pedido ya está marcado como pagado" });

        // CONFIRMAR RESERVAS: Descontar del stock real y liberar reservas
        foreach (var orderItem in order.OrderItems)
        {
            var product = orderItem.Product;
            
            // Descontar del stock real
            product.Stock -= orderItem.Quantity;
            
            // Liberar las reservas
            product.ReservedStock -= orderItem.Quantity;
            
            // Asegurar que no sean negativos
            if (product.Stock < 0)
                product.Stock = 0;
            if (product.ReservedStock < 0)
                product.ReservedStock = 0;
        }

        order.IsPaid = true;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Pedido marcado como pagado y stock confirmado" });
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

        // Solo armadores y cobradores pueden cambiar el estado
        if (user.Role.Name != "Armador" && user.Role.Name != "Cobrador")
            return Forbid();

        var order = await _context.Orders
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id);
            
        if (order == null)
            return NotFound();

        var previousStatus = order.Status;
        order.Status = updateDto.Status;
        order.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();

        // Enviar notificación de WhatsApp si el pedido fue enviado
        if (updateDto.Status == "Shipped" && previousStatus != "Shipped")
        {
            var customerName = $"{order.User.FirstName} {order.User.LastName}";
            var shippingAddress = $"{order.ShippingAddress}, {order.ShippingCity}";
            
            await _whatsAppService.SendOrderShippedNotificationAsync(
                order.OrderNumber,
                customerName,
                order.User.Email,
                shippingAddress
            );
        }

        return Ok(new { message = "Estado del pedido actualizado" });
    }
}

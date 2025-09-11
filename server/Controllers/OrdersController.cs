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
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetMyOrders()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderItems)
            .Include(o => o.User)
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

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var order = await _context.Orders
            .Where(o => o.Id == id && o.UserId == userId)
            .Include(o => o.OrderItems)
            .Include(o => o.User)
            .FirstOrDefaultAsync();

        if (order == null)
            return NotFound();

        var orderDto = new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Status = order.Status,
            SubTotal = order.SubTotal,
            TaxAmount = order.TaxAmount,
            ShippingAmount = order.ShippingAmount,
            TotalAmount = order.TotalAmount,
            ShippingAddress = order.ShippingAddress,
            ShippingCity = order.ShippingCity,
            ShippingPostalCode = order.ShippingPostalCode,
            Notes = order.Notes,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                ProductPrice = oi.ProductPrice,
                Quantity = oi.Quantity,
                SubTotal = oi.SubTotal
            }).ToList()
        };

        return Ok(orderDto);
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto createOrderDto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        // Obtener el carrito del usuario
        var cart = await _context.ShoppingCarts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || !cart.CartItems.Any())
        {
            return BadRequest(new { message = "El carrito está vacío" });
        }

        // Verificar stock disponible antes de crear el pedido
        foreach (var cartItem in cart.CartItems)
        {
            var product = cartItem.Product;
            if (product.AvailableStock < cartItem.Quantity)
            {
                return BadRequest(new { 
                    message = $"No hay suficiente stock para el producto '{product.Name}'. Stock disponible: {product.AvailableStock}, solicitado: {cartItem.Quantity}" 
                });
            }
        }

        // Generar número de pedido único
        var orderNumber = GenerateOrderNumber();

        // Calcular totales
        var subTotal = cart.CartItems.Sum(ci => ci.Product.Price * ci.Quantity);
        var taxAmount = subTotal * 0.22m; // 22% IVA
        var shippingAmount = 5.99m; // Costo de envío fijo
        var totalAmount = subTotal + taxAmount + shippingAmount;

        // Crear el pedido
        var order = new Order
        {
            UserId = userId,
            OrderNumber = orderNumber,
            Status = "Pending",
            SubTotal = subTotal,
            TaxAmount = taxAmount,
            ShippingAmount = shippingAmount,
            TotalAmount = totalAmount,
            ShippingAddress = createOrderDto.ShippingAddress,
            ShippingCity = createOrderDto.ShippingCity,
            ShippingPostalCode = createOrderDto.ShippingPostalCode,
            Notes = createOrderDto.Notes
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Crear los items del pedido
        var orderItems = cart.CartItems.Select(ci => new OrderItem
        {
            OrderId = order.Id,
            ProductId = ci.ProductId,
            ProductName = ci.Product.Name,
            ProductPrice = ci.Product.Price,
            Quantity = ci.Quantity,
            SubTotal = ci.Product.Price * ci.Quantity
        }).ToList();

        _context.OrderItems.AddRange(orderItems);

        // RESERVAR PRODUCTOS: Aumentar el stock reservado
        foreach (var cartItem in cart.CartItems)
        {
            var product = cartItem.Product;
            product.ReservedStock += cartItem.Quantity;
        }

        // Limpiar el carrito
        _context.CartItems.RemoveRange(cart.CartItems);
        _context.ShoppingCarts.Remove(cart);

        await _context.SaveChangesAsync();

        // Obtener el usuario para completar el DTO
        var user = await _context.Users.FindAsync(userId);
        
        // Retornar el pedido creado
        var orderDto = new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Status = order.Status,
            IsPaid = order.IsPaid,
            SubTotal = order.SubTotal,
            TaxAmount = order.TaxAmount,
            ShippingAmount = order.ShippingAmount,
            TotalAmount = order.TotalAmount,
            ShippingAddress = order.ShippingAddress,
            ShippingCity = order.ShippingCity,
            ShippingPostalCode = order.ShippingPostalCode,
            Notes = order.Notes,
            CreatedAt = order.CreatedAt,
            CustomerName = user != null ? $"{user.FirstName} {user.LastName}" : "Usuario",
            CustomerEmail = user?.Email ?? "",
            Items = orderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                ProductPrice = oi.ProductPrice,
                Quantity = oi.Quantity,
                SubTotal = oi.SubTotal
            }).ToList()
        };

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, orderDto);
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult> CancelOrder(int id)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
            return NotFound();

        if (order.Status == "Cancelled")
            return BadRequest(new { message = "El pedido ya está cancelado" });

        if (order.IsPaid)
            return BadRequest(new { message = "No se puede cancelar un pedido ya pagado" });

        // Liberar reservas: Reducir el stock reservado
        foreach (var orderItem in order.OrderItems)
        {
            var product = orderItem.Product;
            product.ReservedStock -= orderItem.Quantity;
            
            // Asegurar que no sea negativo
            if (product.ReservedStock < 0)
                product.ReservedStock = 0;
        }

        // Marcar el pedido como cancelado
        order.Status = "Cancelled";
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Pedido cancelado exitosamente" });
    }

    private string GenerateOrderNumber()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var random = new Random().Next(1000, 9999);
        return $"ORD-{timestamp}-{random}";
    }
}

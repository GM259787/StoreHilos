using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Services;
using System.Text.Json;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly MercadoPagoService _mercadoPagoService;
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(
        MercadoPagoService mercadoPagoService,
        AppDbContext context,
        IConfiguration configuration,
        ILogger<PaymentController> logger)
    {
        _mercadoPagoService = mercadoPagoService;
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("create-preference")]
    public async Task<ActionResult<CreatePreferenceResponse>> CreatePreference([FromBody] CreatePreferenceDto dto)
    {
        try
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

            // Crear el pedido temporal
            var orderNumber = GenerateOrderNumber();
            var subTotal = cart.CartItems.Sum(ci => ci.Product.Price * ci.Quantity);
            var taxAmount = subTotal * 0.22m; // 22% IVA
            var shippingAmount = 5.99m;
            var totalAmount = subTotal + taxAmount + shippingAmount;

            var order = new Models.Order
            {
                UserId = userId,
                OrderNumber = orderNumber,
                Status = "Pending",
                IsPaid = false,
                SubTotal = subTotal,
                TaxAmount = taxAmount,
                ShippingAmount = shippingAmount,
                TotalAmount = totalAmount,
                ShippingAddress = dto.ShippingAddress,
                ShippingCity = dto.ShippingCity,
                ShippingPostalCode = dto.ShippingPostalCode,
                Notes = dto.Notes
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Crear los items del pedido
            var orderItems = cart.CartItems.Select(ci => new Models.OrderItem
            {
                OrderId = order.Id,
                ProductId = ci.ProductId,
                ProductName = ci.Product.Name,
                ProductPrice = ci.Product.Price,
                Quantity = ci.Quantity,
                SubTotal = ci.Product.Price * ci.Quantity
            }).ToList();

            _context.OrderItems.AddRange(orderItems);
            await _context.SaveChangesAsync();

            // Crear preferencia de Mercado Pago
            var preferenceRequest = new CreatePreferenceRequest
            {
                Items = cart.CartItems.Select(ci => new PreferenceItemRequest
                {
                    Title = ci.Product.Name,
                    Quantity = ci.Quantity,
                    UnitPrice = ci.Product.Price
                }).ToList(),
                PayerName = dto.PayerName,
                PayerEmail = dto.PayerEmail,
                SuccessUrl = $"{_configuration["FrontendUrl"]}/payment/success?orderId={order.Id}",
                FailureUrl = $"{_configuration["FrontendUrl"]}/payment/failure?orderId={order.Id}",
                PendingUrl = $"{_configuration["FrontendUrl"]}/payment/pending?orderId={order.Id}",
                ExternalReference = order.Id.ToString(),
                NotificationUrl = $"{_configuration["BackendUrl"]}/api/payment/webhook"
            };

            var preference = await _mercadoPagoService.CreatePreferenceAsync(preferenceRequest);

            // Limpiar el carrito
            _context.CartItems.RemoveRange(cart.CartItems);
            _context.ShoppingCarts.Remove(cart);
            await _context.SaveChangesAsync();

            return Ok(new CreatePreferenceResponse
            {
                PreferenceId = preference.Id,
                InitPoint = preference.InitPoint,
                OrderId = order.Id
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creando preferencia de pago");
            
            // Verificar si es un error de configuración de Mercado Pago
            if (ex.Message.Contains("401") || ex.Message.Contains("Unauthorized") || 
                _configuration["MercadoPago:AccessToken"] == "TU_ACCESS_TOKEN_AQUI")
            {
                return BadRequest(new { 
                    message = "Error de configuración de Mercado Pago. Las credenciales no están configuradas correctamente.",
                    details = "Por favor, configure las credenciales de Mercado Pago en appsettings.json"
                });
            }
            
            return StatusCode(500, new { 
                message = "Error interno del servidor al procesar el pago",
                details = ex.Message
            });
        }
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<ActionResult> Webhook([FromBody] object payload)
    {
        try
        {
            var json = JsonSerializer.Serialize(payload);
            var webhookData = JsonSerializer.Deserialize<WebhookData>(json);

            if (webhookData?.Type == "payment")
            {
                var payment = await _mercadoPagoService.GetPaymentAsync(webhookData.Data.Id);
                
                if (payment != null && !string.IsNullOrEmpty(payment.ExternalReference))
                {
                    var orderId = int.Parse(payment.ExternalReference);
                    var order = await _context.Orders.FindAsync(orderId);

                    if (order != null)
                    {
                        if (payment.Status == "approved")
                        {
                            order.IsPaid = true;
                            order.Status = "Pending"; // Mantener como Pending para que el armador lo confirme
                        }
                        else if (payment.Status == "rejected" || payment.Status == "cancelled")
                        {
                            order.Status = "Cancelled";
                        }

                        order.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                    }
                }
            }

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando webhook de Mercado Pago");
            return StatusCode(500);
        }
    }

    [HttpGet("payment-status/{orderId}")]
    public async Task<ActionResult<PaymentStatusResponse>> GetPaymentStatus(int orderId)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(new PaymentStatusResponse
            {
                OrderId = order.Id,
                IsPaid = order.IsPaid,
                Status = order.Status
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo estado del pago");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    private string GenerateOrderNumber()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var random = new Random().Next(1000, 9999);
        return $"ORD-{timestamp}-{random}";
    }
}

public class CreatePreferenceDto
{
    public string PayerName { get; set; } = string.Empty;
    public string PayerEmail { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public class CreatePreferenceResponse
{
    public string PreferenceId { get; set; } = string.Empty;
    public string InitPoint { get; set; } = string.Empty;
    public int OrderId { get; set; }
}

public class PaymentStatusResponse
{
    public int OrderId { get; set; }
    public bool IsPaid { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class WebhookData
{
    public string Type { get; set; } = string.Empty;
    public WebhookDataInfo Data { get; set; } = new();
}

public class WebhookDataInfo
{
    public string Id { get; set; } = string.Empty;
}

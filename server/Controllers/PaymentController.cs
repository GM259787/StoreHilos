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
    private readonly PlaceToPayService _placeToPayService;
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(
        MercadoPagoService mercadoPagoService,
        PlaceToPayService placeToPayService,
        AppDbContext context,
        IConfiguration configuration,
        ILogger<PaymentController> logger)
    {
        _mercadoPagoService = mercadoPagoService;
        _placeToPayService = placeToPayService;
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
            var taxAmount = 0m; // Sin IVA
            var shippingAmount = 150m; // Costo fijo de envío: 150 pesos uruguayos
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

    /// <summary>
    /// Crea una sesión de pago con PlaceToPay para un pedido
    /// </summary>
    [HttpPost("placetopay/create-session")]
    public async Task<ActionResult<CreatePlaceToPaySessionResponse>> CreatePlaceToPaySession([FromBody] CreatePlaceToPaySessionDto dto)
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

            // Obtener información del usuario
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized();
            }

            // Crear el pedido
            var orderNumber = GenerateOrderNumber();
            var subTotal = cart.CartItems.Sum(ci => ci.Product.Price * ci.Quantity);
            var shippingAmount = 150m; // Costo fijo de envío: 150 pesos uruguayos
            var totalAmount = subTotal + shippingAmount;

            var order = new Models.Order
            {
                UserId = userId,
                OrderNumber = orderNumber,
                Status = "Pending",
                IsPaid = false,
                SubTotal = subTotal,
                ShippingAmount = shippingAmount,
                TotalAmount = totalAmount,
                ShippingAddress = dto.ShippingAddress,
                ShippingCity = dto.ShippingCity,
                ShippingPostalCode = dto.ShippingPostalCode,
                Notes = dto.Notes,
                PaymentMethod = "PlaceToPay"
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

            // Obtener IP y User-Agent del cliente
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var userAgent = Request.Headers["User-Agent"].ToString();

            // Crear la sesión en PlaceToPay
            var sessionRequest = new CreateSessionRequest
            {
                BuyerName = $"{user.FirstName} {user.LastName}",
                BuyerEmail = user.Email,
                BuyerMobile = user.Phone ?? "",
                Reference = order.OrderNumber,
                Description = $"Pedido {order.OrderNumber} - {cart.CartItems.Count} productos",
                Currency = "UYU",
                Total = totalAmount,
                ReturnUrl = $"{_configuration["FrontendUrl"]?.TrimEnd('/')}/payment/return?orderId={order.Id}",
                IpAddress = ipAddress,
                UserAgent = userAgent
            };

            var session = await _placeToPayService.CreateSessionAsync(sessionRequest);

            // Guardar información de la sesión en el pedido
            order.PaymentReference = order.OrderNumber;
            order.PlaceToPayRequestId = session.RequestId;
            order.PaymentStatus = "PENDING";
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // NO limpiar el carrito aquí - se limpiará cuando el pago sea confirmado

            _logger.LogInformation("Sesión de PlaceToPay creada para pedido {OrderId}. RequestId: {RequestId}", 
                order.Id, session.RequestId);

            return Ok(new CreatePlaceToPaySessionResponse
            {
                Success = true,
                RequestId = session.RequestId,
                ProcessUrl = session.ProcessUrl,
                OrderId = order.Id,
                Message = "Sesión de pago creada exitosamente"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creando sesión de PlaceToPay");
            
            if (ex.Message.Contains("401") || ex.Message.Contains("Unauthorized"))
            {
                return BadRequest(new { 
                    message = "Error de configuración de PlaceToPay. Las credenciales no están configuradas correctamente.",
                    details = "Por favor, configure las credenciales de PlaceToPay en appsettings.json"
                });
            }
            
            return StatusCode(500, new { message = "Error creando sesión de pago", error = ex.Message });
        }
    }

    /// <summary>
    /// Consulta el estado de un pago en PlaceToPay
    /// </summary>
    [HttpGet("placetopay/status/{orderId}")]
    public async Task<ActionResult<PlaceToPayStatusResponse>> GetPlaceToPayStatus(int orderId)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null)
            {
                return NotFound(new { message = "Pedido no encontrado" });
            }

            if (order.PlaceToPayRequestId == null)
            {
                return BadRequest(new { message = "Este pedido no tiene una sesión de PlaceToPay asociada" });
            }

            // Consultar estado en PlaceToPay
            var session = await _placeToPayService.GetSessionAsync(order.PlaceToPayRequestId.Value);

            // Actualizar estado del pedido según respuesta
            if (session.Status != null)
            {
                order.PaymentStatus = session.Status.Status;
                
                if (session.Status.Status == "APPROVED" && !order.IsPaid)
                {
                    order.IsPaid = true;
                    order.PaymentDate = DateTime.UtcNow;
                    order.Status = "Confirmed";
                    
                    if (session.Payment != null && session.Payment.Count > 0)
                    {
                        var payment = session.Payment.FirstOrDefault(p => p.Status?.Status == "APPROVED");
                        if (payment != null)
                        {
                            order.PaymentReference = payment.Authorization;
                        }
                    }

                    // Limpiar el carrito del usuario cuando el pago es confirmado
                    var cart = await _context.ShoppingCarts
                        .Include(c => c.CartItems)
                        .FirstOrDefaultAsync(c => c.UserId == userId);
                    
                    if (cart != null)
                    {
                        _context.CartItems.RemoveRange(cart.CartItems);
                        _context.ShoppingCarts.Remove(cart);
                        _logger.LogInformation("Carrito limpiado para usuario {UserId} después de pago confirmado", userId);
                    }
                }
                else if (session.Status.Status == "REJECTED")
                {
                    order.Status = "Cancelled";
                }

                order.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Estado de pago actualizado para pedido {OrderId}. Estado: {Status}", 
                    order.Id, session.Status.Status);
            }

            return Ok(new PlaceToPayStatusResponse
            {
                RequestId = order.PlaceToPayRequestId.Value,
                Status = session.Status?.Status ?? "UNKNOWN",
                Message = session.Status?.Message ?? "",
                OrderId = order.Id,
                OrderNumber = order.OrderNumber,
                IsPaid = order.IsPaid,
                OrderStatus = order.Status
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error consultando estado de pago");
            return StatusCode(500, new { message = "Error consultando estado de pago", error = ex.Message });
        }
    }

    /// <summary>
    /// Webhook para recibir notificaciones de PlaceToPay
    /// </summary>
    [HttpPost("placetopay/webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> PlaceToPayWebhook([FromBody] PlaceToPayWebhookDto webhookRequest)
    {
        try
        {
            _logger.LogInformation("Webhook recibido de PlaceToPay. RequestId: {RequestId}", 
                webhookRequest.RequestId);

            // Buscar el pedido con este requestId
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.PlaceToPayRequestId == webhookRequest.RequestId);

            if (order == null)
            {
                _logger.LogWarning("Pedido no encontrado para RequestId: {RequestId}", webhookRequest.RequestId);
                return NotFound();
            }

            // Consultar el estado real en PlaceToPay para verificar
            var session = await _placeToPayService.GetSessionAsync(webhookRequest.RequestId);

            if (session.Status != null)
            {
                order.PaymentStatus = session.Status.Status;
                
                if (session.Status.Status == "APPROVED" && !order.IsPaid)
                {
                    order.IsPaid = true;
                    order.PaymentDate = DateTime.UtcNow;
                    order.Status = "Confirmed";
                    
                    if (session.Payment != null && session.Payment.Count > 0)
                    {
                        var payment = session.Payment.FirstOrDefault(p => p.Status?.Status == "APPROVED");
                        if (payment != null)
                        {
                            order.PaymentReference = payment.Authorization;
                        }
                    }
                    
                    _logger.LogInformation("Pago aprobado vía webhook para pedido {OrderId}", order.Id);
                }
                else if (session.Status.Status == "REJECTED")
                {
                    order.Status = "Cancelled";
                    _logger.LogInformation("Pago rechazado vía webhook para pedido {OrderId}", order.Id);
                }

                order.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando webhook de PlaceToPay");
            return StatusCode(500);
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

// DTOs para PlaceToPay
public class CreatePlaceToPaySessionDto
{
    public string ShippingAddress { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public class CreatePlaceToPaySessionResponse
{
    public bool Success { get; set; }
    public int RequestId { get; set; }
    public string ProcessUrl { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class PlaceToPayStatusResponse
{
    public int RequestId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
    public string OrderStatus { get; set; } = string.Empty;
}

public class PlaceToPayWebhookDto
{
    public int RequestId { get; set; }
    public string Status { get; set; } = string.Empty;
}

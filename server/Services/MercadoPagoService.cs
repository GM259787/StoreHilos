using System.Text.Json;

namespace Server.Services;

public class MercadoPagoService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<MercadoPagoService> _logger;
    private readonly HttpClient _httpClient;

    public MercadoPagoService(IConfiguration configuration, ILogger<MercadoPagoService> logger, HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
        
        // Configurar headers para Mercado Pago
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_configuration["MercadoPago:AccessToken"]}");
        // No configurar Content-Type aquí, se configura en cada request
    }

    public async Task<MercadoPagoPreferenceResponse> CreatePreferenceAsync(CreatePreferenceRequest request)
    {
        try
        {
            var preferenceData = new
            {
                items = request.Items.Select(item => new
                {
                    title = item.Title,
                    quantity = item.Quantity,
                    unit_price = item.UnitPrice,
                    currency_id = "UYU"
                }).ToArray(),
                payer = new
                {
                    name = request.PayerName,
                    email = request.PayerEmail
                },
                back_urls = new
                {
                    success = request.SuccessUrl,
                    failure = request.FailureUrl,
                    pending = request.PendingUrl
                },
                auto_return = "approved",
                external_reference = request.ExternalReference,
                notification_url = request.NotificationUrl
            };

            var json = JsonSerializer.Serialize(preferenceData);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync("https://api.mercadopago.com/checkout/preferences", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                var result = JsonSerializer.Deserialize<MercadoPagoPreferenceResponse>(responseContent);
                return result ?? new MercadoPagoPreferenceResponse();
            }
            else
            {
                _logger.LogError("Error creando preferencia: {StatusCode} - {Content}", response.StatusCode, responseContent);
                
                // Proporcionar mensajes de error más específicos
                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    throw new Exception("401 - Credenciales de Mercado Pago inválidas o no configuradas");
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                {
                    throw new Exception($"400 - Error en la solicitud a Mercado Pago: {responseContent}");
                }
                else
                {
                    throw new Exception($"Error creando preferencia: {response.StatusCode} - {responseContent}");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creando preferencia de Mercado Pago");
            throw;
        }
    }

    public async Task<MercadoPagoPaymentResponse> GetPaymentAsync(string paymentId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"https://api.mercadopago.com/v1/payments/{paymentId}");
            var content = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                return JsonSerializer.Deserialize<MercadoPagoPaymentResponse>(content) ?? new MercadoPagoPaymentResponse();
            }
            else
            {
                _logger.LogError("Error obteniendo pago: {StatusCode} - {Content}", response.StatusCode, content);
                throw new Exception($"Error obteniendo pago: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo pago de Mercado Pago: {PaymentId}", paymentId);
            throw;
        }
    }

    public bool ValidateWebhook(string signature, string payload)
    {
        try
        {
            // Implementar validación de webhook si es necesario
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validando webhook de Mercado Pago");
            return false;
        }
    }
}

public class CreatePreferenceRequest
{
    public List<PreferenceItemRequest> Items { get; set; } = new();
    public string PayerName { get; set; } = string.Empty;
    public string PayerEmail { get; set; } = string.Empty;
    public string SuccessUrl { get; set; } = string.Empty;
    public string FailureUrl { get; set; } = string.Empty;
    public string PendingUrl { get; set; } = string.Empty;
    public string ExternalReference { get; set; } = string.Empty;
    public string NotificationUrl { get; set; } = string.Empty;
}

public class PreferenceItemRequest
{
    public string Title { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class MercadoPagoPreferenceResponse
{
    public string Id { get; set; } = string.Empty;
    public string InitPoint { get; set; } = string.Empty;
    public string SandboxInitPoint { get; set; } = string.Empty;
}

public class MercadoPagoPaymentResponse
{
    public long Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ExternalReference { get; set; } = string.Empty;
    public decimal TransactionAmount { get; set; }
}

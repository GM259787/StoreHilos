using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Server.Services;

public class PlaceToPayService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<PlaceToPayService> _logger;
    private readonly HttpClient _httpClient;

    public PlaceToPayService(IConfiguration configuration, ILogger<PlaceToPayService> logger, HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
    }

    /// <summary>
    /// Obtiene las credenciales de PlaceToPay para un sitio específico
    /// </summary>
    private (string baseUrl, string login, string secretKey) GetSiteCredentials(string siteId)
    {
        var baseUrl = (_configuration[$"PlaceToPay:{siteId}:BaseUrl"] ?? "https://checkout.placetopay.uy").Trim().TrimEnd('/');
        var login = _configuration[$"PlaceToPay:{siteId}:Login"] ?? "";
        var secretKey = _configuration[$"PlaceToPay:{siteId}:SecretKey"] ?? "";

        if (string.IsNullOrEmpty(login) || string.IsNullOrEmpty(secretKey))
        {
            _logger.LogWarning("Credenciales de PlaceToPay no configuradas para el sitio: {SiteId}", siteId);
        }

        return (baseUrl, login, secretKey);
    }

    /// <summary>
    /// Genera la autenticación requerida por PlaceToPay
    /// </summary>
    private PlaceToPayAuth GenerateAuth(string siteId)
    {
        var (_, login, secretKey) = GetSiteCredentials(siteId);

        var seed = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:sszzz");
        var rawNonce = new Random().Next(100000000, 999999999).ToString();

        // Generar tranKey: Base64(SHA-256(nonce + seed + secretKey))
        var tranKeySource = rawNonce + seed + secretKey;
        var tranKeyBytes = SHA256.HashData(Encoding.UTF8.GetBytes(tranKeySource));
        var tranKey = Convert.ToBase64String(tranKeyBytes);

        // Codificar nonce en Base64
        var nonce = Convert.ToBase64String(Encoding.UTF8.GetBytes(rawNonce));

        return new PlaceToPayAuth
        {
            Login = login,
            TranKey = tranKey,
            Nonce = nonce,
            Seed = seed
        };
    }

    /// <summary>
    /// Crea una sesión de pago en PlaceToPay
    /// </summary>
    public async Task<PlaceToPaySessionResponse> CreateSessionAsync(CreateSessionRequest request, string siteId)
    {
        try
        {
            var (baseUrl, _, _) = GetSiteCredentials(siteId);
            var auth = GenerateAuth(siteId);

            var sessionData = new
            {
                auth = new
                {
                    login = auth.Login,
                    tranKey = auth.TranKey,
                    nonce = auth.Nonce,
                    seed = auth.Seed
                },
                buyer = new
                {
                    name = request.BuyerName,
                    surname = request.BuyerSurname,
                    email = request.BuyerEmail,
                    mobile = request.BuyerMobile
                },
                payment = new
                {
                    reference = request.Reference,
                    description = request.Description,
                    amount = new
                    {
                        currency = request.Currency,
                        total = request.Total,
                        taxes = new[]
                        {
                            new
                            {
                                kind = "valueAddedTax",
                                amount = request.TaxAmount,
                                @base = Math.Round(request.Total - request.TaxAmount, 2)
                            }
                        }
                    },
                    modifiers = new[]
                    {
                        new
                        {
                            type = "FEDERAL_GOVERNMENT",
                            code = 19210,
                            additional = new
                            {
                                invoice = request.Invoice
                            }
                        }
                    }
                },
                expiration = DateTime.UtcNow.AddMinutes(15).ToString("yyyy-MM-ddTHH:mm:sszzz"),
                returnUrl = request.ReturnUrl,
                notificationUrl = request.NotificationUrl,
                ipAddress = request.IpAddress,
                userAgent = request.UserAgent
            };

            var json = JsonSerializer.Serialize(sessionData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _logger.LogInformation("Creando sesión PlaceToPay para referencia: {Reference}. Payload: {Payload}", request.Reference, json);
            
            var response = await _httpClient.PostAsync($"{baseUrl}/api/session", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("Respuesta PlaceToPay ({SiteId}): {StatusCode} - {Content}", siteId, response.StatusCode, responseContent);

            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var result = JsonSerializer.Deserialize<PlaceToPaySessionResponse>(responseContent, options);

                if (result != null)
                {
                    _logger.LogInformation("Sesión creada exitosamente ({SiteId}). RequestId: {RequestId}, ProcessUrl: {ProcessUrl}",
                        siteId, result.RequestId, result.ProcessUrl);
                    return result;
                }

                throw new Exception("Error al deserializar respuesta de PlaceToPay");
            }
            else
            {
                _logger.LogError("Error creando sesión PlaceToPay ({SiteId}): {StatusCode} - {Content}",
                    siteId, response.StatusCode, responseContent);
                
                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    throw new Exception("401 - Credenciales de PlaceToPay inválidas o no configuradas");
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                {
                    throw new Exception($"400 - Error en la solicitud a PlaceToPay: {responseContent}");
                }
                else
                {
                    throw new Exception($"Error creando sesión: {response.StatusCode} - {responseContent}");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creando sesión de PlaceToPay");
            throw;
        }
    }

    /// <summary>
    /// Consulta el estado de una sesión de pago
    /// </summary>
    public async Task<PlaceToPayQueryResponse> GetSessionAsync(int requestId, string siteId)
    {
        try
        {
            var (baseUrl, _, _) = GetSiteCredentials(siteId);
            var auth = GenerateAuth(siteId);
            
            var queryData = new
            {
                auth = new
                {
                    login = auth.Login,
                    tranKey = auth.TranKey,
                    nonce = auth.Nonce,
                    seed = auth.Seed
                }
            };

            var json = JsonSerializer.Serialize(queryData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            _logger.LogInformation("Consultando sesión PlaceToPay. RequestId: {RequestId}", requestId);
            
            var response = await _httpClient.PostAsync($"{baseUrl}/api/session/{requestId}", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var result = JsonSerializer.Deserialize<PlaceToPayQueryResponse>(responseContent, options);
                
                if (result != null)
                {
                    _logger.LogInformation("Sesión consultada. Estado: {Status}", result.Status?.Status);
                    return result;
                }
                
                throw new Exception("Error al deserializar respuesta de PlaceToPay");
            }
            else
            {
                _logger.LogError("Error consultando sesión PlaceToPay: {StatusCode} - {Content}", 
                    response.StatusCode, responseContent);
                throw new Exception($"Error consultando sesión: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error consultando sesión de PlaceToPay: {RequestId}", requestId);
            throw;
        }
    }
    /// <summary>
    /// Valida la firma de una notificación webhook de PlaceToPay
    /// Fórmula: SHA-256(requestId + status + date + secretKey)
    /// </summary>
    public bool ValidateWebhookSignature(int requestId, string status, string date, string receivedSignature, string siteId)
    {
        var (_, _, secretKey) = GetSiteCredentials(siteId);

        // La firma viene con prefijo "sha256:" o sin prefijo (SHA-1 legacy)
        var cleanSignature = receivedSignature;
        var useSha256 = true;

        if (receivedSignature.StartsWith("sha256:"))
        {
            cleanSignature = receivedSignature["sha256:".Length..];
        }
        else
        {
            useSha256 = false;
        }

        var raw = $"{requestId}{status}{date}{secretKey}";

        string computedSignature;
        if (useSha256)
        {
            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(raw));
            computedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }
        else
        {
            var hashBytes = System.Security.Cryptography.SHA1.HashData(Encoding.UTF8.GetBytes(raw));
            computedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }

        return string.Equals(computedSignature, cleanSignature, StringComparison.OrdinalIgnoreCase);
    }
}

// ==================== MODELOS ====================

public class PlaceToPayAuth
{
    public string Login { get; set; } = string.Empty;
    public string TranKey { get; set; } = string.Empty;
    public string Nonce { get; set; } = string.Empty;
    public string Seed { get; set; } = string.Empty;
}

public class CreateSessionRequest
{
    public string BuyerName { get; set; } = string.Empty;
    public string BuyerSurname { get; set; } = string.Empty;
    public string BuyerEmail { get; set; } = string.Empty;
    public string BuyerMobile { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Currency { get; set; } = "USD";
    public decimal Total { get; set; }
    public string ReturnUrl { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public decimal TaxAmount { get; set; }
    public string Invoice { get; set; } = string.Empty;
    public string NotificationUrl { get; set; } = string.Empty;
}

public class PlaceToPaySessionResponse
{
    [JsonPropertyName("status")]
    public PlaceToPayStatus? Status { get; set; }
    
    [JsonPropertyName("requestId")]
    public int RequestId { get; set; }
    
    [JsonPropertyName("processUrl")]
    public string ProcessUrl { get; set; } = string.Empty;
}

public class PlaceToPayQueryResponse
{
    [JsonPropertyName("requestId")]
    public int RequestId { get; set; }
    
    [JsonPropertyName("status")]
    public PlaceToPayStatus? Status { get; set; }
    
    [JsonPropertyName("request")]
    public PlaceToPayRequestInfo? Request { get; set; }
    
    [JsonPropertyName("payment")]
    public List<PlaceToPayPaymentInfo>? Payment { get; set; }
    
    [JsonPropertyName("subscription")]
    public PlaceToPaySubscription? Subscription { get; set; }
}

public class PlaceToPayStatus
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty; // PENDING, APPROVED, REJECTED, etc.
    
    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty;
    
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
    
    [JsonPropertyName("date")]
    public string Date { get; set; } = string.Empty;
}

public class PlaceToPayRequestInfo
{
    [JsonPropertyName("locale")]
    public string Locale { get; set; } = string.Empty;
    
    [JsonPropertyName("buyer")]
    public PlaceToPayBuyer? Buyer { get; set; }
    
    [JsonPropertyName("payment")]
    public PlaceToPayPaymentRequest? Payment { get; set; }
}

public class PlaceToPayBuyer
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    
    [JsonPropertyName("mobile")]
    public string Mobile { get; set; } = string.Empty;
}

public class PlaceToPayPaymentRequest
{
    [JsonPropertyName("reference")]
    public string Reference { get; set; } = string.Empty;
    
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
    
    [JsonPropertyName("amount")]
    public PlaceToPayAmount? Amount { get; set; }
}

public class PlaceToPayAmount
{
    [JsonPropertyName("currency")]
    public string Currency { get; set; } = string.Empty;
    
    [JsonPropertyName("total")]
    public decimal Total { get; set; }
}

public class PlaceToPayPaymentInfo
{
    [JsonPropertyName("status")]
    public PlaceToPayStatus? Status { get; set; }
    
    [JsonPropertyName("internalReference")]
    public int InternalReference { get; set; }
    
    [JsonPropertyName("reference")]
    public string Reference { get; set; } = string.Empty;
    
    [JsonPropertyName("paymentMethod")]
    public string PaymentMethod { get; set; } = string.Empty;
    
    [JsonPropertyName("amount")]
    public PlaceToPayAmount? Amount { get; set; }
    
    [JsonPropertyName("authorization")]
    public string Authorization { get; set; } = string.Empty;
    
    [JsonPropertyName("receipt")]
    public string Receipt { get; set; } = string.Empty;
    
    [JsonPropertyName("franchise")]
    public string Franchise { get; set; } = string.Empty;
}

public class PlaceToPaySubscription
{
    [JsonPropertyName("status")]
    public PlaceToPayStatus? Status { get; set; }
    
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;
    
    [JsonPropertyName("instrument")]
    public List<PlaceToPayInstrument>? Instrument { get; set; }
}

public class PlaceToPayInstrument
{
    [JsonPropertyName("keyword")]
    public string Keyword { get; set; } = string.Empty;
    
    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;
    
    [JsonPropertyName("displayOn")]
    public string DisplayOn { get; set; } = string.Empty;
}

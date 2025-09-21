using System.Text;

namespace Server.Services;

public interface IWhatsAppService
{
    Task SendOrderShippedNotificationAsync(string orderNumber, string customerName, string customerEmail, string shippingAddress);
}

public class WhatsAppService : IWhatsAppService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public WhatsAppService(IConfiguration configuration, HttpClient httpClient)
    {
        _configuration = configuration;
        _httpClient = httpClient;
    }

    public async Task SendOrderShippedNotificationAsync(string orderNumber, string customerName, string customerEmail, string shippingAddress)
    {
        try
        {
            var companyWhatsApp = _configuration["Company:WhatsAppNumber"] ?? "+59895010204";
            var message = BuildShippedMessage(orderNumber, customerName, customerEmail, shippingAddress);
            
            // Crear URL de WhatsApp
            var whatsappUrl = $"https://wa.me/{companyWhatsApp.Replace("+", "").Replace(" ", "")}?text={Uri.EscapeDataString(message)}";
            
            // Log para debugging
            Console.WriteLine($"WhatsApp Notification URL: {whatsappUrl}");
            
            // Enviar WhatsApp real usando la URL
            await SendWhatsAppMessageAsync(companyWhatsApp, message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending WhatsApp notification: {ex.Message}");
        }
    }

    private string BuildShippedMessage(string orderNumber, string customerName, string customerEmail, string shippingAddress)
    {
        var message = new StringBuilder();
        message.AppendLine("🛒 *NUEVO PEDIDO RECIBIDO*");
        message.AppendLine();
        message.AppendLine($"📦 *Pedido:* {orderNumber}");
        message.AppendLine($"👤 *Cliente:* {customerName}");
        message.AppendLine($"📧 *Email:* {customerEmail}");
        message.AppendLine($"📍 *Dirección:* {shippingAddress}");
        message.AppendLine();
        message.AppendLine($"⏰ *Fecha:* {DateTime.Now:dd/MM/yyyy HH:mm}");
        message.AppendLine();
        message.AppendLine("💰 *Método de pago:* Transferencia bancaria");
        message.AppendLine("⏳ *Estado:* Pendiente de pago");
        message.AppendLine();
        message.AppendLine("📋 *Acción requerida:*");
        message.AppendLine("• Verificar transferencia bancaria");
        message.AppendLine("• Confirmar pago en el sistema");
        message.AppendLine("• Preparar pedido para envío");

        return message.ToString();
    }

    // Método para enviar WhatsApp real
    private async Task SendWhatsAppMessageAsync(string phoneNumber, string message)
    {
        try
        {
            // Limpiar número de teléfono
            var cleanNumber = phoneNumber.Replace("+", "").Replace(" ", "").Replace("-", "");
            
            // Crear URL de WhatsApp
            var whatsappUrl = $"https://wa.me/{cleanNumber}?text={Uri.EscapeDataString(message)}";
            
            // En un entorno real, aquí podrías usar una API de WhatsApp Business
            // Por ahora, abrimos la URL en el navegador del servidor (si es posible)
            // o simplemente logueamos la URL para que el admin pueda hacer clic
            
            Console.WriteLine($"=== WHATSAPP NOTIFICATION ===");
            Console.WriteLine($"To: {phoneNumber}");
            Console.WriteLine($"Message: {message}");
            Console.WriteLine($"URL: {whatsappUrl}");
            Console.WriteLine($"=============================");
            
            // TODO: En un entorno de producción, implementar envío real usando:
            // - WhatsApp Business API (Meta)
            // - Twilio WhatsApp API
            // - MessageBird WhatsApp API
            // - O cualquier otro proveedor de WhatsApp Business
            
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SendWhatsAppMessageAsync: {ex.Message}");
            throw;
        }
    }
}

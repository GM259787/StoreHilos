using System.Text;

namespace Server.Services;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string resetToken, string userName);
    Task SendEmailVerificationAsync(string email, string verificationToken, string userName);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetToken, string userName)
    {
        try
        {
            var frontendUrl = _configuration["FrontendUrl"]?.TrimEnd('/') ?? "https://storehilos.uy";
            var resetUrl = $"{frontendUrl}/reset-password?token={resetToken}";
            
            var subject = "Recuperación de contraseña - Store Hilos";
            var body = BuildPasswordResetEmailBody(userName, resetUrl);
            
            // Por ahora, solo logueamos el email (en producción se enviaría realmente)
            _logger.LogInformation($"Password Reset Email for {email}:");
            _logger.LogInformation($"Subject: {subject}");
            _logger.LogInformation($"Body: {body}");
            _logger.LogInformation($"Reset URL: {resetUrl}");
            
            // TODO: Implementar envío real de email usando SendGrid, SMTP, etc.
            // await SendEmailAsync(email, subject, body);
            
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending password reset email to {Email}", email);
            throw;
        }
    }

    public async Task SendEmailVerificationAsync(string email, string verificationToken, string userName)
    {
        try
        {
            var frontendUrl = _configuration["FrontendUrl"]?.TrimEnd('/') ?? "https://storehilos.uy";
            var verificationUrl = $"{frontendUrl}/verify-email?token={verificationToken}";
            
            var subject = "Verificación de email - Store Hilos";
            var body = BuildEmailVerificationBody(userName, verificationUrl);
            
            // Por ahora, solo logueamos el email (en producción se enviaría realmente)
            _logger.LogInformation($"Email Verification for {email}:");
            _logger.LogInformation($"Subject: {subject}");
            _logger.LogInformation($"Body: {body}");
            _logger.LogInformation($"Verification URL: {verificationUrl}");
            
            // TODO: Implementar envío real de email usando SendGrid, SMTP, etc.
            // await SendEmailAsync(email, subject, body);
            
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email verification to {Email}", email);
            throw;
        }
    }

    private string BuildPasswordResetEmailBody(string userName, string resetUrl)
    {
        var body = new StringBuilder();
        body.AppendLine($"<h2>Hola {userName},</h2>");
        body.AppendLine("<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Store Hilos.</p>");
        body.AppendLine("<p>Si solicitaste este cambio, haz clic en el siguiente enlace para crear una nueva contraseña:</p>");
        body.AppendLine($"<p><a href=\"{resetUrl}\" style=\"background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Restablecer Contraseña</a></p>");
        body.AppendLine("<p>Si no solicitaste este cambio, puedes ignorar este email.</p>");
        body.AppendLine("<p>Este enlace expirará en 1 hora por seguridad.</p>");
        body.AppendLine("<br>");
        body.AppendLine("<p>Saludos,<br>Equipo de Store Hilos</p>");
        
        return body.ToString();
    }

    private string BuildEmailVerificationBody(string userName, string verificationUrl)
    {
        var body = new StringBuilder();
        body.AppendLine($"<h2>Bienvenido/a {userName},</h2>");
        body.AppendLine("<p>¡Gracias por registrarte en Store Hilos!</p>");
        body.AppendLine("<p>Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de email haciendo clic en el siguiente enlace:</p>");
        body.AppendLine($"<p><a href=\"{verificationUrl}\" style=\"background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Verificar Email</a></p>");
        body.AppendLine("<p>Si no creaste esta cuenta, puedes ignorar este email.</p>");
        body.AppendLine("<p>Este enlace expirará en 24 horas por seguridad.</p>");
        body.AppendLine("<br>");
        body.AppendLine("<p>Saludos,<br>Equipo de Store Hilos</p>");
        
        return body.ToString();
    }

    // Método para implementar envío real de email (futuro)
    private async Task SendEmailAsync(string email, string subject, string body)
    {
        // Aquí se implementaría el envío real de email
        // Por ejemplo, usando SendGrid, SMTP, etc.
        await Task.CompletedTask;
    }
}

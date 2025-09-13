# Script para verificar usuarios en la base de datos
$baseUrl = "http://localhost:5175"

Write-Host "Verificando usuarios en la base de datos..." -ForegroundColor Green

# Probar con diferentes usuarios
$users = @(
    @{ email = "test@example.com"; password = "password123" },
    @{ email = "armador@example.com"; password = "password123" },
    @{ email = "cobrador@example.com"; password = "password123" }
)

foreach ($user in $users) {
    Write-Host "Probando: $($user.email)" -ForegroundColor Yellow
    
    $loginData = @{
        email = $user.email
        password = $user.password
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "✅ Login exitoso para $($user.email)" -ForegroundColor Green
        Write-Host "   Usuario: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor Cyan
        Write-Host "   Rol: $($response.user.roleName)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error para $($user.email): $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Respuesta: $responseBody" -ForegroundColor Red
        }
    }
    Write-Host ""
}

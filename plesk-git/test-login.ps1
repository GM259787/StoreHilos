# Script para probar el login
$baseUrl = "http://localhost:5175"

Write-Host "Probando login con usuario de prueba..." -ForegroundColor Green

# Datos de prueba
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "Login exitoso!" -ForegroundColor Green
    Write-Host "Usuario: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor Yellow
    Write-Host "Rol: $($response.user.roleName)" -ForegroundColor Yellow
    Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Yellow
} catch {
    Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor: $responseBody" -ForegroundColor Red
    }
}

# Script para probar el endpoint del carrito
$baseUrl = "http://localhost:5175"

Write-Host "Probando endpoints del carrito..." -ForegroundColor Green

# Primero hacer login para obtener token
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    Write-Host "1. Haciendo login..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
    
    # Configurar headers con token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Probar GET /api/cart
    Write-Host "`n2. Probando GET /api/cart..." -ForegroundColor Yellow
    try {
        $cartResponse = Invoke-RestMethod -Uri "$baseUrl/api/cart" -Method GET -Headers $headers
        Write-Host "✅ GET /api/cart exitoso" -ForegroundColor Green
        Write-Host "Items en carrito: $($cartResponse.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error en GET /api/cart: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Probar POST /api/cart/sync
    Write-Host "`n3. Probando POST /api/cart/sync..." -ForegroundColor Yellow
    $syncData = @{
        items = @(
            @{ productId = 1; quantity = 2 },
            @{ productId = 2; quantity = 1 }
        )
    } | ConvertTo-Json
    
    try {
        $syncResponse = Invoke-RestMethod -Uri "$baseUrl/api/cart/sync" -Method POST -Body $syncData -Headers $headers
        Write-Host "✅ POST /api/cart/sync exitoso" -ForegroundColor Green
        Write-Host "Respuesta: $($syncResponse.message)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error en POST /api/cart/sync: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Respuesta del servidor: $responseBody" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
}

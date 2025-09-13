# Script para probar el flujo completo del frontend
$baseUrl = "http://localhost:5175"

Write-Host "Probando flujo completo del frontend..." -ForegroundColor Green

# 1. Login
Write-Host "`n1. Haciendo login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Usuario: $($loginResponse.user.firstName) $($loginResponse.user.lastName)" -ForegroundColor Cyan
    Write-Host "Rol: $($loginResponse.user.roleName)" -ForegroundColor Cyan
    
    # Configurar headers con token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # 2. Sincronizar carrito
    Write-Host "`n2. Sincronizando carrito..." -ForegroundColor Yellow
    $syncData = @{
        items = @(
            @{ productId = 1; quantity = 2 },
            @{ productId = 2; quantity = 1 }
        )
    } | ConvertTo-Json
    
    $syncResponse = Invoke-RestMethod -Uri "$baseUrl/api/cart/sync" -Method POST -Body $syncData -Headers $headers
    Write-Host "✅ Carrito sincronizado" -ForegroundColor Green
    
    # 3. Crear orden
    Write-Host "`n3. Creando orden..." -ForegroundColor Yellow
    $orderData = @{
        shippingAddress = "Dirección de envío"
        shippingCity = "Ciudad"
        shippingPostalCode = "00000"
        notes = "Pedido desde el carrito"
    } | ConvertTo-Json
    
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method POST -Body $orderData -Headers $headers
    Write-Host "✅ Orden creada exitosamente" -ForegroundColor Green
    Write-Host "Número de orden: $($orderResponse.orderNumber)" -ForegroundColor Cyan
    Write-Host "Total: $($orderResponse.totalAmount)" -ForegroundColor Cyan
    Write-Host "Items: $($orderResponse.items.Count)" -ForegroundColor Cyan
    
    # 4. Verificar que el carrito se limpió
    Write-Host "`n4. Verificando que el carrito se limpió..." -ForegroundColor Yellow
    $cartResponse = Invoke-RestMethod -Uri "$baseUrl/api/cart" -Method GET -Headers $headers
    Write-Host "✅ Carrito vacío: $($cartResponse.Count) items" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Respuesta del servidor: $responseBody" -ForegroundColor Red
    }
}

# Script de Prueba PlaceToPay
# Ejecutar desde: D:\Proyectos\TiendaOnline\StoreHilos\server
# Comando: .\test-placetopay.ps1

Write-Host "`n===== PRUEBA PLACETOPAY =====" -ForegroundColor Cyan

$baseUrl = "http://localhost:5175/api"

try {
    Write-Host "`n[1] Login..." -ForegroundColor White
    $loginBody = @{
        email = "test@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    $token = $loginResponse.token
    $headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
    Write-Host "    Login exitoso" -ForegroundColor Green
    
    Write-Host "`n[2] Obtener productos..." -ForegroundColor White
    $products = Invoke-RestMethod -Uri "$baseUrl/Products?pageSize=5" -Method GET -ErrorAction Stop
    $firstProduct = $products.items[0]
    Write-Host "    Producto: $($firstProduct.name) - $($firstProduct.price) UYU" -ForegroundColor Green
    
    Write-Host "`n[3] Limpiar carrito..." -ForegroundColor White
    $clearCartBody = @{ items = @() } | ConvertTo-Json
    try { Invoke-RestMethod -Uri "$baseUrl/Cart/sync" -Method POST -Headers $headers -Body $clearCartBody -ErrorAction SilentlyContinue | Out-Null } catch {}
    Write-Host "    Carrito limpio" -ForegroundColor Green
    
    Write-Host "`n[4] Agregar al carrito..." -ForegroundColor White
    $addCartBody = @{ 
        items = @(
            @{ productId = $firstProduct.id; quantity = 2 }
        )
    } | ConvertTo-Json -Depth 3
    Invoke-RestMethod -Uri "$baseUrl/Cart/sync" -Method POST -Headers $headers -Body $addCartBody -ErrorAction Stop | Out-Null
    Write-Host "    Producto agregado" -ForegroundColor Green
    
    Write-Host "`n[5] Verificar carrito..." -ForegroundColor White
    $cart = Invoke-RestMethod -Uri "$baseUrl/Cart" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "    Items en carrito: $($cart.Count)" -ForegroundColor Green
    
    Write-Host "`n[6] Crear sesión PlaceToPay..." -ForegroundColor White
    $paymentBody = @{
        shippingAddress = "Av. 18 de Julio 1234"
        shippingCity = "Montevideo"
        shippingPostalCode = "11200"
        notes = "Prueba automatizada PlaceToPay"
    } | ConvertTo-Json
    $paymentSession = Invoke-RestMethod -Uri "$baseUrl/payment/placetopay/create-session" -Method POST -Headers $headers -Body $paymentBody -ErrorAction Stop
    Write-Host "    Sesión creada - RequestID: $($paymentSession.requestId)" -ForegroundColor Green
    Write-Host "    OrderID: $($paymentSession.orderId)" -ForegroundColor Green
    
    Write-Host "`n[7] Abriendo navegador..." -ForegroundColor White
    Write-Host "    URL: $($paymentSession.processUrl)" -ForegroundColor Yellow
    Start-Process $paymentSession.processUrl
    
    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "DATOS DE TARJETA DE PRUEBA:" -ForegroundColor Magenta
    Write-Host "Número: 4111 1111 1111 1111" -ForegroundColor White
    Write-Host "CVV: 123" -ForegroundColor White
    Write-Host "Vence: 12/26" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Magenta
    
    Write-Host "`nPresiona ENTER cuando hayas terminado..." -ForegroundColor Cyan
    Read-Host
    
    Write-Host "`nConsultando estado..." -ForegroundColor Cyan
    Start-Sleep -Seconds 3
    $status = Invoke-RestMethod -Uri "$baseUrl/payment/placetopay/status/$($paymentSession.orderId)" -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "RESULTADO:" -ForegroundColor Cyan
    Write-Host "Estado: $($status.status)" -ForegroundColor $(if ($status.status -eq "APPROVED") { "Green" } else { "Yellow" })
    Write-Host "Pagado: $($status.isPaid)" -ForegroundColor White
    Write-Host "Orden: $($status.orderNumber)" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "$($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n===== FIN =====" -ForegroundColor Cyan

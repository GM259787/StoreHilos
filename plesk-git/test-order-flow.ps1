# Script para probar el flujo completo de generación de pedidos
$baseUrl = "http://localhost:5175"

Write-Host "🚀 Probando flujo completo de generación de pedidos..." -ForegroundColor Green

function Test-Response {
    param($response, $description)
    try {
        Write-Host "✅ $description - Exitoso" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $description - Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Respuesta del servidor: $responseBody" -ForegroundColor Red
        }
        return $false
    }
}

try {
    # 1. Login
    Write-Host "`n1️⃣  Haciendo login..." -ForegroundColor Yellow
    $loginData = @{
        email = "test@example.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    
    if (-not $token) {
        throw "No se recibió token de autenticación"
    }
    
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "   Usuario: $($loginResponse.user.firstName) $($loginResponse.user.lastName)" -ForegroundColor Cyan
    Write-Host "   Rol: $($loginResponse.user.role)" -ForegroundColor Cyan
    
    # Configurar headers con token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # 2. Verificar productos disponibles
    Write-Host "`n2️⃣  Verificando productos disponibles..." -ForegroundColor Yellow
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET -Headers $headers
    
    if ($productsResponse.items.Count -eq 0) {
        throw "No hay productos disponibles para probar"
    }
    
    Write-Host "✅ Productos disponibles: $($productsResponse.items.Count)" -ForegroundColor Green
    $testProduct1 = $productsResponse.items[0]
    $testProduct2 = $productsResponse.items[1]
    Write-Host "   Producto 1: $($testProduct1.name) - Stock: $($testProduct1.stock)" -ForegroundColor Cyan
    Write-Host "   Producto 2: $($testProduct2.name) - Stock: $($testProduct2.stock)" -ForegroundColor Cyan
    
    # 3. Sincronizar carrito
    Write-Host "`n3️⃣  Sincronizando carrito..." -ForegroundColor Yellow
    $syncData = @{
        items = @(
            @{ productId = $testProduct1.id; quantity = 2 },
            @{ productId = $testProduct2.id; quantity = 1 }
        )
    } | ConvertTo-Json
    
    $syncResponse = Invoke-RestMethod -Uri "$baseUrl/api/cart/sync" -Method POST -Body $syncData -Headers $headers
    Write-Host "✅ Carrito sincronizado" -ForegroundColor Green
    Write-Host "   Respuesta: $($syncResponse.message)" -ForegroundColor Cyan
    
    # 4. Verificar carrito
    Write-Host "`n4️⃣  Verificando carrito..." -ForegroundColor Yellow
    $cartResponse = Invoke-RestMethod -Uri "$baseUrl/api/cart" -Method GET -Headers $headers
    Write-Host "✅ Carrito verificado - Items: $($cartResponse.Count)" -ForegroundColor Green
    
    # 5. Crear orden
    Write-Host "`n5️⃣  Creando orden..." -ForegroundColor Yellow
    $orderData = @{
        shippingAddress = "Av. Principal 123"
        shippingCity = "Buenos Aires"
        shippingPostalCode = "1000"
        notes = "Pedido de prueba automatizada"
    } | ConvertTo-Json
    
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method POST -Body $orderData -Headers $headers
    Write-Host "✅ Orden creada exitosamente" -ForegroundColor Green
    Write-Host "   Número de orden: $($orderResponse.orderNumber)" -ForegroundColor Cyan
    Write-Host "   Subtotal: $($orderResponse.subTotal)" -ForegroundColor Cyan
    Write-Host "   IVA (22%): $($orderResponse.taxAmount)" -ForegroundColor Cyan
    Write-Host "   Envío: $($orderResponse.shippingAmount)" -ForegroundColor Cyan
    Write-Host "   Total: $($orderResponse.totalAmount)" -ForegroundColor Cyan
    Write-Host "   Items: $($orderResponse.items.Count)" -ForegroundColor Cyan
    Write-Host "   Cliente: $($orderResponse.customerName)" -ForegroundColor Cyan
    
    # 6. Verificar que el carrito se limpió
    Write-Host "`n6️⃣  Verificando que el carrito se limpió..." -ForegroundColor Yellow
    $cartAfterResponse = Invoke-RestMethod -Uri "$baseUrl/api/cart" -Method GET -Headers $headers
    
    if ($cartAfterResponse.Count -eq 0) {
        Write-Host "✅ Carrito limpiado correctamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️  El carrito aún tiene $($cartAfterResponse.Count) items" -ForegroundColor Yellow
    }
    
    # 7. Verificar la orden creada
    Write-Host "`n7️⃣  Verificando orden en la lista de pedidos..." -ForegroundColor Yellow
    $ordersResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method GET -Headers $headers
    
    $createdOrder = $ordersResponse | Where-Object { $_.orderNumber -eq $orderResponse.orderNumber }
    if ($createdOrder) {
        Write-Host "✅ Orden encontrada en la lista de pedidos" -ForegroundColor Green
        Write-Host "   Estado: $($createdOrder.status)" -ForegroundColor Cyan
        Write-Host "   Pagado: $($createdOrder.isPaid)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Orden no encontrada en la lista de pedidos" -ForegroundColor Red
    }
    
    Write-Host "`n🎉 FLUJO DE PEDIDOS COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "   Orden número: $($orderResponse.orderNumber)" -ForegroundColor White
    Write-Host "   Total pagado: $($orderResponse.totalAmount)" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ ERROR EN EL FLUJO DE PEDIDOS:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Respuesta del servidor: $responseBody" -ForegroundColor Red
    }
    
    Write-Host "`n🔍 PASOS PARA DEBUGGEAR:" -ForegroundColor Yellow
    Write-Host "   1. Verificar que el servidor esté ejecutándose en puerto 5175" -ForegroundColor White
    Write-Host "   2. Verificar que la base de datos tenga productos" -ForegroundColor White
    Write-Host "   3. Verificar que el usuario test@example.com exista" -ForegroundColor White
    Write-Host "   4. Revisar los logs del servidor para más detalles" -ForegroundColor White
}

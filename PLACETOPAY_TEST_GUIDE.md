# Guía de Pruebas PlaceToPay (GetNet)

## Configuración de Pruebas

Las credenciales de prueba ya están configuradas en `appsettings.Development.json`:

- **Endpoint:** `https://uy-uat-checkout.placetopay.com`
- **Login:** `67fc909e044bd54c56791f1236645552`
- **Secret Key:** `k563s2i4g31vUADo`

## Tarjetas de Prueba

Documentación completa: https://docs.placetopay.dev/gateway/testing-card

### Tarjetas para Aprobar Transacciones

| Tarjeta | Número | CVV | Fecha Exp. | Resultado |
|---------|--------|-----|------------|-----------|
| Visa | 4111111111111111 | 123 | 12/25 | APPROVED |
| Mastercard | 5500000000000004 | 123 | 12/25 | APPROVED |
| American Express | 370000000000002 | 1234 | 12/25 | APPROVED |

### Tarjetas para Rechazar Transacciones

| Tarjeta | Número | CVV | Fecha Exp. | Resultado |
|---------|--------|-----|------------|-----------|
| Visa | 4111111111111129 | 123 | 12/25 | REJECTED (Fondos insuficientes) |
| Mastercard | 5500000000000012 | 123 | 12/25 | REJECTED (Tarjeta bloqueada) |

## Flujo de Prueba Completo

### 1. Preparar el Carrito

```http
### Login del usuario
POST http://localhost:5175/api/auth/login
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "Cliente123!"
}

### Agregar productos al carrito (usar el token del login)
POST http://localhost:5175/api/cart/add
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "productId": 1,
  "quantity": 2
}

### Ver el carrito
GET http://localhost:5175/api/cart
Authorization: Bearer YOUR_TOKEN_HERE
```

### 2. Crear Sesión de Pago con PlaceToPay

```http
POST http://localhost:5175/api/payment/placetopay/create-session
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "shippingAddress": "Av. 18 de Julio 1234",
  "shippingCity": "Montevideo",
  "shippingPostalCode": "11200",
  "notes": "Prueba de pago con PlaceToPay"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "requestId": 12345,
  "processUrl": "https://uy-uat-checkout.placetopay.com/session/12345/...",
  "orderId": 1,
  "message": "Sesión de pago creada exitosamente"
}
```

### 3. Proceso de Pago

1. **Abrir el `processUrl`** en un navegador
2. El usuario será redirigido al checkout de PlaceToPay
3. **Completar el formulario:**
   - Nombre: Test User
   - Email: test@example.com
   - Teléfono: +598 99 123 456
   - Tarjeta: **4111111111111111** (Visa - Aprueba)
   - CVV: **123**
   - Fecha: **12/25**

4. PlaceToPay procesará el pago y redirigirá a:
   ```
   http://localhost:5173/payment/return?orderId=1
   ```

### 4. Consultar Estado del Pago

```http
GET http://localhost:5175/api/payment/placetopay/status/1
Authorization: Bearer YOUR_TOKEN_HERE
```

**Respuesta esperada (pago aprobado):**
```json
{
  "requestId": 12345,
  "status": "APPROVED",
  "message": "La petición ha sido aprobada exitosamente",
  "orderId": 1,
  "orderNumber": "ORD-20260126123456-1234",
  "isPaid": true,
  "orderStatus": "Confirmed"
}
```

### 5. Verificar Webhook (Automático)

PlaceToPay enviará automáticamente una notificación al webhook:
```
POST http://localhost:5175/api/payment/placetopay/webhook
```

El webhook actualizará el estado del pedido automáticamente.

## Casos de Prueba

### ✅ Caso 1: Pago Aprobado
- **Tarjeta:** 4111111111111111
- **Resultado esperado:** 
  - Status: `APPROVED`
  - `order.IsPaid = true`
  - `order.Status = "Confirmed"`
  - `order.PaymentDate` establecida

### ❌ Caso 2: Pago Rechazado
- **Tarjeta:** 4111111111111129
- **Resultado esperado:**
  - Status: `REJECTED`
  - `order.IsPaid = false`
  - `order.Status = "Cancelled"`

### ⏳ Caso 3: Pago Pendiente
- Cerrar la ventana antes de completar el pago
- **Resultado esperado:**
  - Status: `PENDING`
  - `order.IsPaid = false`
  - `order.Status = "Pending"`

## Script PowerShell de Prueba Completo

Ejecutar desde el directorio raíz del proyecto:

```powershell
# Variables
$baseUrl = "http://localhost:5175/api"
$frontendUrl = "http://localhost:5173"

# 1. Login
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body (@{
    email = "cliente@example.com"
    password = "Cliente123!"
} | ConvertTo-Json)

$token = $loginResponse.token
Write-Host "✓ Login exitoso. Token obtenido." -ForegroundColor Green

# 2. Agregar producto al carrito
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "$baseUrl/cart/add" -Method POST -Headers $headers -ContentType "application/json" -Body (@{
    productId = 1
    quantity = 2
} | ConvertTo-Json) | Out-Null

Write-Host "✓ Producto agregado al carrito." -ForegroundColor Green

# 3. Ver carrito
$cart = Invoke-RestMethod -Uri "$baseUrl/cart" -Method GET -Headers $headers
Write-Host "✓ Carrito: $($cart.items.Count) items, Total: $($cart.totalAmount)" -ForegroundColor Green

# 4. Crear sesión de PlaceToPay
$paymentSession = Invoke-RestMethod -Uri "$baseUrl/payment/placetopay/create-session" -Method POST -Headers $headers -ContentType "application/json" -Body (@{
    shippingAddress = "Av. 18 de Julio 1234"
    shippingCity = "Montevideo"
    shippingPostalCode = "11200"
    notes = "Prueba de pago con PlaceToPay"
} | ConvertTo-Json)

Write-Host "✓ Sesión de pago creada." -ForegroundColor Green
Write-Host "  RequestId: $($paymentSession.requestId)" -ForegroundColor Cyan
Write-Host "  OrderId: $($paymentSession.orderId)" -ForegroundColor Cyan
Write-Host "  ProcessUrl: $($paymentSession.processUrl)" -ForegroundColor Yellow

# 5. Abrir URL de pago en el navegador
Start-Process $paymentSession.processUrl
Write-Host "`n✓ Abriendo navegador para completar el pago..." -ForegroundColor Green
Write-Host "  Usa la tarjeta: 4111111111111111" -ForegroundColor Yellow
Write-Host "  CVV: 123, Fecha: 12/25" -ForegroundColor Yellow

# 6. Esperar y consultar estado
Write-Host "`nEsperando 30 segundos para que completes el pago..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

$status = Invoke-RestMethod -Uri "$baseUrl/payment/placetopay/status/$($paymentSession.orderId)" -Method GET -Headers $headers
Write-Host "`n✓ Estado del pago:" -ForegroundColor Green
Write-Host "  Status: $($status.status)" -ForegroundColor $(if ($status.status -eq "APPROVED") { "Green" } else { "Yellow" })
Write-Host "  Message: $($status.message)" -ForegroundColor Cyan
Write-Host "  IsPaid: $($status.isPaid)" -ForegroundColor Cyan
Write-Host "  OrderStatus: $($status.orderStatus)" -ForegroundColor Cyan

if ($status.isPaid) {
    Write-Host "`n✅ ¡PRUEBA EXITOSA! El pago fue aprobado." -ForegroundColor Green
} else {
    Write-Host "`n⏳ El pago está $($status.status). Espera o vuelve a consultar." -ForegroundColor Yellow
}
```

## Verificación en Base de Datos

Después de realizar un pago, puedes verificar en MySQL:

```sql
-- Ver pedidos con información de pago
SELECT 
    Id,
    OrderNumber,
    Status,
    IsPaid,
    TotalAmount,
    PaymentMethod,
    PaymentStatus,
    PlaceToPayRequestId,
    PaymentDate,
    CreatedAt
FROM Orders
ORDER BY CreatedAt DESC
LIMIT 5;

-- Ver items del pedido
SELECT 
    o.OrderNumber,
    oi.ProductName,
    oi.Quantity,
    oi.ProductPrice,
    oi.SubTotal
FROM Orders o
JOIN OrderItems oi ON o.Id = oi.OrderId
WHERE o.Id = 1; -- Reemplazar con el ID del pedido
```

## Notas Importantes

1. **El servidor debe estar corriendo:** `dotnet run` en el directorio `server/`
2. **El frontend debe estar corriendo:** `npm run dev` en el directorio `client/`
3. **La base de datos debe estar accesible** (XAMPP con MySQL)
4. **Los productos deben existir** en la base de datos (se crean automáticamente al iniciar)

## Estados Posibles de PlaceToPay

- `PENDING`: Pago pendiente (usuario no completó el proceso)
- `APPROVED`: Pago aprobado exitosamente
- `REJECTED`: Pago rechazado (tarjeta inválida, fondos insuficientes, etc.)
- `APPROVED_PARTIAL`: Pago parcial aprobado (para pagos en cuotas)
- `PARTIAL_EXPIRED`: Pago parcial expirado
- `EXPIRED`: Sesión expirada sin completar el pago

## Soporte

- Documentación: https://docs.placetopay.dev/checkout
- Tarjetas de prueba: https://docs.placetopay.dev/gateway/testing-card

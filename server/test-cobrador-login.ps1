# Script para probar el login del usuario Cobrador
$baseUrl = "http://localhost:5175"

Write-Host "Probando login del usuario Cobrador..." -ForegroundColor Green

# Datos del usuario Cobrador
$loginData = @{
    email = "cobrador@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    # Intentar login
    Write-Host "1. Intentando login con cobrador@example.com..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "✅ Login exitoso!" -ForegroundColor Green
        Write-Host "Token: $($loginResponse.token.Substring(0, 50))..." -ForegroundColor Gray
        
        $headers = @{
            "Authorization" = "Bearer $($loginResponse.token)"
            "Content-Type" = "application/json"
        }
        
        # Verificar información del usuario
        Write-Host "`n2. Verificando información del usuario..." -ForegroundColor Yellow
        $userResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
        Write-Host "✅ Usuario: $($userResponse.firstName) $($userResponse.lastName)" -ForegroundColor Green
        Write-Host "✅ Email: $($userResponse.email)" -ForegroundColor Green
        Write-Host "✅ Rol: $($userResponse.role)" -ForegroundColor Green
        
        # Probar acceso a gestión de productos
        Write-Host "`n3. Probando acceso a gestión de productos..." -ForegroundColor Yellow
        try {
            $productsResponse = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET -Headers $headers
            Write-Host "✅ Acceso a productos exitoso. Total: $($productsResponse.items.Count)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error accediendo a productos: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Probar creación de producto (solo Cobrador puede hacer esto)
        Write-Host "`n4. Probando creación de producto..." -ForegroundColor Yellow
        $newProduct = @{
            name = "Producto de Prueba - Cobrador"
            description = "Producto creado por el usuario Cobrador"
            imageUrl = "/data/Hilos/270_1000_01.jpg"
            stock = 10
            price = 15.99
            categoryId = 1
        } | ConvertTo-Json
        
        try {
            $createResponse = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method POST -Body $newProduct -Headers $headers
            Write-Host "✅ Producto creado exitosamente: $($createResponse.name)" -ForegroundColor Green
            Write-Host "✅ ID del producto: $($createResponse.id)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error creando producto: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Login falló - No se recibió token" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error en el login: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nPrueba completada." -ForegroundColor Green

# 🔍 Script de Verificación de Deployment
# Ejecutar después de completar el deployment en Plesk

param(
    [string]$Domain = "",
    [string]$ApiEndpoint = "/api"
)

Write-Host "🔍 Verificando deployment en Plesk..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

if ([string]::IsNullOrEmpty($Domain)) {
    Write-Host "❌ Error: Debes especificar el dominio con -Domain" -ForegroundColor Red
    Write-Host "Ejemplo: .\verificar-deployment.ps1 -Domain 'tudominio.com'" -ForegroundColor Yellow
    exit 1
}

$baseUrl = "https://$Domain"
$apiUrl = "$baseUrl$ApiEndpoint"

Write-Host "🌐 Verificando: $baseUrl" -ForegroundColor Yellow
Write-Host "🔗 API: $apiUrl" -ForegroundColor Yellow
Write-Host ""

# Función para hacer peticiones HTTP
function Test-HttpEndpoint {
    param(
        [string]$Url,
        [string]$Description
    )
    
    try {
        Write-Host "🔍 Verificando $Description..." -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 30 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Description - OK (Status: $($response.StatusCode))" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️ $Description - Status: $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "❌ $Description - Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para verificar JSON
function Test-JsonEndpoint {
    param(
        [string]$Url,
        [string]$Description
    )
    
    try {
        Write-Host "🔍 Verificando $Description..." -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 30 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            $json = $response.Content | ConvertFrom-Json
            Write-Host "✅ $Description - OK (JSON válido)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️ $Description - Status: $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "❌ $Description - Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Verificaciones
$results = @()

Write-Host "📋 INICIANDO VERIFICACIONES..." -ForegroundColor Magenta
Write-Host ""

# 1. Verificar página principal
$results += Test-HttpEndpoint -Url $baseUrl -Description "Página Principal"

# 2. Verificar API de categorías
$results += Test-JsonEndpoint -Url "$apiUrl/categories" -Description "API Categorías"

# 3. Verificar API de productos
$results += Test-JsonEndpoint -Url "$apiUrl/products" -Description "API Productos"

# 4. Verificar API de autenticación
$results += Test-JsonEndpoint -Url "$apiUrl/auth/me" -Description "API Autenticación"

# 5. Verificar archivos estáticos
$results += Test-HttpEndpoint -Url "$baseUrl/favicon.ico" -Description "Archivos Estáticos"

# 6. Verificar SSL
try {
    Write-Host "🔍 Verificando SSL..." -ForegroundColor Yellow
    $request = [System.Net.WebRequest]::Create($baseUrl)
    $request.GetResponse()
    Write-Host "✅ SSL - OK (HTTPS funcionando)" -ForegroundColor Green
    $results += $true
}
catch {
    Write-Host "❌ SSL - Error: $($_.Exception.Message)" -ForegroundColor Red
    $results += $false
}

Write-Host ""
Write-Host "📊 RESUMEN DE VERIFICACIONES" -ForegroundColor Magenta
Write-Host "===============================================" -ForegroundColor Cyan

$passed = ($results | Where-Object { $_ -eq $true }).Count
$total = $results.Count
$percentage = [math]::Round(($passed / $total) * 100, 2)

Write-Host "✅ Verificaciones exitosas: $passed/$total ($percentage%)" -ForegroundColor Green

if ($percentage -eq 100) {
    Write-Host "🎉 ¡Deployment completamente exitoso!" -ForegroundColor Green
} elseif ($percentage -ge 80) {
    Write-Host "⚠️ Deployment mayormente exitoso, revisar errores menores" -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment con problemas, revisar configuración" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 PRÓXIMOS PASOS RECOMENDADOS:" -ForegroundColor Magenta

if ($percentage -eq 100) {
    Write-Host "1. ✅ Configurar MercadoPago con credenciales reales" -ForegroundColor White
    Write-Host "2. ✅ Probar flujo completo de compra" -ForegroundColor White
    Write-Host "3. ✅ Configurar respaldos automáticos" -ForegroundColor White
    Write-Host "4. ✅ Configurar monitoreo de uptime" -ForegroundColor White
} else {
    Write-Host "1. 🔧 Revisar logs en Plesk Panel" -ForegroundColor White
    Write-Host "2. 🔧 Verificar configuración de base de datos" -ForegroundColor White
    Write-Host "3. 🔧 Verificar variables de entorno" -ForegroundColor White
    Write-Host "4. 🔧 Verificar configuración de SSL" -ForegroundColor White
}

Write-Host ""
Write-Host "📞 SOPORTE:" -ForegroundColor Magenta
Write-Host "- Logs de Plesk: Panel > Logs" -ForegroundColor White
Write-Host "- Logs de aplicación: Panel > Aplicaciones > Logs" -ForegroundColor White
Write-Host "- Base de datos: phpMyAdmin" -ForegroundColor White

Write-Host ""
Write-Host "🌐 URLs importantes:" -ForegroundColor Cyan
Write-Host "- Aplicación: $baseUrl" -ForegroundColor White
Write-Host "- API: $apiUrl" -ForegroundColor White
Write-Host "- Admin: $baseUrl/admin" -ForegroundColor White

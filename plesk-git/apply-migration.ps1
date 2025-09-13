# Script para aplicar la migración de ShippingProofUrl
Write-Host "🚀 Aplicando migración para agregar ShippingProofUrl..." -ForegroundColor Green

try {
    # Detener el servidor si está ejecutándose
    $dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
    if ($dotnetProcesses) {
        Write-Host "⏹️ Deteniendo servidor..." -ForegroundColor Yellow
        $dotnetProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2
    }

    # Aplicar la migración
    Write-Host "📦 Aplicando migración..." -ForegroundColor Blue
    dotnet ef database update
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migración aplicada exitosamente!" -ForegroundColor Green
        Write-Host "🔄 Ahora puedes ejecutar 'dotnet run' para iniciar el servidor" -ForegroundColor Blue
    } else {
        Write-Host "❌ Error al aplicar la migración" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

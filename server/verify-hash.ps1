# Script para verificar el hash de la contraseña
Add-Type -AssemblyName System.Security

$password = "password123"
$expectedHash = "jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg="

Write-Host "Verificando hash de contraseña..." -ForegroundColor Green
Write-Host "Contraseña: $password" -ForegroundColor Yellow
Write-Host "Hash esperado: $expectedHash" -ForegroundColor Yellow

# Calcular hash usando SHA256
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$bytes = [System.Text.Encoding]::UTF8.GetBytes($password)
$hashBytes = $sha256.ComputeHash($bytes)
$calculatedHash = [Convert]::ToBase64String($hashBytes)

Write-Host "Hash calculado: $calculatedHash" -ForegroundColor Cyan

if ($calculatedHash -eq $expectedHash) {
    Write-Host "✅ Hash coincide!" -ForegroundColor Green
} else {
    Write-Host "❌ Hash NO coincide!" -ForegroundColor Red
}

$sha256.Dispose()

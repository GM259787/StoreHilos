# Script para verificar el estado de la base de datos
Write-Host "Verificando estado de la base de datos..." -ForegroundColor Yellow

# Verificar si XAMPP está corriendo
$mysqlProcess = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
if ($mysqlProcess) {
    Write-Host "✅ MySQL está corriendo" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL no está corriendo. Inicia XAMPP primero." -ForegroundColor Red
    exit 1
}

# Verificar conexión a la base de datos
try {
    $connectionString = "Server=localhost;Database=AppDb;Uid=root;Pwd=;"
    $connection = New-Object MySql.Data.MySqlClient.MySqlConnection($connectionString)
    $connection.Open()
    Write-Host "✅ Conexión a la base de datos exitosa" -ForegroundColor Green
    
    # Verificar tablas existentes
    $command = $connection.CreateCommand()
    $command.CommandText = "SHOW TABLES;"
    $reader = $command.ExecuteReader()
    
    $tables = @()
    while ($reader.Read()) {
        $tables += $reader[0]
    }
    $reader.Close()
    
    Write-Host "📋 Tablas existentes:" -ForegroundColor Cyan
    foreach ($table in $tables) {
        Write-Host "  - $table" -ForegroundColor White
    }
    
    # Verificar si existe la tabla de migraciones
    if ($tables -contains "__EFMigrationsHistory") {
        Write-Host "✅ Tabla de migraciones existe" -ForegroundColor Green
        
        # Verificar migraciones aplicadas
        $command.CommandText = "SELECT MigrationId FROM __EFMigrationsHistory ORDER BY MigrationId;"
        $reader = $command.ExecuteReader()
        
        $migrations = @()
        while ($reader.Read()) {
            $migrations += $reader[0]
        }
        $reader.Close()
        
        Write-Host "📋 Migraciones aplicadas:" -ForegroundColor Cyan
        foreach ($migration in $migrations) {
            Write-Host "  - $migration" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Tabla de migraciones NO existe" -ForegroundColor Red
        Write-Host "💡 Esto explica por qué EF intenta crear las tablas de nuevo" -ForegroundColor Yellow
    }
    
    $connection.Close()
    
} catch {
    Write-Host "❌ Error conectando a la base de datos: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎯 Recomendaciones:" -ForegroundColor Yellow
if ($tables -contains "__EFMigrationsHistory") {
    Write-Host "  - La base de datos está configurada correctamente" -ForegroundColor Green
    Write-Host "  - Puedes ejecutar la aplicación normalmente" -ForegroundColor Green
} else {
    Write-Host "  - Necesitas crear la tabla de migraciones manualmente" -ForegroundColor Yellow
    Write-Host "  - O eliminar todas las tablas y dejar que EF las cree" -ForegroundColor Yellow
}

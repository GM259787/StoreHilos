# Configuración de Base de Datos

## Problema Resuelto

La aplicación ahora maneja correctamente la persistencia de datos tanto en desarrollo local como en producción.

## Configuraciones Disponibles

### 1. Desarrollo Local (SQLite)
- **Archivo**: `appsettings.Local.json`
- **Base de datos**: SQLite (`Data/app.db`)
- **Uso**: Para desarrollo rápido sin Docker
- **Persistencia**: Los datos se mantienen en el archivo local

### 2. Desarrollo con Docker (PostgreSQL)
- **Archivo**: `appsettings.Development.json` (cuando se usa con Docker)
- **Base de datos**: PostgreSQL en contenedor
- **Uso**: Para desarrollo con Docker Compose
- **Persistencia**: Los datos se mantienen en el volumen `postgres_data`

### 3. Producción (PostgreSQL)
- **Archivo**: `appsettings.Production.json`
- **Base de datos**: PostgreSQL
- **Uso**: Para despliegue en producción
- **Persistencia**: Configurar según el proveedor de hosting

## Scripts de Cambio

### Cambiar a Desarrollo Local
```powershell
.\switch-to-local.ps1
dotnet run
```

### Cambiar a Docker
```powershell
.\switch-to-docker.ps1
docker-compose up
```

## Migraciones

### Para SQLite (desarrollo local)
```bash
dotnet ef migrations add NombreMigracion
dotnet ef database update
```

### Para PostgreSQL (Docker/Producción)
```bash
dotnet ef migrations add NombreMigracion
dotnet ef database update
```

## Volúmenes Docker

El `docker-compose.yml` incluye:
- **postgres_data**: Volumen persistente para PostgreSQL
- **Health checks**: Verificación de estado de la base de datos
- **Dependencies**: La API espera a que PostgreSQL esté listo

## Solución de Problemas

### Datos no persisten en desarrollo local
- Verificar que `appsettings.Development.json` use SQLite
- Ejecutar `.\switch-to-local.ps1`

### Datos no persisten en Docker
- Verificar que el volumen `postgres_data` esté configurado
- Ejecutar `docker-compose down -v` y `docker-compose up` para recrear volúmenes

### Error de conexión a PostgreSQL
- Verificar que el servicio `db` esté ejecutándose
- Revisar los logs: `docker-compose logs db`

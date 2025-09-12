# Infraestructura y Deployment

## Archivos de Configuración

### Docker Compose
- `docker-compose.yml` - Desarrollo local
- `docker-compose.prod.yml` - Producción

### Dockerfiles
- `Dockerfile.api` - Backend .NET
- `Dockerfile.client` - Frontend React

### Nginx
- `nginx.conf` - Configuración para desarrollo
- `nginx.prod.conf` - Configuración para producción

### Scripts
- `deploy.sh` - Script de deployment automático
- `backup.sh` - Script de respaldo de base de datos

## Deployment Rápido

### 1. Configurar Variables de Entorno
```bash
cp .env.example .env
nano .env  # Editar con tus valores
```

### 2. Deploy en Producción
```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Respaldo de Base de Datos
```bash
chmod +x backup.sh
./backup.sh
```

## Variables de Entorno Requeridas

```bash
# Base de Datos
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu-password-seguro
POSTGRES_CONNECTION_STRING=Host=db;Database=app;Username=postgres;Password=tu-password-seguro

# JWT
JWT_KEY=tu-clave-super-secreta-de-al-menos-32-caracteres
JWT_ISSUER=tu-dominio.com
JWT_AUDIENCE=tu-dominio.com

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
MERCADOPAGO_PUBLIC_KEY=tu-public-key
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret

# URLs
FRONTEND_URL=https://tu-dominio.com
BACKEND_URL=https://api.tu-dominio.com
```

## Comandos Útiles

### Desarrollo
```bash
# Iniciar en desarrollo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Producción
```bash
# Deploy completo
./deploy.sh

# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Respaldo
./backup.sh
```

### Mantenimiento
```bash
# Actualizar aplicación
git pull
./deploy.sh

# Limpiar imágenes no usadas
docker system prune -a

# Ver uso de espacio
docker system df
```


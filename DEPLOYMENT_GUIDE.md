# Guía de Deployment - E-commerce con MercadoPago

## Arquitectura de la Aplicación

Tu aplicación tiene una arquitectura moderna con:
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: .NET 8 + ASP.NET Core + Entity Framework
- **Base de Datos**: PostgreSQL
- **Pagos**: MercadoPago SDK
- **Contenedores**: Docker + Docker Compose

## Requisitos de Hosting

### Opción 1: VPS/Cloud Server (Recomendado)

#### Especificaciones Mínimas:
- **CPU**: 2 vCPU
- **RAM**: 4GB
- **Almacenamiento**: 50GB SSD
- **Red**: 1TB transferencia mensual
- **Sistema Operativo**: Ubuntu 20.04+ o CentOS 8+

#### Características Necesarias:
- ✅ **Docker y Docker Compose** instalados
- ✅ **Nginx** como proxy reverso
- ✅ **SSL/TLS** (Let's Encrypt)
- ✅ **PostgreSQL** (puede ser externo)
- ✅ **Dominio** configurado
- ✅ **Firewall** configurado

### Opción 2: Servicios Cloud Especializados

#### Para Backend (.NET):
- **Azure App Service** (Microsoft)
- **AWS Elastic Beanstalk** (Amazon)
- **Google Cloud Run** (Google)
- **DigitalOcean App Platform**

#### Para Frontend (React):
- **Vercel** (Recomendado para React)
- **Netlify**
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**

#### Para Base de Datos:
- **Azure Database for PostgreSQL**
- **AWS RDS PostgreSQL**
- **Google Cloud SQL**
- **DigitalOcean Managed Databases**

## Configuración de Producción

### Variables de Entorno Necesarias:

```bash
# Base de Datos
POSTGRES_HOST=tu-host-postgres
POSTGRES_DB=app
POSTGRES_USER=tu-usuario
POSTGRES_PASSWORD=tu-password-seguro

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

# Entorno
ASPNETCORE_ENVIRONMENT=Production
```

## Opciones de Hosting Recomendadas

### 🥇 Opción Premium: VPS con Docker

**Proveedores Recomendados:**
- **DigitalOcean**: $24/mes (2 vCPU, 4GB RAM)
- **Linode**: $24/mes (2 vCPU, 4GB RAM)
- **Vultr**: $24/mes (2 vCPU, 4GB RAM)
- **Hetzner**: €20/mes (2 vCPU, 4GB RAM)

**Ventajas:**
- Control total del servidor
- Costo fijo mensual
- Fácil escalamiento
- Docker nativo

### 🥈 Opción Intermedia: Servicios Cloud Separados

**Frontend (Vercel):**
- Plan Gratuito: 100GB bandwidth/mes
- Plan Pro: $20/mes (1TB bandwidth)

**Backend (Railway/Render):**
- Railway: $5/mes por servicio
- Render: $7/mes por servicio

**Base de Datos:**
- Railway PostgreSQL: $5/mes
- Render PostgreSQL: $7/mes

### 🥉 Opción Económica: Hosting Compartido + Base de Datos Externa

**Frontend:**
- Netlify/Vercel (Gratuito)

**Backend:**
- Hosting compartido con .NET: $10-20/mes
- O Railway/Render: $5-7/mes

**Base de Datos:**
- Supabase (Gratuito hasta 500MB)
- PlanetScale (Gratuito hasta 1GB)

## Pasos para Deployment

### 1. Preparar el Código

```bash
# Clonar el repositorio
git clone tu-repositorio
cd tu-proyecto

# Configurar variables de entorno
cp server/appsettings.Production.json server/appsettings.Production.json.backup
# Editar con tus valores reales
```

### 2. Configurar Dominio y SSL

```bash
# Configurar DNS
A record: tu-dominio.com -> IP_SERVIDOR
CNAME: api.tu-dominio.com -> tu-dominio.com

# Instalar Certbot para SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d api.tu-dominio.com
```

### 3. Deployment con Docker

```bash
# En el servidor
git pull origin main
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Configurar Nginx

```nginx
# /etc/nginx/sites-available/tu-dominio
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name tu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl;
    server_name api.tu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5175;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Costos Estimados

### Opción VPS (Recomendada):
- **VPS**: $24/mes
- **Dominio**: $12/año
- **SSL**: Gratuito (Let's Encrypt)
- **Total**: ~$25/mes

### Opción Cloud Separado:
- **Frontend (Vercel)**: $0-20/mes
- **Backend (Railway)**: $5/mes
- **Base de Datos**: $5/mes
- **Dominio**: $12/año
- **Total**: ~$10-30/mes

### Opción Económica:
- **Frontend**: Gratuito
- **Backend**: $5-10/mes
- **Base de Datos**: Gratuito (hasta límites)
- **Dominio**: $12/año
- **Total**: ~$5-10/mes

## Recomendación Final

Para tu e-commerce con MercadoPago, recomiendo:

1. **Empezar con**: VPS de DigitalOcean ($24/mes)
2. **Escalar a**: Servicios cloud separados cuando crezca
3. **Base de datos**: Siempre externa para respaldos

¿Te gustaría que configure alguna de estas opciones específicamente?

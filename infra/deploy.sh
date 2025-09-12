#!/bin/bash

# Script de deployment para producción
set -e

echo "🚀 Iniciando deployment de la aplicación..."

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "📝 Copia .env.example a .env y configura las variables"
    exit 1
fi

# Cargar variables de entorno
source .env

# Verificar variables críticas
if [ -z "$POSTGRES_PASSWORD" ] || [ -z "$JWT_KEY" ] || [ -z "$MERCADOPAGO_ACCESS_TOKEN" ]; then
    echo "❌ Error: Variables de entorno críticas no configuradas"
    echo "📝 Verifica POSTGRES_PASSWORD, JWT_KEY, MERCADOPAGO_ACCESS_TOKEN"
    exit 1
fi

echo "✅ Variables de entorno verificadas"

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.prod.yml down

# Construir nuevas imágenes
echo "🔨 Construyendo imágenes..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 30

# Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
docker-compose -f docker-compose.prod.yml exec api dotnet ef database update

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment completado exitosamente!"
echo "🌐 Frontend: $FRONTEND_URL"
echo "🔧 API: $BACKEND_URL"
echo "📊 Base de datos: PostgreSQL en puerto 5432"


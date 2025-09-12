#!/bin/bash

# Script de respaldo de base de datos
set -e

# Cargar variables de entorno
source .env

# Crear directorio de respaldo si no existe
mkdir -p backup

# Generar nombre de archivo con timestamp
BACKUP_FILE="backup/app_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "💾 Iniciando respaldo de base de datos..."

# Crear respaldo
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_FILE

# Comprimir respaldo
gzip $BACKUP_FILE

echo "✅ Respaldo creado: ${BACKUP_FILE}.gz"

# Limpiar respaldos antiguos (mantener últimos 7 días)
find backup/ -name "app_backup_*.sql.gz" -mtime +7 -delete

echo "🧹 Respaldos antiguos eliminados"


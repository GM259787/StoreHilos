#!/bin/bash
# Script de deployment automático para Plesk

echo "🚀 Iniciando deployment..."

# Restaurar paquetes
dotnet restore

# Compilar aplicación
dotnet publish -c Release -o . --self-contained false

echo "✅ Deployment completado!"

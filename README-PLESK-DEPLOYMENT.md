# 🚀 Deployment en Plesk - E-commerce con MercadoPago

## 📋 Archivos de Deployment

Este directorio contiene todos los archivos necesarios para hacer el deployment de tu aplicación e-commerce en un servidor Plesk.

### 📁 Archivos Principales

| Archivo | Descripción |
|---------|-------------|
| `deploy-plesk.ps1` | Script principal de deployment |
| `GUIA-DEPLOY-PLESK.md` | Guía completa paso a paso |
| `verificar-deployment.ps1` | Script de verificación post-deployment |
| `plesk-mysql-setup.sql` | Script de configuración de MySQL |
| `plesk-seed-data.sql` | Script de datos iniciales |
| `plesk-env-config.txt` | Configuración de variables de entorno |

## 🚀 Inicio Rápido

### 1. Ejecutar Deployment
```powershell
.\deploy-plesk.ps1 -Domain "tudominio.com" -DatabasePassword "tu_password_seguro" -JwtKey "tu_clave_jwt_segura" -MercadoPagoAccessToken "APP_USR-..." -MercadoPagoPublicKey "APP_USR-..." -MercadoPagoWebhookSecret "tu_webhook_secret"
```

### 2. Seguir la Guía
Abrir `GUIA-DEPLOY-PLESK.md` y seguir los pasos detallados.

### 3. Verificar Deployment
```powershell
.\verificar-deployment.ps1 -Domain "tudominio.com"
```

## 🔧 Requisitos

### Servidor Plesk
- ✅ .NET Core 8
- ✅ MySQL/MariaDB
- ✅ Panel Plesk configurado
- ✅ Dominio configurado
- ✅ Certificado SSL (recomendado)

### Credenciales Necesarias
- 🔑 **MercadoPago Access Token**
- 🔑 **MercadoPago Public Key**
- 🔑 **MercadoPago Webhook Secret**
- 🔑 **Clave JWT** (32+ caracteres)

## 📊 Estructura del Deployment

```
plesk-deploy/
├── Server.dll                 # Aplicación .NET Core
├── web.config                 # Configuración IIS
├── appsettings.Plesk.json     # Configuración de producción
├── wwwroot/                   # Archivos del frontend
│   ├── index.html
│   ├── assets/
│   └── ...
├── *.dll                      # Dependencias .NET
├── database-setup.sql         # Script de BD
├── variables-entorno.txt      # Variables de entorno
└── INSTRUCCIONES-PLESK.md     # Instrucciones detalladas
```

## 🗄️ Base de Datos

### Configuración Automática
El script `deploy-plesk.ps1` genera automáticamente:
- Script de creación de base de datos
- Script de configuración de usuario
- Script de datos iniciales

### Tablas Creadas
- `Categories` - Categorías de productos
- `Products` - Productos
- `Users` - Usuarios
- `Roles` - Roles de usuario
- `Orders` - Órdenes
- `OrderItems` - Items de órdenes
- `ShoppingCarts` - Carritos de compra
- `CartItems` - Items del carrito

## 🔒 Seguridad

### Configuración SSL
- Certificado SSL automático via Let's Encrypt
- Redirección HTTP a HTTPS
- Headers de seguridad configurados

### Variables Sensibles
- Credenciales de MercadoPago
- Clave JWT
- Contraseñas de base de datos
- Todas almacenadas en `appsettings.Plesk.json`

## 🛠️ Troubleshooting

### Problemas Comunes

#### Error 500 - Internal Server Error
```bash
# Verificar logs en Plesk
Panel > Logs > Logs de Aplicación

# Verificar connection string
appsettings.Plesk.json > ConnectionStrings

# Verificar variables de entorno
Panel > Aplicaciones > Configuración
```

#### Error de Conexión a BD
```bash
# Verificar en phpMyAdmin
- Base de datos existe
- Usuario tiene permisos
- Credenciales correctas

# Ejecutar script de configuración
plesk-mysql-setup.sql
```

#### Frontend no Carga
```bash
# Verificar archivos
- wwwroot/ contiene archivos del frontend
- web.config está presente
- Configuración de archivos estáticos
```

## 📈 Monitoreo

### Logs Importantes
- **Aplicación**: Plesk > Logs > Logs de Aplicación
- **Errores**: Plesk > Logs > Logs de Error
- **Base de datos**: phpMyAdmin > Logs

### Métricas Recomendadas
- Uptime de la aplicación
- Tiempo de respuesta de la API
- Errores de base de datos
- Transacciones de MercadoPago

## 🔄 Actualizaciones

### Proceso de Actualización
1. **Desarrollar cambios** localmente
2. **Ejecutar** `deploy-plesk.ps1` con nuevos cambios
3. **Subir** archivos actualizados al servidor
4. **Reiniciar** aplicación en Plesk
5. **Verificar** con `verificar-deployment.ps1`

### Migraciones de BD
```bash
# Si hay cambios en la base de datos
1. Crear nueva migración localmente
2. Ejecutar en el servidor
3. Verificar que no hay errores
```

## 📞 Soporte

### Recursos
- **Documentación Plesk**: [docs.plesk.com](https://docs.plesk.com)
- **Documentación .NET Core**: [docs.microsoft.com](https://docs.microsoft.com)
- **Documentación MercadoPago**: [developers.mercadopago.com](https://developers.mercadopago.com)

### Contacto
- **Soporte Plesk**: Disponible 24/7 desde el panel
- **Logs de errores**: Siempre revisar primero los logs

## 🎯 Checklist de Deployment

### Antes del Deploy
- [ ] Credenciales de MercadoPago configuradas
- [ ] Dominio configurado en Plesk
- [ ] Certificado SSL activo
- [ ] Base de datos MySQL disponible

### Durante el Deploy
- [ ] Script de deployment ejecutado
- [ ] Archivos subidos al servidor
- [ ] Aplicación configurada en Plesk
- [ ] Variables de entorno configuradas
- [ ] Base de datos configurada

### Después del Deploy
- [ ] Aplicación carga correctamente
- [ ] API responde correctamente
- [ ] Base de datos funciona
- [ ] MercadoPago configurado
- [ ] SSL funcionando
- [ ] Verificación completa exitosa

## 🚀 ¡Listo para Producción!

Si completaste todos los pasos, tu aplicación e-commerce está lista para recibir clientes reales.

**URLs importantes:**
- **Aplicación**: `https://tudominio.com`
- **API**: `https://tudominio.com/api`
- **Admin**: `https://tudominio.com/admin`

**Próximos pasos recomendados:**
1. Configurar respaldos automáticos
2. Configurar monitoreo de uptime
3. Optimizar rendimiento
4. Configurar CDN si es necesario
5. Implementar analytics

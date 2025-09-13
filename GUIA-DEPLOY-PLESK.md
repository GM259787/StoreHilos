# 🚀 Guía Completa de Deployment en Plesk

## 📋 Requisitos Previos

### Servidor Plesk
- ✅ .NET Core 8 instalado
- ✅ MySQL/MariaDB disponible
- ✅ Panel Plesk configurado
- ✅ Dominio configurado
- ✅ Certificado SSL (recomendado)

### Credenciales Necesarias
- 🔑 **MercadoPago Access Token** (de tu cuenta de MercadoPago)
- 🔑 **MercadoPago Public Key** (de tu cuenta de MercadoPago)
- 🔑 **MercadoPago Webhook Secret** (de tu cuenta de MercadoPago)
- 🔑 **Clave JWT** (generar una clave segura de al menos 32 caracteres)

## 🛠️ Paso 1: Preparar la Aplicación

### 1.1 Ejecutar el Script de Deployment
```powershell
# Desde la raíz del proyecto
.\deploy-plesk.ps1 -Domain "tudominio.com" -DatabasePassword "tu_password_seguro" -JwtKey "tu_clave_jwt_segura" -MercadoPagoAccessToken "APP_USR-..." -MercadoPagoPublicKey "APP_USR-..." -MercadoPagoWebhookSecret "tu_webhook_secret"
```

### 1.2 Verificar Archivos Generados
Después de ejecutar el script, deberías tener:
- 📁 `plesk-deploy/` - Archivos listos para subir
- 📄 `plesk-deploy/INSTRUCCIONES-PLESK.md` - Instrucciones detalladas
- 📄 `plesk-deploy/database-setup.sql` - Script de base de datos
- 📄 `plesk-deploy/variables-entorno.txt` - Variables de entorno

## 🗄️ Paso 2: Configurar Base de Datos

### 2.1 Crear Base de Datos en Plesk
1. **Acceder a Plesk Panel**
2. **Ir a "Bases de Datos"**
3. **Hacer clic en "Agregar Base de Datos"**
4. **Configurar:**
   - **Tipo**: MySQL
   - **Nombre**: `AppDb`
   - **Usuario**: `app_user`
   - **Contraseña**: [La que especificaste en el script]
   - **Hacer clic en "Aceptar"**

### 2.2 Ejecutar Script de Configuración
1. **Ir a "Bases de Datos" > "phpMyAdmin"**
2. **Seleccionar la base de datos `AppDb`**
3. **Hacer clic en "SQL"**
4. **Copiar y pegar el contenido de `plesk-mysql-setup.sql`**
5. **Hacer clic en "Ejecutar"**

### 2.3 Verificar Configuración
En phpMyAdmin, verificar que:
- ✅ La base de datos `AppDb` existe
- ✅ El usuario `app_user` existe
- ✅ Los permisos están configurados correctamente

## 📁 Paso 3: Subir Archivos

### 3.1 Comprimir Archivos
1. **Comprimir la carpeta `plesk-deploy`** en un archivo ZIP
2. **Verificar que incluye:**
   - `Server.dll`
   - `web.config`
   - `wwwroot/` (con archivos del frontend)
   - `appsettings.Plesk.json`
   - Todos los archivos .dll necesarios

### 3.2 Subir al Servidor
**Opción A: FTP**
1. **Conectar via FTP** a tu servidor
2. **Navegar a la carpeta del dominio** (ej: `/httpdocs/`)
3. **Subir el archivo ZIP**
4. **Extraer el contenido**

**Opción B: Plesk File Manager**
1. **Ir a "Sitios Web y Dominios"**
2. **Seleccionar tu dominio**
3. **Hacer clic en "Administración de Archivos"**
4. **Subir el archivo ZIP**
5. **Extraer el contenido**

## ⚙️ Paso 4: Configurar Aplicación

### 4.1 Crear Aplicación .NET Core
1. **Ir a "Sitios Web y Dominios"**
2. **Seleccionar tu dominio**
3. **Hacer clic en "Aplicaciones"**
4. **Hacer clic en "Agregar Aplicación"**
5. **Configurar:**
   - **Tipo**: .NET Core
   - **Versión**: .NET Core 8
   - **Ruta**: `/`
   - **Archivo de inicio**: `Server.dll`
   - **Hacer clic en "Aceptar"**

### 4.2 Configurar Variables de Entorno
1. **En la aplicación creada, hacer clic en "Configuración"**
2. **Agregar estas variables:**
   ```
   ASPNETCORE_ENVIRONMENT=Plesk
   ASPNETCORE_URLS=http://+:80
   ```
3. **Hacer clic en "Aceptar"**

### 4.3 Actualizar Configuración
1. **Editar `appsettings.Plesk.json`** con tus datos reales:
   ```json
   {
     "ConnectionStrings": {
       "Default": "Server=localhost;Database=AppDb;Uid=app_user;Pwd=TU_PASSWORD_REAL;"
     },
     "Jwt": {
       "Key": "TU_JWT_KEY_REAL",
       "Issuer": "https://tudominio.com",
       "Audience": "https://tudominio.com"
     },
     "MercadoPago": {
       "AccessToken": "TU_ACCESS_TOKEN_REAL",
       "PublicKey": "TU_PUBLIC_KEY_REAL",
       "WebhookSecret": "TU_WEBHOOK_SECRET_REAL"
     },
     "FrontendUrl": "https://tudominio.com",
     "BackendUrl": "https://tudominio.com"
   }
   ```

## 🔒 Paso 5: Configurar SSL

### 5.1 Activar SSL
1. **Ir a "Sitios Web y Dominios"**
2. **Seleccionar tu dominio**
3. **Hacer clic en "SSL/TLS"**
4. **Activar "Proteger el dominio con certificado SSL"**
5. **Seleccionar un certificado** (Let's Encrypt recomendado)

### 5.2 Configurar Redirección HTTPS
1. **En "SSL/TLS", activar "Redirigir de HTTP a HTTPS"**
2. **Hacer clic en "Aceptar"**

## 🚀 Paso 6: Ejecutar Migraciones

### 6.1 Crear Tablas
1. **Acceder a tu dominio** (ej: `https://tudominio.com`)
2. **La aplicación creará automáticamente las tablas** la primera vez que se ejecute
3. **Verificar en phpMyAdmin** que las tablas se crearon

### 6.2 Insertar Datos Iniciales (Opcional)
1. **En phpMyAdmin, seleccionar la base de datos `AppDb`**
2. **Hacer clic en "SQL"**
3. **Copiar y pegar el contenido de `plesk-seed-data.sql`**
4. **Hacer clic en "Ejecutar"**

## ✅ Paso 7: Verificar Deployment

### 7.1 Verificar Aplicación
1. **Acceder a `https://tudominio.com`**
2. **Verificar que carga la página principal**
3. **Verificar que no hay errores en la consola del navegador**

### 7.2 Probar Funcionalidades
1. **Registrar un nuevo usuario**
2. **Hacer login**
3. **Navegar por las categorías**
4. **Agregar productos al carrito**
5. **Probar el flujo de compra** (sin completar el pago)

### 7.3 Verificar Base de Datos
1. **En phpMyAdmin, verificar que:**
   - ✅ Las tablas se crearon correctamente
   - ✅ Los datos iniciales se insertaron (si ejecutaste el seed)
   - ✅ Los usuarios se pueden crear

## 🔧 Paso 8: Configurar MercadoPago

### 8.1 Configurar Webhooks
1. **En tu cuenta de MercadoPago, ir a "Webhooks"**
2. **Agregar nuevo webhook:**
   - **URL**: `https://tudominio.com/api/payment/webhook`
   - **Eventos**: Seleccionar eventos de pago
3. **Copiar el "Webhook Secret"** y actualizarlo en `appsettings.Plesk.json`

### 8.2 Probar Pagos
1. **Usar las credenciales de prueba** de MercadoPago
2. **Completar una compra de prueba**
3. **Verificar que el webhook funciona**

## 🛠️ Troubleshooting

### Error 500 - Internal Server Error
**Causas comunes:**
- Connection string incorrecta
- Variables de entorno no configuradas
- Permisos de archivos incorrectos

**Solución:**
1. **Revisar logs en Plesk** (Panel > Logs)
2. **Verificar connection string** en `appsettings.Plesk.json`
3. **Verificar variables de entorno** en la configuración de la aplicación

### Error de Conexión a Base de Datos
**Causas comunes:**
- Credenciales incorrectas
- Base de datos no existe
- Usuario sin permisos

**Solución:**
1. **Verificar en phpMyAdmin** que la base de datos existe
2. **Verificar credenciales** en `appsettings.Plesk.json`
3. **Ejecutar script de configuración** nuevamente

### Frontend no Carga
**Causas comunes:**
- Archivos no copiados correctamente
- Configuración de archivos estáticos incorrecta

**Solución:**
1. **Verificar que `wwwroot/` contiene los archivos del frontend**
2. **Verificar `web.config`** está presente
3. **Revisar configuración de archivos estáticos** en la aplicación

### MercadoPago no Funciona
**Causas comunes:**
- Credenciales incorrectas
- Webhook no configurado
- URLs incorrectas

**Solución:**
1. **Verificar credenciales** en `appsettings.Plesk.json`
2. **Configurar webhook** en MercadoPago
3. **Verificar URLs** usan HTTPS

## 📊 Monitoreo y Mantenimiento

### Logs Importantes
- **Logs de la aplicación**: Plesk > Logs > Logs de Aplicación
- **Logs de errores**: Plesk > Logs > Logs de Error
- **Logs de base de datos**: phpMyAdmin > Logs

### Respaldos
- **Respaldos automáticos**: Plesk los configura automáticamente
- **Respaldos manuales**: Plesk > Respaldos > Crear Respaldo

### Actualizaciones
- **Actualizar aplicación**: Subir nueva versión y reiniciar
- **Actualizar base de datos**: Ejecutar migraciones si es necesario

## 🆘 Soporte

### Recursos Útiles
- **Documentación de Plesk**: [docs.plesk.com](https://docs.plesk.com)
- **Documentación de .NET Core**: [docs.microsoft.com](https://docs.microsoft.com)
- **Documentación de MercadoPago**: [developers.mercadopago.com](https://developers.mercadopago.com)

### Contacto
- **Soporte Plesk**: Disponible 24/7 desde el panel
- **Logs de errores**: Siempre revisar primero los logs

---

## 🎉 ¡Deployment Completado!

Si seguiste todos los pasos correctamente, tu aplicación debería estar funcionando en:
- **Frontend**: `https://tudominio.com`
- **API**: `https://tudominio.com/api`
- **Base de datos**: MySQL en Plesk

**Próximos pasos recomendados:**
1. Configurar respaldos automáticos
2. Configurar monitoreo de uptime
3. Optimizar rendimiento según necesidad
4. Configurar CDN si es necesario

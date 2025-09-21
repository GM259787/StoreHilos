# 🔧 Configuración de Debug - Frontend

## 📋 Archivos de configuración disponibles

- **`env.local`** - Desarrollo con backend local (http://localhost:5175)
- **`env.remote`** - Desarrollo con backend remoto (https://storehilos.uy)
- **`env.plesk`** - Producción en Plesk (https://storehilos.uy)

## 🚀 Scripts de configuración

### Cambiar a configuración local
```powershell
.\switch-to-local.ps1
```
- API URL: `http://localhost:5175`
- Para desarrollo con backend local

### Cambiar a configuración remota
```powershell
.\switch-to-remote.ps1
```
- API URL: `https://storehilos.uy`
- Para desarrollo con backend remoto

### Cambiar a configuración Plesk
```powershell
.\switch-to-plesk.ps1
```
- API URL: `https://storehilos.uy`
- Para producción

### Ver configuración actual
```powershell
.\show-config.ps1
```

## 🔍 Debug de errores

### 1. Verificar configuración
```powershell
.\show-config.ps1
```

### 2. Revisar logs en el navegador
- Abrir DevTools (F12)
- Ir a la pestaña Console
- Buscar logs que empiecen con "API Base URL:" o "API Error:"

### 3. Verificar conectividad
- En DevTools > Network
- Verificar que las requests lleguen al servidor correcto
- Revisar status codes y errores

## 🛠️ Solución de problemas comunes

### Error "VITE_API_URL no está configurado"
1. Ejecutar `.\switch-to-local.ps1` para crear el archivo `.env`
2. Verificar que el archivo `.env` existe y contiene `VITE_API_URL`
3. Reiniciar el servidor de desarrollo

### Error "Network Error"
1. Verificar que el backend esté corriendo
2. Verificar la URL en la configuración
3. Revisar CORS en el backend
4. Verificar que el token de autenticación sea válido

### Error 401 (Unauthorized)
1. Verificar que el usuario esté logueado
2. Revisar que el token no haya expirado
3. Limpiar localStorage y volver a loguearse

### Error 500 (Internal Server Error)
1. Revisar logs del backend
2. Verificar que la base de datos esté conectada
3. Revisar que todos los servicios estén funcionando

## 📝 Notas importantes

- **Siempre reinicia el servidor de desarrollo** después de cambiar la configuración
- **Los cambios en .env requieren reinicio** del servidor Vite
- **Para debugging local**, asegúrate de que el backend esté corriendo en el puerto correcto
- **Para debugging remoto**, verifica que el backend remoto esté disponible

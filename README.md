
# Catálogo de Productos - Monorepo Full-Stack

Una aplicación moderna de catálogo de productos con carrito de compras y sistema de autenticación, construida con **.NET 8 Web API** (backend) y **React + TypeScript + Vite** (frontend).

## 🚀 Tecnologías

### Backend (.NET 8)
- **ASP.NET Core 8** - Framework web
- **Entity Framework Core** - ORM para base de datos
- **SQLite** - Base de datos local (desarrollo)
- **PostgreSQL** - Base de datos de producción (opcional)
- **JWT Bearer** - Autenticación
- **Serilog** - Logging estructurado
- **Swagger** - Documentación de API

### Frontend (React)
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Zustand** - Gestión de estado
- **ESLint + Prettier** - Linting y formateo

## 📋 Requisitos Previos

- **.NET 8 SDK** - [Descargar aquí](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
- **npm** o **pnpm** (incluido con Node.js)

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd app
```

### 2. Configuración inicial
```bash
# Instalar dependencias del monorepo
npm install

# Configurar y migrar base de datos
npm run setup
```

### 3. Ejecutar en desarrollo
```bash
# Ejecutar backend y frontend simultáneamente
npm run dev
```

## 📁 Estructura del Proyecto

```
app/
├── server/                 # Backend .NET 8
│   ├── Controllers/        # Controladores API
│   ├── Models/            # Modelos de datos
│   ├── Data/              # Contexto EF y Seed
│   ├── Auth/              # Configuración JWT
│   └── Properties/        # Configuración de lanzamiento
├── client/                # Frontend React
│   ├── src/
│   │   ├── api/           # Cliente HTTP
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── store/         # Estado global (Zustand)
│   │   └── types/         # Tipos TypeScript
│   └── public/            # Archivos estáticos
└── infra/                 # Configuración Docker (opcional)
```

## 🎯 Endpoints de la API

### Base URL: `http://localhost:5175`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/swagger` | Documentación Swagger |
| `GET` | `/api/todos` | Obtener todas las tareas |
| `GET` | `/api/todos/{id}` | Obtener tarea por ID |
| `POST` | `/api/todos` | Crear nueva tarea |
| `PUT` | `/api/todos/{id}` | Actualizar tarea |
| `DELETE` | `/api/todos/{id}` | Eliminar tarea |

## 🖥️ Puertos y URLs

- **Backend API**: http://localhost:5175
- **Frontend**: http://localhost:5173
- **Swagger**: http://localhost:5175/swagger
- **Health Check**: http://localhost:5175/health

## 📝 Scripts Disponibles

### Scripts del Monorepo (raíz)
```bash
npm run dev              # Ejecutar backend y frontend
npm run setup            # Configuración inicial completa
npm run server:dev       # Solo backend
npm run client:dev       # Solo frontend
npm run server:migrate   # Migrar base de datos
```

### Scripts del Backend
```bash
cd server
dotnet restore          # Restaurar paquetes
dotnet run              # Ejecutar aplicación
dotnet watch run        # Ejecutar con hot reload
dotnet ef database update  # Migrar base de datos
```

### Scripts del Frontend
```bash
cd client
npm install             # Instalar dependencias
npm run dev             # Servidor de desarrollo
npm run build           # Build de producción
npm run lint            # Ejecutar ESLint
```

## 🔐 Autenticación

La aplicación incluye un sistema de autenticación JWT simulado:

- **Usuario demo**: `admin`
- **Contraseña demo**: `admin`

> ⚠️ **Nota**: En un entorno de producción, implementa un sistema de autenticación real.

## 🗄️ Base de Datos

### Desarrollo (SQLite)
- Archivo: `server/app.db`
- Configuración automática
- Migraciones automáticas al iniciar

### Producción (PostgreSQL - Opcional)
```bash
# Variables de entorno para PostgreSQL
DB_PROVIDER=postgres
PGHOST=localhost
PGDATABASE=app
PGUSER=postgres
PGPASSWORD=postgres
PGPORT=5432
```

## 🧪 Testing

### Backend
```bash
cd server
dotnet test
```

### Frontend
```bash
cd client
npm run test
```

## 📦 Build de Producción

### Backend
```bash
cd server
dotnet publish -c Release
```

### Frontend
```bash
cd client
npm run build
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

#### Backend (`server/appsettings.Development.json`)
```json
{
  "ConnectionStrings": {
    "Default": "Data Source=app.db"
  },
  "Jwt": {
    "Issuer": "https://localhost:5175",
    "Audience": "https://localhost:5173",
    "Key": "dev-super-secret-key-with-at-least-32-characters-for-development-only"
  }
}
```

#### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5175
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de puerto ocupado**
   ```bash
   # Cambiar puertos en launchSettings.json (backend) o vite.config.ts (frontend)
   ```

2. **Error de base de datos**
   ```bash
   npm run server:migrate
   ```

3. **Error de dependencias**
   ```bash
   npm run setup
   ```

4. **Error de CORS**
   - Verificar que el frontend esté en `http://localhost:5173`
   - Verificar configuración CORS en `Program.cs`

## 📚 Recursos Adicionales

- [Documentación .NET 8](https://docs.microsoft.com/en-us/dotnet/)
- [Documentación React](https://react.dev/)
- [Documentación Vite](https://vitejs.dev/)
- [Documentación Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Disfruta desarrollando! 🚀**

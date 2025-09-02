# 🛍️ E-Commerce Application

Aplicación de comercio electrónico completa con backend en .NET 8 y frontend en React.

## 🏗️ Arquitectura

### Backend (.NET 8)
- **Framework**: ASP.NET Core 8.0
- **Base de Datos**: SQLite con Entity Framework Core
- **Autenticación**: JWT Bearer Tokens
- **API**: RESTful con Swagger/OpenAPI
- **Middleware**: CORS, Autenticación, Autorización, Archivos Estáticos

### Frontend (React)
- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite
- **Estado**: Zustand para gestión de estado
- **Routing**: React Router v6
- **UI**: Tailwind CSS
- **HTTP Client**: Axios

## 🚀 Características

### 🔐 Sistema de Autenticación
- Login/Registro de usuarios
- JWT tokens para sesiones
- Roles de usuario (Cliente, Cobrador, Armador)
- Protección de rutas basada en roles

### 🛒 Gestión del Carrito
- Agregar/eliminar productos
- Modificar cantidades
- Persistencia en localStorage
- Cálculo automático de totales

### 📱 Interfaz de Usuario
- Diseño responsive con Tailwind CSS
- Navegación condicional por roles
- Catálogo de productos con filtros
- Gestión de pedidos
- Panel de administración

### 🎯 Roles de Usuario

#### Cliente
- Ver catálogo de productos
- Agregar productos al carrito
- Realizar pedidos
- Ver historial de pedidos

#### Cobrador
- Acceso a administración
- Gestión de productos
- Ver pedidos confirmados

#### Armador
- Solo acceso a administración
- Ver pedidos ya pagados

## 📁 Estructura del Proyecto

```
app/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── store/        # Estado global (Zustand)
│   │   ├── api/          # Cliente HTTP para APIs
│   │   └── types/        # Definiciones TypeScript
│   └── package.json
├── server/                # Backend .NET
│   ├── Controllers/      # Controladores de la API
│   ├── Models/          # Entidades de la base de datos
│   ├── Services/        # Lógica de negocio
│   ├── DTOs/           # Objetos de transferencia de datos
│   ├── Data/           # Contexto de EF y migraciones
│   └── wwwroot/        # Archivos estáticos (imágenes)
└── infra/               # Configuración Docker
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **.NET 8.0**
- **Entity Framework Core**
- **SQLite**
- **JWT Authentication**
- **Swagger/OpenAPI**

### Frontend
- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Zustand**
- **React Router**
- **Axios**

## 🚀 Instalación y Configuración

### Prerrequisitos
- .NET 8.0 SDK
- Node.js 18+ y npm
- Git

### Backend
```bash
cd server
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 🌐 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/{id}` - Obtener producto
- `POST /api/products` - Crear producto (Cobrador)
- `PUT /api/products/{id}` - Actualizar producto (Cobrador)
- `DELETE /api/products/{id}` - Eliminar producto (Cobrador)

### Categorías
- `GET /api/categories` - Listar categorías

### Carrito
- `POST /api/cart/sync` - Sincronizar carrito

### Pedidos
- `GET /api/orders` - Listar pedidos del usuario
- `POST /api/orders` - Crear pedido

### Administración
- `GET /api/admin/orders` - Listar todos los pedidos (Armador/Cobrador)

## 🔧 Configuración

### Variables de Entorno
```bash
# Backend (.NET)
JWT__Key=your-super-secret-key-with-at-least-32-characters
JWT__Issuer=your-issuer
JWT__Audience=your-audience

# Frontend (Vite)
VITE_API_URL=http://localhost:5175
```

### Base de Datos
- **Tipo**: SQLite
- **Archivo**: `server/app.db`
- **Migraciones**: Automáticas al iniciar la aplicación

## 📊 Base de Datos

### Entidades Principales
- **User**: Usuarios del sistema
- **Role**: Roles de usuario
- **Product**: Productos del catálogo
- **Category**: Categorías de productos
- **Order**: Pedidos de usuarios
- **OrderItem**: Items de pedidos
- **ShoppingCart**: Carritos de compra
- **CartItem**: Items del carrito

## 🚀 Despliegue

### Docker
```bash
cd infra
docker-compose up -d
```

### Manual
1. Publicar backend: `dotnet publish -c Release`
2. Construir frontend: `npm run build`
3. Servir archivos estáticos desde el backend

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial.

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ usando .NET 8 y React**

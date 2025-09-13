import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useCartStore } from '../store/cart';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/logo-store-hilos-small.svg"
              alt="Store_Hilos Logo"
              className="h-12 w-12"
            />
            <span className="text-xl font-bold text-gray-900">
              Store Hilos
            </span>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Solo mostrar catálogo si NO es armador ni cobrador */}
            {(!user || (user.role !== 'Armador' && user.role !== 'Cobrador')) && (
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Catálogo
              </Link>
            )}
            
            {user && (
              <>
                {/* Solo mostrar pedidos si NO es armador ni cobrador */}
                {user.role !== 'Armador' && user.role !== 'Cobrador' && (
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Mis Pedidos
                  </Link>
                )}
                
                {/* Administración para Armador y Cobrador */}
                {(user.role === 'Armador' || user.role === 'Cobrador') && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Administración
                  </Link>
                )}
                
                {/* Solo Cobrador puede gestionar productos */}
                {user.role === 'Cobrador' && (
                  <Link
                    to="/products"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Gestionar Productos
                  </Link>
                )}
                
                {/* Solo Cobrador puede gestionar categorías */}
                {user.role === 'Cobrador' && (
                  <Link
                    to="/categories"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Categorías
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Carrito y usuario */}
          <div className="flex items-center space-x-4">
            {/* Solo mostrar carrito si NO es armador ni cobrador */}
            {(!user || (user.role !== 'Armador' && user.role !== 'Cobrador')) && (
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-blue-600 transition-colors p-2"
              >
                {/* Icono del carrito más grande y claro */}
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                
                {/* Contador de items */}
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="hidden md:block">{user.firstName}</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div>{user.firstName} {user.lastName}</div>
                      <div className="text-gray-500">{user.role}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Menú móvil expandido */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {/* Solo mostrar catálogo si NO es armador ni cobrador */}
              {(!user || (user.role !== 'Armador' && user.role !== 'Cobrador')) && (
                <Link
                  to="/"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Catálogo
                </Link>
              )}
              
              {user && (
                <>
                  {/* Solo mostrar pedidos si NO es armador ni cobrador */}
                  {user.role !== 'Armador' && user.role !== 'Cobrador' && (
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mis Pedidos
                    </Link>
                  )}
                  
                  {/* Administración para Armador y Cobrador */}
                  {(user.role === 'Armador' || user.role === 'Cobrador') && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Administración
                    </Link>
                  )}
                  
                  {/* Solo Cobrador puede gestionar productos */}
                  {user.role === 'Cobrador' && (
                    <Link
                      to="/products"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Gestionar Productos
                    </Link>
                  )}
                  
                  {/* Solo Cobrador puede gestionar categorías */}
                  {user.role === 'Cobrador' && (
                    <Link
                      to="/categories"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Categorías
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
              
              {!user && (
                <Link
                  to="/auth"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

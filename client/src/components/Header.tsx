import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useCartStore } from '../store/cart';
import { useTheme } from '../config/theme';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!theme) {
    return null;
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={theme.logo}
              alt={`${theme.companyName} Logo`}
              className="h-16"
            />
          </Link>

          <div className='flex items-center h-16 mr-4'>
            {/* Navegación + carrito/usuario (alineado a la derecha) */}
            <div className="flex items-center space-x-4 md:space-x-6">
              {/* Navegación desktop (a la derecha, pegada al usuario) */}
              <nav className="hidden md:flex items-center space-x-6">
                {/* Solo mostrar catálogo si NO es armador ni cobrador */}
                {(!user || (user.role !== 'Armador' && user.role !== 'Cobrador')) && (
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `px-1 pb-1 transition-colors ${isActive ? 'text-primary-600 border-b-2 border-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600'
                      }`
                    }
                    end
                  >
                    Catálogo
                  </NavLink>
                )}

                {user && (
                  <>
                    {/* Solo mostrar pedidos si NO es armador ni cobrador */}
                    {user.role !== 'Armador' && user.role !== 'Cobrador' && (
                      <NavLink
                        to="/orders"
                        className={({ isActive }) =>
                          `px-1 pb-1 transition-colors ${isActive ? 'text-primary-600 border-b-2 border-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600'
                          }`
                        }
                      >
                        Mis Pedidos
                      </NavLink>
                    )}

                    {/* Administración para Armador y Cobrador */}
                    {(user.role === 'Armador' || user.role === 'Cobrador') && (
                      <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                          `px-1 pb-1 transition-colors ${isActive ? 'text-primary-600 border-b-2 border-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600'
                          }`
                        }
                      >
                        Administración
                      </NavLink>
                    )}

                    {/* Solo Cobrador puede gestionar productos */}
                    {user.role === 'Cobrador' && (
                      <NavLink
                        to="/products"
                        className={({ isActive }) =>
                          `px-1 pb-1 transition-colors ${isActive ? 'text-primary-600 border-b-2 border-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600'
                          }`
                        }
                      >
                        Gestionar Productos
                      </NavLink>
                    )}

                    {/* Solo Cobrador puede gestionar categorías */}
                    {user.role === 'Cobrador' && (
                      <NavLink
                        to="/categories"
                        className={({ isActive }) =>
                          `px-1 pb-1 transition-colors ${isActive ? 'text-primary-600 border-b-2 border-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600'
                          }`
                        }
                      >
                        Categorías
                      </NavLink>
                    )}
                  </>
                )}
              </nav>


              {/* Carrito y usuario */}
              <div className="flex items-center space-x-1 md:space-x-2">
                {/* Solo mostrar carrito si NO es armador ni cobrador */}
                {(!user || (user.role !== 'Armador' && user.role !== 'Cobrador')) && (
                  <Link
                    to="/cart"
                    className="relative text-gray-700 hover:text-primary-600 transition-colors p-2"
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
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      {user.googlePicture && (
                        <img
                          src={user.googlePicture}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
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

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          <div>{user.firstName} {user.lastName}</div>
                          <div className="text-gray-500">{user.role}</div>
                        </div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
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
                    className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
              {/* Cierre del contenedor navegación + carrito/usuario */}
            </div>

            {/* Botón menú móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 p-2"
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
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil expandido */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
              <nav className="py-4">
                {/* Solo mostrar catálogo si NO es armador ni cobrador */}
                {(!user || (user.role !== 'Armador' && user.role !== 'Cobrador')) && (
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `block px-4 py-3 ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    end
                  >
                    Catálogo
                  </NavLink>
                )}

                {user && (
                  <>
                    {/* Solo mostrar pedidos si NO es armador ni cobrador */}
                    {user.role !== 'Armador' && user.role !== 'Cobrador' && (
                      <NavLink
                        to="/orders"
                        className={({ isActive }) =>
                          `block px-4 py-3 ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Mis Pedidos
                      </NavLink>
                    )}

                    {/* Administración para Armador y Cobrador */}
                    {(user.role === 'Armador' || user.role === 'Cobrador') && (
                      <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                          `block px-4 py-3 ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Administración
                      </NavLink>
                    )}

                    {/* Solo Cobrador puede gestionar productos */}
                    {user.role === 'Cobrador' && (
                      <NavLink
                        to="/products"
                        className={({ isActive }) =>
                          `block px-4 py-3 ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Gestionar Productos
                      </NavLink>
                    )}

                    {/* Solo Cobrador puede gestionar categorías */}
                    {user.role === 'Cobrador' && (
                      <NavLink
                        to="/categories"
                        className={({ isActive }) =>
                          `block px-4 py-3 ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Categorías
                      </NavLink>
                    )}

                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}

                {!user && (
                  <NavLink
                    to="/auth"
                    className={({ isActive }) =>
                      `block px-4 py-3 ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </NavLink>
                )}
              </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

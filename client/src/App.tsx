import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import ProductManagement from './pages/ProductManagement';
import Categories from './pages/Categories';
import { useAuthStore } from './store/auth';

function App() {
  const { user } = useAuthStore();

  // Componente para redirigir según el rol del usuario
  const SmartRedirect = () => {
    if (!user) {
      return <Catalog />; // Usuarios no autenticados ven el catálogo
    }
    
    if (user.role === 'Armador') {
      return <Navigate to="/admin" replace />; // Armador va directo a administración
    }
    
    return <Catalog />; // Otros usuarios ven el catálogo
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<SmartRedirect />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
            <Route path="/orders" element={user ? <Orders /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user ? <Admin /> : <Navigate to="/auth" />} />
            <Route path="/products" element={user && user.role === 'Cobrador' ? <ProductManagement /> : <Navigate to="/auth" />} />
            <Route path="/categories" element={user && user.role === 'Cobrador' ? <Categories /> : <Navigate to="/auth" />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </Router>
  );
}

export default App;

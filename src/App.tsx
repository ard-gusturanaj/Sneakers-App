import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { Product, CartItem } from './types';
import Login from './components/Login';
import Register from './components/Register';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Shop from './components/Shop';
import Cart from './components/Cart';
import Payment from './components/Payment';
import Shipping from './components/Shipping';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState('home');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (user) {
      loadCartCount();
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const loadCartCount = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id);

    if (data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(total);
    }
  };

  const handleAddToCart = async (product: Product, size: string) => {
    if (!user) return;

    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .eq('size', size)
      .maybeSingle();

    if (existingItem) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);
    } else {
      await supabase.from('cart_items').insert([
        {
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
          size: size,
        },
      ]);
    }

    loadCartCount();
  };

  const handleCheckout = () => {
    setCurrentPage('payment');
  };

  const handlePaymentSuccess = () => {
    setCurrentPage('shipping');
    loadCartCount();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-xl text-slate-600 dark:text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'login') {
      return (
        <Login
          onSwitchToRegister={() => setAuthMode('register')}
          onSuccess={() => setCurrentPage('home')}
        />
      );
    }
    return (
      <Register
        onSwitchToLogin={() => setAuthMode('login')}
        onSuccess={() => setCurrentPage('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        cartItemCount={cartItemCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {currentPage === 'home' && <Home onAddToCart={handleAddToCart} />}
      {currentPage === 'shop' && <Shop onAddToCart={handleAddToCart} />}
      {currentPage === 'cart' && (
        <Cart onCheckout={handleCheckout} cartItems={[]} onUpdateCart={loadCartCount} />
      )}
      {currentPage === 'payment' && <Payment onSuccess={handlePaymentSuccess} />}
      {currentPage === 'shipping' && <Shipping />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

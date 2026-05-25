
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Marketplace from './components/Marketplace';
import Cart from './components/Cart';
import SellerPortal from './components/SellerPortal';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import ProductDetail from './components/ProductDetail';
import Wishlist from './components/Wishlist';
import MyOrders from './components/MyOrders';
import Shops from './components/Shops';
import { Product, CartItem, User, Order, Category, StudioOrder } from './types';
import { Language, translations } from './translations';
import { X, CheckCircle, Mail, ShieldCheck, Heart } from 'lucide-react';
import { MOCK_PRODUCTS, INITIAL_CATEGORIES } from './constants';
import { databaseService } from './services/databaseService';

type View = 'home' | 'cart' | 'seller-portal' | 'admin-dashboard' | 'shops' | 'regions' | 'auth' | 'product-detail' | 'wishlist' | 'my-orders';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [studioOrders, setStudioOrders] = useState<StudioOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('artisanya_lang');
      return (saved as Language) || 'en';
    } catch {
      return 'en';
    }
  });
  const [showToast, setShowToast] = useState<{ message: string; submessage?: string; type: 'success' | 'notification' | 'admin' | 'email' | 'wishlist' } | null>(null);

  const t = translations[lang] || translations['en'];

  const triggerToast = useCallback((message: string, submessage?: string, type: 'success' | 'notification' | 'admin' | 'email' | 'wishlist' = 'success') => {
    setShowToast({ message, submessage, type });
    setTimeout(() => setShowToast(null), 5000);
  }, []);

  const syncFromDB = useCallback(async () => {
    try {
      const studio = await databaseService.getStudioOrders();
      if (studio) setStudioOrders(studio);

      const ordersFromDB = await databaseService.getAll('orders');
      if (ordersFromDB) setMyOrders(ordersFromDB);
    } catch (e) {
      console.error("[App] DB Sync Error", e);
    }
  }, []);

  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem('artisanya_user');
      if (savedUser && savedUser !== 'undefined') setUser(JSON.parse(savedUser));
      
      const savedCart = localStorage.getItem('artisanya_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      
      const savedWishlist = localStorage.getItem('artisanya_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      
      syncFromDB();
    } catch (e) {
      console.error("[App] Restore Error", e);
    }
  }, [syncFromDB]);

  useEffect(() => {
    localStorage.setItem('artisanya_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('artisanya_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('artisanya_lang', lang);
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t.dir]);

  const handleLogin = useCallback((newUser: User) => {
    setUser(newUser);
    sessionStorage.setItem('artisanya_user', JSON.stringify(newUser));
    
    if (newUser.role === 'admin') {
      triggerToast(lang === 'ar' ? `مرحباً أيها المسؤول، ${newUser.name}` : `Welcome Administrator, ${newUser.name}`, "Full access granted", 'admin');
      setCurrentView('admin-dashboard');
    } else if (newUser.role === 'seller') {
      triggerToast(lang === 'ar' ? `مرحباً بك، ${newUser.name}!` : `Welcome Artisan, ${newUser.name}!`, "Shop portal active");
      setCurrentView('seller-portal');
    } else {
      triggerToast(lang === 'ar' ? `مرحباً بك، ${newUser.name}!` : `Welcome back, ${newUser.name}!`, "Authentication successful");
      setCurrentView('home');
    }
  }, [lang, triggerToast]);

  const handleLogout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('artisanya_user');
    setCurrentView('home');
  }, []);

  const handleAddToCart = useCallback((product: Product | CartItem) => {
    if (!product) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 } as CartItem];
    });
    triggerToast(t.dir === 'rtl' ? 'تمت الإضافة إلى السلة' : 'Added to Cart', product.name);
  }, [triggerToast, t.dir]);

  const handleRemoveFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateCartQuantity = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }, []);

  const handleToggleWishlist = useCallback((id: string) => {
    setWishlist(prev => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter(item => item !== id);
      } else {
        triggerToast(t.dir === 'rtl' ? 'أضيف للمفضلة' : 'Added to Wishlist', undefined, 'wishlist');
        return [...prev, id];
      }
    });
  }, [triggerToast, t.dir]);

  const handleCheckout = async (sellerIds: string[], shippingInfo: any) => {
    const newOrders: Order[] = sellerIds.map(sid => ({
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      buyerName: shippingInfo.fullName,
      items: cart.filter(item => item.sellerId === sid),
      total: cart.filter(item => item.sellerId === sid).reduce((acc, i) => acc + (i.price * i.quantity), 0),
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      sellerId: sid
    }));

    for (const order of newOrders) {
      await databaseService.save('orders', order);
    }

    setMyOrders(prev => [...newOrders, ...prev]);
    setCart([]);
    setCurrentView('my-orders');
    triggerToast(t.cart.orderSuccess, "Orders have been recorded for artisans.", 'success');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <Marketplace 
            onAddToCart={handleAddToCart} 
            onViewProduct={(p) => { setSelectedProduct(p); setCurrentView('product-detail'); }}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            categories={categories}
            t={t}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case 'product-detail':
        return selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onAddToCart={handleAddToCart} 
            onBack={() => setCurrentView('home')}
            isWishlisted={wishlist.includes(selectedProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            t={t}
          />
        ) : <Marketplace onAddToCart={handleAddToCart} onViewProduct={(p) => { setSelectedProduct(p); setCurrentView('product-detail'); }} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} categories={categories} t={t} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
      case 'cart':
        return (
          <Cart 
            items={cart} 
            onUpdateQuantity={handleUpdateCartQuantity} 
            onRemove={handleRemoveFromCart} 
            onCheckout={handleCheckout}
            user={user}
            onNavigate={setCurrentView as any}
            t={t}
          />
        );
      case 'seller-portal':
        return <SellerPortal user={user} categories={categories} onAddCategory={(c) => setCategories([...categories, c])} t={t} studioOrders={studioOrders} setStudioOrders={setStudioOrders} />;
      case 'admin-dashboard':
        return <AdminDashboard t={t} studioRequests={studioOrders} setStudioRequests={setStudioOrders} />;
      case 'auth':
        return <Auth onLogin={handleLogin} t={t} />;
      case 'wishlist':
        return (
          <Wishlist 
            products={MOCK_PRODUCTS.filter(p => wishlist.includes(p.id))} 
            onAddToCart={handleAddToCart} 
            onRemove={handleToggleWishlist} 
            onView={(p) => { setSelectedProduct(p); setCurrentView('product-detail'); }}
            onNavigate={setCurrentView as any}
            t={t}
          />
        );
      case 'my-orders':
        return <MyOrders orders={myOrders} onNavigate={setCurrentView as any} t={t} />;
      case 'shops':
        return <Shops t={t} onNavigate={setCurrentView as any} />;
      default:
        return <Marketplace onAddToCart={handleAddToCart} onViewProduct={(p) => { setSelectedProduct(p); setCurrentView('product-detail'); }} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} categories={categories} t={t} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
    }
  };

  return (
    <Layout 
      onNavigate={setCurrentView as any} 
      cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} 
      user={user} 
      onLogout={handleLogout}
      lang={lang}
      onLangChange={setLang}
      t={t}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {renderView()}

      {showToast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
          <div className="bg-brown-900 text-white p-6 rounded-[32px] shadow-2xl border border-white/10 flex items-center gap-5 min-w-[320px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-terracotta-500" />
            <div className={`p-3 rounded-2xl ${
              showToast.type === 'admin' ? 'bg-indigo-600' : 
              showToast.type === 'wishlist' ? 'bg-red-500' : 
              showToast.type === 'email' ? 'bg-emerald-500' : 'bg-terracotta-600'
            }`}>
              {showToast.type === 'admin' ? <ShieldCheck size={20} /> : 
              showToast.type === 'wishlist' ? <Heart size={20} /> : 
              showToast.type === 'email' ? <Mail size={20} /> : <CheckCircle size={20} />}
            </div>
            <div>
              <p className="font-black text-sm tracking-tight">{showToast.message}</p>
              {showToast.submessage && <p className="text-[10px] font-bold text-brown-300 uppercase tracking-widest mt-0.5">{showToast.submessage}</p>}
            </div>
            <button onClick={() => setShowToast(null)} className="ml-auto p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;

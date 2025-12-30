
import React, { useState, useEffect, useCallback } from 'react';
import { View, Product, CartItem, Order, Category, PaymentMethod } from './types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, PAYMENT_METHODS } from './constants';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import ShopView from './components/ShopView';
import ProductDetailsView from './components/ProductDetailsView';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import OrdersView from './components/OrdersView';
import AdminView from './components/AdminView';
import AdminLogin from './components/AdminLogin';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Auth State
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Helper to safely convert any value to string to prevent [object Object]
  const safeString = (val: any): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  // Check for active session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    setLoadingProducts(true);
    try {
      // Fetch Products
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });
      
      if (prodData) {
        // Sanitize arrays and strings to avoid nulls and [object Object]
        const sanitizedProducts = prodData.map((p: any) => ({
          ...p,
          name: safeString(p.name),
          category: safeString(p.category),
          description: safeString(p.description),
          short_description: safeString(p.short_description),
          sold: safeString(p.sold),
          hot_deal_title: safeString(p.hot_deal_title),
          pricing: Array.isArray(p.pricing) ? p.pricing : [],
          related_product_ids: Array.isArray(p.related_product_ids) ? p.related_product_ids : []
        }));
        setProducts(sanitizedProducts);
      } else {
        setProducts(MOCK_PRODUCTS);
      }

      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (catData && catData.length > 0) {
          // Sanitize categories
          setCategories(catData.map((c: any) => ({
              ...c,
              name: safeString(c.name),
              slug: safeString(c.slug),
              icon: safeString(c.icon)
          })));
      } else {
          setCategories(MOCK_CATEGORIES);
      }

      // Fetch Payment Methods
      const { data: pmData, error: pmError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });
        
      if (pmData && pmData.length > 0) {
        // Sanitize payment methods
        setPaymentMethods(pmData.map((pm: any) => ({
            ...pm,
            name: safeString(pm.name),
            number: safeString(pm.number),
            instructions: safeString(pm.instructions)
        })));
      } else {
        // Fallback to constants if DB empty
        const fallback = Object.entries(PAYMENT_METHODS).map(([name, val], id) => ({
          id,
          name,
          number: val.number,
          is_custom: false
        }));
        setPaymentMethods(fallback);
      }

      // Fetch Orders
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orderData) {
        const mappedOrders: Order[] = orderData.map((o: any) => ({
          id: safeString(o.id),
          date: safeString(o.date),
          createdAt: o.created_at,
          status: o.status,
          total: o.total,
          paymentMethod: safeString(o.payment_method),
          transactionId: safeString(o.transaction_id),
          customerName: safeString(o.customer_name),
          customerPhone: safeString(o.customer_phone),
          customerEmail: safeString(o.customer_email),
          items: Array.isArray(o.items) ? o.items : []
        }));
        setOrders(mappedOrders);
      }

    } catch (err) {
      console.error('Unexpected error fetching data:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync with Hash for basic back/forward
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'cart') setView('cart');
      else if (hash === 'shop') setView('shop');
      else if (hash === 'checkout') setView('checkout');
      else if (hash === 'orders') setView('orders');
      else if (hash === 'admin') setView('admin');
      else if (hash.startsWith('product-')) {
        const id = parseInt(hash.split('-')[1]);
        const p = products.find(x => x.id === id);
        if (p) {
          setCurrentProduct(p);
          setView('details');
        }
      } else {
        setView('home');
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, [products]);

  const navigate = useCallback((target: View, product?: Product) => {
    if (product) setCurrentProduct(product);
    
    if (target === 'home') window.location.hash = '';
    else if (target === 'shop') window.location.hash = 'shop';
    else if (target === 'cart') window.location.hash = 'cart';
    else if (target === 'checkout') window.location.hash = 'checkout';
    else if (target === 'orders') window.location.hash = 'orders';
    else if (target === 'admin') window.location.hash = 'admin';
    else if (target === 'details' && product) window.location.hash = `product-${product.id}`;
    
    setView(target);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addToCart = useCallback((product: Product, pricingIndex: number = 0) => {
    const option = product.pricing[pricingIndex];
    if (product.stock_out) return alert('This product is currently out of stock.');
    if (option.stock !== undefined && option.stock <= 0) return alert(`Sorry, the "${option.duration}" option is out of stock.`);
    
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id && item.subtitle === option.duration);
      if (existing && option.stock !== undefined && existing.quantity + 1 > option.stock) {
        alert(`You cannot add more of this item. Only ${option.stock} available.`);
        return prev;
      }
      if (existing) {
        return prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      const newItem: CartItem = {
        id: `${product.id}-${pricingIndex}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        subtitle: option.duration,
        price: option.price,
        image: product.image,
        quantity: 1
      };
      alert(`Added ${product.name} (${option.duration}) to cart!`);
      return [...prev, newItem];
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const placeOrder = useCallback(async (newOrder: Order) => {
    const { error } = await supabase.from('orders').insert([{
        id: newOrder.id,
        date: newOrder.date,
        status: newOrder.status,
        total: newOrder.total,
        payment_method: newOrder.paymentMethod,
        transaction_id: newOrder.transactionId,
        customer_name: newOrder.customerName,
        customer_email: newOrder.customerEmail,
        customer_phone: newOrder.customerPhone,
        items: newOrder.items
      }]);

    if (error) {
      console.error('Error saving order:', error.message);
      alert('Order Failed (Database Locked)! Please go to Admin Dashboard > Database Setup and run the SQL command.');
    } else {
      setOrders(prev => [newOrder, ...prev]);
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        navigate={navigate} 
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        toggleSidebar={() => setSidebarOpen(true)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} categories={categories} />

      <main className="flex-1 pb-[60px] md:pb-0">
        {loadingProducts && view !== 'admin' ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {view === 'home' && <HomeView products={products} categories={categories} navigate={navigate} addToCart={addToCart} />}
            {view === 'shop' && <ShopView products={products} navigate={navigate} addToCart={addToCart} />}
            {view === 'details' && currentProduct && <ProductDetailsView product={currentProduct} addToCart={addToCart} navigate={navigate} />}
            {view === 'cart' && <CartView items={cartItems} updateQuantity={updateQuantity} removeItem={removeItem} navigate={navigate} />}
            {view === 'checkout' && (
              <CheckoutView 
                items={cartItems} 
                navigate={navigate} 
                onPlaceOrder={placeOrder} 
                paymentMethods={paymentMethods} 
              />
            )}
            {view === 'orders' && <OrdersView orders={orders} navigate={navigate} />}
            {view === 'admin' && (
              !authLoading && session ? (
                <AdminView products={products} categories={categories} orders={orders} refreshData={fetchData} navigate={navigate} />
              ) : (
                <AdminLogin onLoginSuccess={() => {}} />
              )
            )}
          </>
        )}
      </main>

      <Footer />
      <MobileNav navigate={navigate} cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)} />
    </div>
  );
};

export default App;

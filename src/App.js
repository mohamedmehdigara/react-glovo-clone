import React, { useState, useMemo, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { create } from 'zustand';
import { 
  ShoppingBag, Search, MapPin, Utensils, ShoppingBasket, 
  Zap, X, Plus, Minus, Star, Clock, ArrowLeft, 
  Pill, Coffee, Pizza, Soup, CheckCircle, Loader2, Info, Package, Bike
} from 'lucide-react';

// --- STATE MANAGEMENT (ZUSTAND) ---
const useStore = create((set) => ({
  cart: [],
  isCartOpen: false,
  activeCategory: 'All',
  searchQuery: '',
  currentView: { type: 'home', data: null }, // 'home', 'store', 'product', 'tracking'
  
  setView: (view) => set({ currentView: view }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategory: (category) => set({ activeCategory: category }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  addToCart: (product, store) => set((state) => {
    const existing = state.cart.find(i => i.id === product.id);
    if (existing) {
      return { cart: state.cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
    }
    return { cart: [...state.cart, { ...product, storeName: store.name, storeMin: store.price, qty: 1 }] };
  }),

  updateQty: (id, delta) => set((state) => ({
    cart: state.cart.map(item => 
      item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ).filter(item => item.qty > 0)
  })),

  clearCart: () => set({ cart: [] }),
}));

// --- EXPANDED DATA ---
const STORES = [
  { 
    id: 1, name: 'Burger King', cat: 'Food', rating: 4.5, time: '20-30', price: 15.0, isOpen: true,
    img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500',
    sections: {
      "Mains": [
        { id: 'bk1', name: 'Whopper Meal', price: 18.500, desc: 'Flame-grilled beef patty, tomatoes, lettuce, mayo, pickles.' },
        { id: 'bk2', name: 'Chicken Royale', price: 14.200, desc: 'Crispy chicken with creamy mayo and lettuce.' }
      ],
      "Sides": [
        { id: 'bk3', name: 'King Fries', price: 5.500, desc: 'Golden and crispy salted fries.' }
      ]
    }
  },
  { 
    id: 2, name: 'Carrefour', cat: 'Groceries', rating: 4.8, time: '30-45', price: 10.0, isOpen: true,
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
    sections: {
      "Dairy": [{ id: 'cf1', name: 'Milk 1L', price: 1.450, desc: 'Tunisian Full Cream Milk.' }],
      "Local": [{ id: 'cf3', name: 'Couscous 1kg', price: 0.950, desc: 'Traditional Tunisian Fine Grain.' }]
    }
  },
  { 
    id: 3, name: 'Pizza Hut', cat: 'Pizza', rating: 4.2, time: '35-50', price: 20.0, isOpen: true,
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
    sections: {
      "Pizza": [
        { id: 'phut1', name: 'Margherita', price: 16.000, desc: 'Classic tomato and mozzarella.' },
        { id: 'phut2', name: 'Super Supreme', price: 24.500, desc: 'Beef, pepperoni, peppers, onions, mushrooms.' }
      ]
    }
  }
];

// --- STYLES & ANIMATIONS ---
const GlobalStyle = createGlobalStyle`
  :root { --primary: #ffc244; --secondary: #00a082; --dark: #2c3e50; --light: #f7f9fa; }
  body { margin: 0; font-family: 'Inter', sans-serif; background: var(--light); color: var(--dark); }
`;

const slideUp = keyframes` from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } `;
const spin = keyframes` from { transform: rotate(0deg); } to { transform: rotate(360deg); } `;

const Nav = styled.nav`
  position: sticky; top: 0; background: white; padding: 0.8rem 5%;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); z-index: 1000;
`;

const MainContent = styled.main` max-width: 1100px; margin: 2rem auto; padding: 0 20px; `;

const AnimatedSection = styled.div`
  animation: ${slideUp} 0.5s ease-out forwards;
`;

const StoreCard = styled.div`
  background: white; border-radius: 20px; overflow: hidden; transition: 0.3s; cursor: pointer;
  &:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
  img { width: 100%; height: 200px; object-fit: cover; }
`;

const Sidebar = styled.aside`
  position: fixed; right: ${props => props.isOpen ? '0' : '-450px'};
  top: 0; width: 400px; height: 100vh; background: white;
  box-shadow: -10px 0 30px rgba(0,0,0,0.1); z-index: 2000;
  padding: 2rem; display: flex; flex-direction: column; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Loader = styled(Loader2)` animation: ${spin} 1s linear infinite; `;

// --- VIEW COMPONENTS ---

const HomeView = ({ onStoreClick }) => {
  const { searchQuery, activeCategory, setCategory } = useStore();
  const categories = ['All', 'Food', 'Groceries', 'Pizza', 'Pharmacy'];

  const filtered = useMemo(() => STORES.filter(s => 
    (activeCategory === 'All' || s.cat === activeCategory) &&
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [activeCategory, searchQuery]);

  return (
    <AnimatedSection>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: '12px 25px', borderRadius: '50px', border: 'none', background: activeCategory === c ? 'var(--primary)' : 'white', fontWeight: 'bold', cursor: 'pointer' }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
        {filtered.map(s => (
          <StoreCard key={s.id} onClick={() => onStoreClick(s)}>
            <img src={s.img} alt="" />
            <div style={{ padding: '20px' }}>
              <h3>{s.name}</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>★ {s.rating} • {s.cat} • {s.time} min</p>
            </div>
          </StoreCard>
        ))}
      </div>
    </AnimatedSection>
  );
};

const StoreView = ({ store, onBack, onProductClick }) => {
  const addToCart = useStore(state => state.addToCart);
  return (
    <AnimatedSection>
      <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)' }}>
        <ArrowLeft size={20} /> BACK TO DISCOVER
      </button>
      <h1 style={{ fontSize: '2.5rem', marginTop: '20px' }}>{store.name}</h1>
      {Object.entries(store.sections).map(([name, items]) => (
        <div key={name}>
          <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: '40px' }}>{name}</h2>
          {items.map(item => (
            <div key={item.id} style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => onProductClick(item)}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.name}</div>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>{item.desc}</div>
                <div style={{ color: 'var(--secondary)', fontWeight: 'bold', marginTop: '5px' }}>{item.price.toFixed(3)} TND</div>
              </div>
              <button onClick={() => addToCart(item, store)} style={{ background: 'var(--primary)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}>
                <Plus size={20} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </AnimatedSection>
  );
};

const TrackingView = () => {
  return (
    <AnimatedSection style={{ textAlign: 'center', marginTop: '50px' }}>
      <Bike size={80} color="var(--secondary)" style={{ marginBottom: '20px' }} />
      <h1>Your order is on the way!</h1>
      <p style={{ color: '#666' }}>Estimated delivery: 25 minutes</p>
      <div style={{ background: 'white', padding: '30px', borderRadius: '20px', maxWidth: '400px', margin: '30px auto' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <Package color="var(--primary)" />
          <div style={{ textAlign: 'left' }}>
            <b>Order Picked Up</b>
            <div style={{ fontSize: '12px' }}>Ahmad is heading to your location</div>
          </div>
        </div>
        <div style={{ height: '2px', background: '#f1f3f4', width: '100%' }} />
      </div>
    </AnimatedSection>
  );
};

// --- MAIN APP ---
export default function App() {
  const { cart, isCartOpen, toggleCart, currentView, setView, updateQty, clearCart, searchQuery, setSearchQuery } = useStore();
  const [checkoutStep, setCheckoutStep] = useState('idle'); // idle, loading, success

  const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const minOrderValue = cart.length > 0 ? cart[0].storeMin : 0;

  const handleCheckout = () => {
    if (subtotal < minOrderValue) return;
    setCheckoutStep('loading');
    setTimeout(() => {
      setCheckoutStep('success');
      setTimeout(() => {
        clearCart();
        setCheckoutStep('idle');
        toggleCart();
        setView({ type: 'tracking' });
      }, 1500);
    }, 2000);
  };

  return (
    <>
      <GlobalStyle />
      <Nav>
        <h1 onClick={() => setView({ type: 'home' })} style={{ color: 'var(--primary)', cursor: 'pointer', margin: 0, fontWeight: 900 }}>G-Clone</h1>
        <div style={{ background: '#f1f3f4', padding: '10px 20px', borderRadius: '50px', width: '30%', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="#999" />
          <input 
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }}
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <MapPin size={18} color="var(--secondary)" />
          <button onClick={toggleCart} style={{ border: 'none', background: 'var(--primary)', padding: '12px 25px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', position: 'relative' }}>
            <ShoppingBag size={20} />
            {cart.length > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--secondary)', color: 'white', borderRadius: '50%', width: '22px', height: '22px', fontSize: '11px', display: 'grid', placeContent: 'center' }}>{cart.length}</span>}
          </button>
        </div>
      </Nav>

      <MainContent>
        {currentView.type === 'home' && <HomeView onStoreClick={(s) => setView({ type: 'store', data: s })} />}
        {currentView.type === 'store' && <StoreView store={currentView.data} onBack={() => setView({ type: 'home' })} onProductClick={(p) => alert(`Redirecting to product details for: ${p.name}`)} />}
        {currentView.type === 'tracking' && <TrackingView />}
      </MainContent>

      <Sidebar isOpen={isCartOpen}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>{checkoutStep === 'success' ? 'Confirmed!' : 'Basket'}</h2>
          <X style={{ cursor: 'pointer' }} onClick={toggleCart} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {checkoutStep === 'success' ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <CheckCircle size={60} color="var(--secondary)" />
              <h3>Order Placed!</h3>
            </div>
          ) : cart.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.5 }}>Basket is empty</div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8f8f8', padding: '5px 10px', borderRadius: '8px' }}>
                    <Minus size={14} onClick={() => updateQty(item.id, -1)} />
                    <b>{item.qty}</b>
                    <Plus size={14} onClick={() => updateQty(item.id, 1)} />
                  </div>
                  <b>{(item.price * item.qty).toFixed(3)} TND</b>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && checkoutStep !== 'success' && (
          <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
            {subtotal < minOrderValue && <div style={{ color: '#e74c3c', fontSize: '12px', marginBottom: '10px' }}>Add {(minOrderValue - subtotal).toFixed(3)} TND more to reach minimum order.</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '900', marginBottom: '20px' }}>
              <span>Total</span>
              <span>{(subtotal + 2.5).toFixed(3)} TND</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={checkoutStep === 'loading' || subtotal < minOrderValue}
              style={{ width: '100%', padding: '20px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
            >
              {checkoutStep === 'loading' ? <Loader size={24} /> : 'CHECKOUT'}
            </button>
          </div>
        )}
      </Sidebar>
    </>
  );
}
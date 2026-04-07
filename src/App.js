import React, { useState, useMemo } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { create } from 'zustand';
import { 
  ShoppingBag, Search, MapPin, Utensils, ShoppingBasket, 
  Zap, X, Plus, Minus, Star, Clock, ChevronRight 
} from 'lucide-react';

// --- STATE MANAGEMENT (ZUSTAND) ---
const useStore = create((set) => ({
  cart: [],
  isCartOpen: false,
  activeCategory: 'All',
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategory: (category) => set({ activeCategory: category }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  addToCart: (item) => set((state) => {
    const existing = state.cart.find(i => i.id === item.id);
    if (existing) {
      return { cart: state.cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
    }
    return { cart: [...state.cart, { ...item, qty: 1 }] };
  }),

  updateQty: (id, delta) => set((state) => ({
    cart: state.cart.map(item => 
      item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ).filter(item => item.qty > 0)
  })),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter(i => i.id !== id)
  })),
}));

// --- MOCK DATA ---
const CATEGORIES = [
  { id: 1, name: 'All', icon: <Zap size={18} /> },
  { id: 2, name: 'Food', icon: <Utensils size={18} /> },
  { id: 3, name: 'Groceries', icon: <ShoppingBasket size={18} /> },
];

const STORES = [
  { id: 1, name: 'Burger King - Tunis City', cat: 'Food', rating: 4.5, time: '20-30', img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500', price: 15, isOpen: true },
  { id: 2, name: 'Carrefour Market', cat: 'Groceries', rating: 4.8, time: '30-45', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', price: 5, isOpen: true },
  { id: 3, name: 'Sushi Zen Ariana', cat: 'Food', rating: 4.9, time: '25-40', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500', price: 25, isOpen: true },
  { id: 4, name: 'The Green Grocer', cat: 'Groceries', rating: 4.2, time: '15-25', img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500', price: 8, isOpen: false },
  { id: 5, name: 'Patisserie Masmoudi', cat: 'Food', rating: 4.7, time: '15-20', img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', price: 10, isOpen: true },
];

// --- STYLES ---
const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #ffc244;
    --secondary: #00a082;
    --dark: #2c3e50;
    --light: #f7f9fa;
  }
  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background-color: var(--light);
    color: var(--dark);
    overflow-x: hidden;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Nav = styled.nav`
  position: sticky; top: 0; background: white; padding: 0.8rem 5%;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); z-index: 1000;
`;

const SearchBox = styled.div`
  background: #f1f3f4; padding: 0.6rem 1rem; border-radius: 50px;
  display: flex; align-items: center; width: 35%; gap: 10px;
  input { border: none; background: transparent; width: 100%; outline: none; font-size: 0.9rem; }
`;

const Container = styled.main`
  max-width: 1100px; margin: 2rem auto; padding: 0 20px;
`;

const CategoryGrid = styled.div`
  display: flex; gap: 12px; margin-bottom: 2.5rem; overflow-x: auto; padding-bottom: 10px;
`;

const CatBtn = styled.button`
  background: ${props => props.active ? 'var(--primary)' : 'white'};
  border: none; padding: 12px 24px; border-radius: 50px;
  display: flex; align-items: center; gap: 8px; font-weight: 600;
  cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
`;

const StoreGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;
`;

const Card = styled.div`
  background: white; border-radius: 20px; overflow: hidden;
  transition: 0.3s; animation: ${fadeIn} 0.5s ease forwards;
  position: relative; cursor: pointer;
  &:hover { transform: scale(1.02); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
  img { width: 100%; height: 200px; object-fit: cover; filter: ${props => props.closed ? 'grayscale(1)' : 'none'}; }
`;

const StatusBadge = styled.span`
  position: absolute; top: 15px; left: 15px;
  background: ${props => props.open ? '#00a082' : '#666'};
  color: white; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: bold;
`;

const Sidebar = styled.aside`
  position: fixed; right: ${props => props.isOpen ? '0' : '-450px'};
  top: 0; width: 400px; height: 100vh; background: white;
  box-shadow: -10px 0 30px rgba(0,0,0,0.1); z-index: 2000;
  padding: 2rem; display: flex; flex-direction: column; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

const QtyControl = styled.div`
  display: flex; align-items: center; gap: 10px; background: #f1f3f4;
  padding: 4px 8px; border-radius: 8px;
  button { border: none; background: none; cursor: pointer; display: flex; align-items: center; }
`;

// --- MAIN COMPONENT ---
export default function App() {
  const { 
    cart, isCartOpen, toggleCart, activeCategory, setCategory, 
    searchQuery, setSearchQuery, addToCart, updateQty 
  } = useStore();

  const filteredStores = useMemo(() => {
    return STORES.filter(store => {
      const matchesCat = activeCategory === 'All' || store.cat === activeCategory;
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = subtotal > 0 ? 2.500 : 0;

  return (
    <>
      <GlobalStyle />
      
      <Nav>
        <h1 style={{ color: 'var(--primary)', fontWeight: 900, margin: 0, cursor: 'pointer' }}>glovo clone</h1>
        <SearchBox>
          <Search size={18} color="#999" />
          <input 
            placeholder="Search for stores or dishes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--secondary)', fontWeight: '600', fontSize: '14px' }}>
            <MapPin size={16} style={{ marginRight: '4px' }} /> Tunis, TN
          </div>
          <CatBtn active onClick={toggleCart} style={{ position: 'relative' }}>
            <ShoppingBag size={18} />
            {cart.length > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--secondary)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', display: 'grid', placeContent: 'center' }}>
                {cart.length}
              </span>
            )}
          </CatBtn>
        </div>
      </Nav>

      <Container>
        <CategoryGrid>
          {CATEGORIES.map(cat => (
            <CatBtn 
              key={cat.id} 
              active={activeCategory === cat.name}
              onClick={() => setCategory(cat.name)}
            >
              {cat.icon} {cat.name}
            </CatBtn>
          ))}
        </CategoryGrid>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Available in Grand Tunis</h2>
            <span style={{ color: 'var(--secondary)', fontWeight: 600, cursor: 'pointer' }}>See all <ChevronRight size={16} /></span>
          </div>

          <StoreGrid>
            {filteredStores.map(store => (
              <Card key={store.id} closed={!store.isOpen} onClick={() => store.isOpen && addToCart(store)}>
                <StatusBadge open={store.isOpen}>{store.isOpen ? 'OPEN' : 'CLOSED'}</StatusBadge>
                <img src={store.img} alt={store.name} />
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{store.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} color="#ffc244" fill="#ffc244" /> {store.rating}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {store.time} min
                    </span>
                    <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>
                      {store.price > 0 ? `Min. ${store.price} TND` : 'Free Delivery'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </StoreGrid>
        </section>
      </Container>

      <Sidebar isOpen={isCartOpen}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>My Basket</h2>
          <X style={{ cursor: 'pointer' }} onClick={toggleCart} />
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '100px', color: '#999' }}>
              <ShoppingBasket size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
              <p>Your basket is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--secondary)' }}>{item.price} TND</div>
                </div>
                <QtyControl>
                  <button onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                  <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                </QtyControl>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ borderTop: '2px solid #f1f3f4', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
              <span>Subtotal</span>
              <span>{subtotal.toFixed(3)} TND</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
              <span>Delivery Fee</span>
              <span>{deliveryFee.toFixed(3)} TND</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>
              <span>Total</span>
              <span>{(subtotal + deliveryFee).toFixed(3)} TND</span>
            </div>
            <button style={{ width: '100%', background: 'var(--secondary)', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.target.style.opacity = '0.9'} onMouseLeave={e => e.target.style.opacity = '1'}>
              Place Order
            </button>
          </div>
        )}
      </Sidebar>
    </>
  );
}
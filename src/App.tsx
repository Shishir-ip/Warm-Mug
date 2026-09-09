import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sun, Moon, ShoppingBag, Coffee, User, Search, X, Plus, Minus, Trash2, ArrowLeft, Sun as SunIcon, Moon as MoonIcon } from 'lucide-react';

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

// Sample products
const PRODUCTS: Product[] = [
  { id: 1, name: 'Ethiopian Yirgacheffe', description: 'Bright, fruity, floral notes', price: 18.99, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop', category: 'Single Origin' },
  { id: 2, name: 'Colombian Supremo', description: 'Rich, balanced, caramel sweetness', price: 16.99, image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400&h=400&fit=crop', category: 'Single Origin' },
  { id: 3, name: 'Espresso Blend', description: 'Bold, intense, chocolatey', price: 15.99, image: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=400&h=400&fit=crop', category: 'Blend' },
  { id: 4, name: 'Morning Ritual', description: 'Smooth, approachable, honey notes', price: 14.99, image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=400&fit=crop', category: 'Blend' },
  { id: 5, name: 'Kenyan AA', description: 'Vibrant, complex, blackcurrant', price: 19.99, image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&h=400&fit=crop', category: 'Single Origin' },
  { id: 6, name: 'Decaf Velvet', description: 'Smooth decaf, cocoa, vanilla', price: 17.99, image: 'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=400&h=400&fit=crop', category: 'Decaf' },
];

// Header Component
function Header({ cartCount, onCartClick, onAccountClick, theme, onThemeToggle }: {
  cartCount: number;
  onCartClick: () => void;
  onAccountClick: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}) {
  return (
    <header className="nb-card sticky top-0 z-40 m-4">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--accent-yellow)] border-[var(--border-width)] border-[var(--border-color)] flex items-center justify-center">
            <Coffee className="w-7 h-7" strokeWidth={3} />
          </div>
          <div>
            <h1 className="nb-heading text-2xl">WARM MUG</h1>
            <p className="text-xs font-bold uppercase tracking-wider">Specialty Coffee</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onThemeToggle}
            className="nb-button-secondary p-3"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" strokeWidth={3} /> : <Sun className="w-5 h-5" strokeWidth={3} />}
          </button>

          <button
            onClick={onAccountClick}
            className="nb-button-secondary p-3"
          >
            <User className="w-5 h-5" strokeWidth={3} />
          </button>

          <button
            onClick={onCartClick}
            className="nb-button p-3 relative"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={3} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent-red)] text-white border-2 border-[var(--border-color)] flex items-center justify-center text-xs font-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

// Product Card Component
function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
  return (
    <div className="nb-card overflow-hidden">
      <div className="aspect-square overflow-hidden border-b-[var(--border-width)] border-[var(--border-color)]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="mb-2">
          <span className="nb-badge inline-block mb-2">{product.category}</span>
        </div>
        <h3 className="nb-heading text-xl mb-2">{product.name}</h3>
        <p className="text-sm mb-4 text-[var(--text-secondary)]">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black">${product.price.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart(product)}
            className="nb-button px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}

// Cart Sidebar Component
function CartSidebar({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onCheckout }: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
}) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--bg-primary)] border-l-[var(--border-width)] border-[var(--border-color)] z-50 flex flex-col">
        <div className="nb-card m-4 flex items-center justify-between">
          <h2 className="nb-heading text-2xl">YOUR CART</h2>
          <button onClick={onClose} className="nb-button-secondary p-2">
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
              <p className="text-lg font-bold">Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="nb-card p-4">
                <div className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover border-2 border-[var(--border-color)]" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="nb-button-secondary p-1"
                      >
                        <Minus className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="nb-button-secondary p-1"
                      >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="nb-button-secondary p-1 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="nb-card m-4 p-4">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-lg">TOTAL:</span>
              <span className="font-black text-2xl">${total.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout} className="nb-button w-full py-3 text-lg">
              CHECKOUT
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Main App Content
function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAccountClick={() => {}}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Hero Section */}
      <section className="m-4">
        <div className="nb-card p-8 md:p-12 bg-[var(--accent-yellow)]">
          <div className="max-w-2xl">
            <h2 className="nb-heading text-4xl md:text-6xl mb-4">
              EXCEPTIONAL COFFEE, DELIVERED TO YOU
            </h2>
            <p className="text-lg mb-6 font-bold">
              Discover our curated selection of single-origin beans and artisan blends, sourced from the world's finest growing regions.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="nb-badge nb-badge-pink px-4 py-2">☕ ETHICALLY SOURCED</span>
              <span className="nb-badge nb-badge-blue px-4 py-2">🔥 ROASTED TO ORDER</span>
              <span className="nb-badge nb-badge-green px-4 py-2">🚚 FREE SHIPPING 50+</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="m-4">
        <h2 className="nb-heading text-3xl mb-6">OUR COFFEES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="nb-card m-4 mt-12 p-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="nb-heading text-xl mb-4">WARM MUG</h3>
            <p className="text-sm">Exceptional specialty coffee, roasted to order and delivered fresh to your door.</p>
          </div>
          <div>
            <h3 className="nb-heading text-xl mb-4">CONTACT</h3>
            <p className="text-sm">hello@warmmug.com</p>
            <p className="text-sm">+1 (503) 555-BREW</p>
          </div>
          <div>
            <h3 className="nb-heading text-xl mb-4">HOURS</h3>
            <p className="text-sm">Mon-Fri: 7am - 7pm</p>
            <p className="text-sm">Sat-Sun: 8am - 5pm</p>
          </div>
        </div>
        <div className="border-t-2 border-[var(--border-color)] mt-8 pt-4 text-center text-sm font-bold">
          © 2026 WARM MUG COFFEE CO. ALL RIGHTS RESERVED.
        </div>
      </footer>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => alert('Checkout functionality coming soon!')}
      />
    </div>
  );
}

// Main App with Theme Provider
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

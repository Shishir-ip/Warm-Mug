import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sun, Moon, ShoppingBag, Coffee, User, Search, X, Plus, Minus, Trash2, Grid, List, Star, MapPin, Flame, Shield, LogIn } from 'lucide-react';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AuthPage from './pages/AuthPage';
import UserAccountPage from './pages/UserAccountPage';
import CampaignPage from './pages/CampaignPage';
import Carousel from './components/Carousel';
import { supabase } from './lib/supabase';

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  image: string;
  category: string;
  origin: string;
  roast: string;
  notes: string[];
  weight: string;
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  quantity: number;
}

// Sample products data
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Ethiopian Yirgacheffe',
    description: 'Bright, fruity, floral notes',
    longDescription: 'A stunning single-origin from the birthplace of coffee. This natural-process Ethiopian showcases intense blueberry and jasmine notes with a silky body.',
    price: 18.99,
    originalPrice: 22.99,
    discountType: 'percentage',
    discountValue: 15,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
    category: 'Single Origin',
    origin: 'Ethiopia',
    roast: 'Light',
    notes: ['Blueberry', 'Jasmine', 'Dark Chocolate'],
    weight: '250g',
    rating: 4.9,
    reviews: 127
  },
  {
    id: 2,
    name: 'Colombian Supremo',
    description: 'Rich, balanced, caramel sweetness',
    longDescription: 'Sourced from the highlands of Huila, Colombia, this Supremo grade bean delivers a perfectly balanced cup with rich caramel sweetness.',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400&h=400&fit=crop',
    category: 'Single Origin',
    origin: 'Colombia',
    roast: 'Medium',
    notes: ['Caramel', 'Green Apple', 'Hazelnut'],
    weight: '250g',
    rating: 4.7,
    reviews: 98
  },
  {
    id: 3,
    name: 'Espresso Blend',
    description: 'Bold, intense, chocolatey',
    longDescription: 'Our signature espresso blend combines Brazilian and Sumatran beans for a full-bodied, low-acid experience.',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=400&h=400&fit=crop',
    category: 'Blend',
    origin: 'Brazil & Sumatra',
    roast: 'Dark',
    notes: ['Dark Chocolate', 'Toasted Walnut', 'Smoky'],
    weight: '250g',
    rating: 4.8,
    reviews: 156
  },
  {
    id: 4,
    name: 'Morning Ritual',
    description: 'Smooth, approachable, honey notes',
    longDescription: 'A carefully crafted blend designed for your daily ritual. Combining washed Central American beans with a touch of natural-process Ethiopian.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=400&fit=crop',
    category: 'Blend',
    origin: 'Guatemala & Ethiopia',
    roast: 'Medium',
    notes: ['Honey', 'Milk Chocolate', 'Citrus'],
    weight: '250g',
    rating: 4.6,
    reviews: 203
  },
  {
    id: 5,
    name: 'Kenyan AA',
    description: 'Vibrant, complex, blackcurrant',
    longDescription: 'A rare peaberry selection from Kenya\'s central highlands. These unique single-seed beans produce an exceptionally vibrant cup.',
    price: 19.99,
    originalPrice: 24.99,
    discountType: 'fixed',
    discountValue: 5,
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&h=400&fit=crop',
    category: 'Single Origin',
    origin: 'Kenya',
    roast: 'Light',
    notes: ['Blackcurrant', 'Grapefruit', 'Brown Sugar'],
    weight: '200g',
    rating: 4.9,
    reviews: 74
  },
  {
    id: 6,
    name: 'Decaf Velvet',
    description: 'Smooth decaf, cocoa, vanilla',
    longDescription: 'Swiss Water Process decaffeinated without compromising on flavor. Rich cocoa, subtle vanilla, and a gentle warmth of cinnamon.',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=400&h=400&fit=crop',
    category: 'Decaf',
    origin: 'Mexico',
    roast: 'Medium-Dark',
    notes: ['Cocoa', 'Vanilla', 'Cinnamon'],
    weight: '250g',
    rating: 4.5,
    reviews: 89
  }
];

// Header Component
function Header({ cartCount, onCartClick, onAdminClick, onAccountClick, theme, onThemeToggle, isAdmin }: {
  cartCount: number;
  onCartClick: () => void;
  onAdminClick: () => void;
  onAccountClick: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  isAdmin?: boolean;
}) {
  return (
    <header className="nb-card sticky top-0 z-40 m-2 sm:m-4">
      <div className="flex items-center justify-between p-2 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--accent-yellow)] border-[var(--border-width)] border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
            <Coffee className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={3} />
          </div>
          <div className="min-w-0">
            <h1 className="nb-heading text-lg sm:text-2xl truncate">WARM MUG</h1>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:block">Specialty Coffee</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={onThemeToggle}
            className="nb-button-secondary p-2 sm:p-3"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />}
          </button>

          {isAdmin && (
            <button
              onClick={onAdminClick}
              className="nb-button-secondary p-2 sm:p-3 hidden sm:block"
              title="Admin Dashboard"
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
            </button>
          )}

          <button onClick={onAccountClick} className="nb-button-secondary p-2 sm:p-3">
            <User className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
          </button>

          <button
            onClick={onCartClick}
            className="nb-button p-2 sm:p-3 relative"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[var(--accent-red)] text-[var(--text-primary)] border-2 border-[var(--border-color)] flex items-center justify-center text-[10px] sm:text-xs font-black animate-bounce-in">
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
function ProductCard({ product, onAddToCart, onViewDetails }: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}) {
  const hasDiscount = product.originalPrice && product.discountType && product.discountValue;
  const finalPrice = hasDiscount
    ? product.discountType === 'percentage'
      ? product.price * (1 - product.discountValue! / 100)
      : product.price - product.discountValue!
    : product.price;

  return (
    <div className="nb-card overflow-hidden group flex flex-col">
      <div
        className="aspect-square overflow-hidden border-b-[var(--border-width)] border-[var(--border-color)] cursor-pointer relative flex-shrink-0"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {hasDiscount && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
            <span className="nb-badge nb-badge-red px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs">
              {product.discountType === 'percentage'
                ? `${product.discountValue}% OFF`
                : `$${product.discountValue} OFF`}
            </span>
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        <div className="mb-1">
          <span className="nb-badge inline-block mb-1 text-[10px] sm:text-xs">{product.category}</span>
        </div>
        <h3 
          className="nb-heading text-sm sm:text-base mb-1 cursor-pointer hover:text-[var(--accent-yellow)] transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]" 
          onClick={() => onViewDetails(product)}
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs mb-2 text-[var(--text-secondary)] line-clamp-2">{product.description}</p>

        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[var(--accent-yellow)] text-[var(--accent-yellow)]" strokeWidth={2} />
            <span className="text-[10px] sm:text-xs font-bold">{product.rating}</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">({product.reviews})</span>
        </div>

        <div className="flex flex-wrap gap-0.5 mb-2">
          {product.notes.slice(0, 2).map(note => (
            <span key={note} className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] font-bold">
              {note}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-1.5 mt-auto">
          <div className="flex-1 min-w-0">
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs line-through text-[var(--text-muted)] mr-1 block sm:inline">
                ${product.originalPrice!.toFixed(2)}
              </span>
            )}
            <span className="text-base sm:text-lg font-black block sm:inline">${finalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="nb-button px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 text-[10px] sm:text-xs flex-shrink-0"
          >
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />
            <span className="hidden sm:inline">ADD</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Product Detail Modal
function ProductDetailModal({ product, onClose, onAddToCart }: {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const hasDiscount = product.originalPrice && product.discountType && product.discountValue;
  const finalPrice = hasDiscount
    ? product.discountType === 'percentage'
      ? product.price * (1 - product.discountValue! / 100)
      : product.price - product.discountValue!
    : product.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="nb-card relative max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-bounce-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 nb-button-secondary p-2 z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          <div className="aspect-square md:aspect-auto">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-4 sm:p-6">
            <span className="nb-badge inline-block mb-2 sm:mb-3 text-xs sm:text-sm">{product.category}</span>
            <h2 className="nb-heading text-xl sm:text-3xl mb-2 sm:mb-3 leading-tight">{product.name}</h2>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                <span>{product.origin}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                <span>{product.roast} Roast</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3 sm:mb-4">{product.longDescription}</p>

            <div className="mb-3 sm:mb-4">
              <h4 className="font-bold mb-2 text-sm sm:text-base">Tasting Notes</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {product.notes.map(note => (
                  <span key={note} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] font-bold text-xs sm:text-sm">
                    {note}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm text-[var(--text-muted)]">Package: </span>
              <span className="font-bold text-sm sm:text-base">{product.weight}</span>
            </div>

            <div className="border-t-2 border-[var(--border-color)] pt-3 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                <div>
                  {hasDiscount && (
                    <span className="text-sm sm:text-lg line-through text-[var(--text-muted)] mr-2 block sm:inline">
                      ${product.originalPrice!.toFixed(2)}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-black block sm:inline">${finalPrice.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] px-2 sm:px-3 py-1.5 sm:py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="nb-button-secondary p-1"
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />
                  </button>
                  <span className="font-bold w-6 sm:w-8 text-center text-sm sm:text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="nb-button-secondary p-1"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="nb-button w-full py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                ADD TO CART - ${(finalPrice * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart Sidebar
function CartSidebar({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onCheckout }: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
}) {
  const total = cart.reduce((sum, item) => {
    const hasDiscount = item.originalPrice && item.discountType && item.discountValue;
    const price = hasDiscount
      ? item.discountType === 'percentage'
        ? item.price * (1 - item.discountValue! / 100)
        : item.price - item.discountValue!
      : item.price;
    return sum + price * item.quantity;
  }, 0);

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
            cart.map(item => {
              const hasDiscount = item.originalPrice && item.discountType && item.discountValue;
              const price = hasDiscount
                ? item.discountType === 'percentage'
                  ? item.price * (1 - item.discountValue! / 100)
                  : item.price - item.discountValue!
                : item.price;

              return (
                <div key={item.id} className="nb-card p-4">
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover border-2 border-[var(--border-color)]" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">${price.toFixed(2)}</p>
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
              );
            })
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
  const [currentPage, setCurrentPage] = useState<'home' | 'checkout' | 'admin' | 'admin-login' | 'auth' | 'account' | 'campaign'>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  // Check auth state on mount
  useEffect(() => {
    const checkAdminStatus = async (user: any) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      try {
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(!!adminProfile);
      } catch (err) {
        setIsAdmin(false);
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUser(data.user);
        checkAdminStatus(data.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      checkAdminStatus(user);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const categories = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.notes.some(note => note.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
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

  const handleCheckout = () => {
    setIsCartOpen(false);
    setCurrentPage('checkout');
  };

  const handleOrderComplete = async (orderData: any) => {
    try {
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderData.order_number,
          status: orderData.status,
          subtotal: orderData.subtotal,
          shipping_cost: orderData.shipping_cost,
          tax: orderData.tax,
          total: orderData.total,
          shipping_name: orderData.shipping_name,
          shipping_phone: orderData.shipping_phone,
          shipping_address: orderData.shipping_address,
          shipping_city: orderData.shipping_city,
          shipping_landmark: orderData.shipping_landmark,
          shipping_country: orderData.shipping_country,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status,
          mobile_banking_provider: orderData.mobile_banking_provider,
          mobile_banking_number: orderData.mobile_banking_number,
          mobile_banking_transaction_id: orderData.mobile_banking_transaction_id,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      if (order) {
        const orderItems = orderData.items.map((item: any) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // Clear cart and redirect to home
      setCart([]);
      setCurrentPage('home');
      alert('Order placed successfully! Order number: ' + orderData.order_number);
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Error placing order. Please try again.');
    }
  };

  const handleAuthSuccess = () => {
    setCurrentPage('account');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdmin(false);
    setCurrentPage('home');
  };

  // Render different pages
  if (currentPage === 'checkout') {
    return (
      <CheckoutPage
        cart={cart}
        cartTotal={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        onBack={() => setCurrentPage('home')}
        onOrderComplete={handleOrderComplete}
      />
    );
  }

  if (currentPage === 'admin-login') {
    return (
      <AdminLogin
        onBack={() => setCurrentPage('home')}
        onAdminLogin={() => {
          // Reload current user to get admin status
          supabase.auth.getUser().then(({ data }) => {
            if (data?.user) {
              setCurrentUser(data.user);
              setCurrentPage('admin');
            }
          });
        }}
      />
    );
  }

  if (currentPage === 'admin') {
    // Check if user is authenticated and has admin role
    if (!currentUser) {
      return (
        <AdminLogin
          onBack={() => setCurrentPage('home')}
          onAdminLogin={() => {
            // Reload current user to get admin status
            supabase.auth.getUser().then(({ data }) => {
              if (data?.user) {
                setCurrentUser(data.user);
              }
            });
          }}
        />
      );
    }

    // Check if user has admin role
    const checkAdmin = async () => {
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!adminProfile) {
        // Not an admin, redirect to home
        setCurrentPage('home');
        alert('Access denied. You do not have admin privileges.');
      }
    };

    checkAdmin();

    return (
      <AdminDashboard
        onBack={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'auth') {
    return (
      <AuthPage
        onBack={() => setCurrentPage('home')}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (currentPage === 'account') {
    if (!currentUser) {
      return (
        <AuthPage
          onBack={() => setCurrentPage('home')}
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }
    return (
      <UserAccountPage
        onBack={() => setCurrentPage('home')}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === 'campaign' && selectedCampaignId) {
    return (
      <CampaignPage
        campaignId={selectedCampaignId}
        onBack={() => {
          setSelectedCampaignId(null);
          setCurrentPage('home');
        }}
        onAddToCart={addToCart}
        onViewProduct={setSelectedProduct}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={() => setCurrentPage('admin')}
        onAccountClick={() => setCurrentPage('account')}
        theme={theme}
        onThemeToggle={toggleTheme}
        isAdmin={isAdmin}
      />

      {/* Campaign Carousel */}
      <section className="m-2 sm:m-4">
        <Carousel onCampaignClick={(campaignId) => {
          setSelectedCampaignId(campaignId);
          setCurrentPage('campaign');
        }} />
      </section>

      {/* Search and Filters */}
      <section className="m-2 sm:m-4">
        <div className="nb-card p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search coffees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nb-input w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`nb-button px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${selectedCategory === category ? 'bg-[var(--accent-pink)]' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`nb-button-secondary p-2 sm:p-3 ${viewMode === 'grid' ? 'bg-[var(--accent-blue)]' : ''}`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`nb-button-secondary p-2 sm:p-3 ${viewMode === 'list' ? 'bg-[var(--accent-blue)]' : ''}`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm mb-3 sm:mb-4 font-bold px-1">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          {searchQuery && <span className="break-all"> for "{searchQuery}"</span>}
        </p>
      </section>

      {/* Products Grid/List */}
      <section className="m-2 sm:m-4" id="products-section">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="nb-card p-2 sm:p-3 flex gap-2 sm:gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-[var(--border-color)] cursor-pointer flex-shrink-0"
                  onClick={() => setSelectedProduct(product)}
                />
                <div className="flex-1 min-w-0">
                  <span className="nb-badge inline-block mb-1 text-[10px] sm:text-xs">{product.category}</span>
                  <h3 
                    className="nb-heading text-sm sm:text-base mb-0.5 sm:mb-1 cursor-pointer line-clamp-1" 
                    onClick={() => setSelectedProduct(product)}
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs mb-1.5 text-[var(--text-secondary)] line-clamp-1">{product.description}</p>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[var(--accent-yellow)] text-[var(--accent-yellow)]" strokeWidth={2} />
                    <span className="text-[10px] sm:text-xs font-bold">{product.rating}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-base sm:text-lg font-black">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="nb-button px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 text-[10px] sm:text-xs flex-shrink-0"
                    >
                      <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />
                      <span className="hidden sm:inline">ADD</span>
                      <span className="sm:hidden">+</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="nb-card m-2 sm:m-4 mt-8 sm:mt-12 p-3 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <h3 className="nb-heading text-sm sm:text-base mb-2">WARM MUG</h3>
            <p className="text-[10px] sm:text-xs break-words">Specialty coffee, roasted to order.</p>
          </div>
          <div>
            <h3 className="nb-heading text-sm sm:text-base mb-2">CONTACT</h3>
            <p className="text-[10px] sm:text-xs break-all">hello@warmmug.com</p>
            <p className="text-[10px] sm:text-xs break-all">+1 (503) 555-BREW</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h3 className="nb-heading text-sm sm:text-base mb-2">HOURS</h3>
            <p className="text-[10px] sm:text-xs">Mon-Fri: 7am-7pm</p>
            <p className="text-[10px] sm:text-xs">Sat-Sun: 8am-5pm</p>
          </div>
        </div>
        <div className="border-t-2 border-[var(--border-color)] pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] sm:text-xs font-bold text-center sm:text-left">
            © 2026 WARM MUG COFFEE CO.
          </p>
          <button
            onClick={() => setCurrentPage('admin-login')}
            className="nb-button-secondary px-3 py-1.5 text-[10px] sm:text-xs flex items-center gap-1.5"
          >
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={3} />
            STAFF LOGIN
          </button>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
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

import { useState, useEffect } from 'react';
import { supabase, Order, Product } from '../lib/supabase';
import { ArrowLeft, Package, TrendingUp, Users, RefreshCw, ChevronDown, ShoppingBag, Tag, Settings, Megaphone, Plus, Edit2, Trash2 } from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

type Tab = 'overview' | 'orders' | 'products' | 'categories' | 'campaigns' | 'settings';

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Calculate stats
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total, 0) || 0;
      const pendingOrders = ordersData?.filter(o => o.status === 'pending').length || 0;

      setStats({
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        pendingOrders,
        totalProducts: productsData?.length || 0,
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Error loading data. Please check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Error updating order status.');
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      setStats({ ...stats, totalProducts: stats.totalProducts - 1 });
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error deleting product.');
    }
  };

  const toggleProductActive = async (productId: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p =>
        p.id === productId ? { ...p, is_active: !isActive } : p
      ));
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Error updating product.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="nb-card m-4">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="nb-button-secondary p-2">
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            </button>
            <h1 className="nb-heading text-xl sm:text-2xl">ADMIN DASHBOARD</h1>
          </div>
          <button onClick={fetchAllData} className="nb-button px-3 py-2 sm:px-4 sm:py-2 flex items-center gap-2 text-sm sm:text-base">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={3} />
            <span className="hidden sm:inline">REFRESH</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="m-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`nb-button px-4 py-2 flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === 'overview' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <TrendingUp className="w-4 h-4" strokeWidth={3} />
          OVERVIEW
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`nb-button px-4 py-2 flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === 'orders' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <Package className="w-4 h-4" strokeWidth={3} />
          ORDERS ({stats.totalOrders})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`nb-button px-4 py-2 flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === 'products' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <ShoppingBag className="w-4 h-4" strokeWidth={3} />
          PRODUCTS ({stats.totalProducts})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`nb-button px-4 py-2 flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === 'categories' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <Tag className="w-4 h-4" strokeWidth={3} />
          CATEGORIES
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`nb-button px-4 py-2 flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === 'campaigns' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <Megaphone className="w-4 h-4" strokeWidth={3} />
          CAMPAIGNS
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`nb-button px-4 py-2 flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === 'settings' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <Settings className="w-4 h-4" strokeWidth={3} />
          SETTINGS
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="m-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="nb-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--accent-blue)] border-2 border-[var(--border-color)] flex items-center justify-center">
                  <Package className="w-6 h-6" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold">TOTAL ORDERS</p>
                  <p className="text-2xl sm:text-3xl font-black">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="nb-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--accent-green)] border-2 border-[var(--border-color)] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold">TOTAL REVENUE</p>
                  <p className="text-2xl sm:text-3xl font-black">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="nb-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--accent-pink)] border-2 border-[var(--border-color)] flex items-center justify-center">
                  <Users className="w-6 h-6" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold">PENDING ORDERS</p>
                  <p className="text-2xl sm:text-3xl font-black">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="nb-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--accent-purple)] border-2 border-[var(--border-color)] flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold">TOTAL PRODUCTS</p>
                  <p className="text-2xl sm:text-3xl font-black">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="nb-card p-6">
            <h2 className="nb-heading text-xl mb-4">QUICK ACTIONS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => setActiveTab('orders')} className="nb-button py-4 flex items-center justify-center gap-2">
                <Package className="w-5 h-5" strokeWidth={3} />
                MANAGE ORDERS
              </button>
              <button onClick={() => setActiveTab('products')} className="nb-button py-4 flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" strokeWidth={3} />
                MANAGE PRODUCTS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="m-4">
          <h2 className="nb-heading text-xl mb-4">ORDER MANAGEMENT</h2>

          {loading ? (
            <div className="nb-card p-12 text-center">
              <p className="text-lg font-bold">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="nb-card p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
              <p className="text-lg font-bold">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="nb-card overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="font-black text-base sm:text-lg truncate">#{order.order_number}</p>
                          <span className={`nb-badge text-xs ${
                            order.status === 'pending' ? 'nb-badge-red' :
                            order.status === 'processing' ? 'nb-badge-blue' :
                            order.status === 'shipped' ? 'nb-badge-pink' :
                            'nb-badge-green'
                          }`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                          <span className="truncate">👤 {order.shipping_name}</span>
                          <span className="truncate">📞 {order.shipping_phone}</span>
                          <span>📅 {new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <p className="text-xl sm:text-2xl font-black">${order.total.toFixed(2)}</p>
                        <ChevronDown
                          className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`}
                          strokeWidth={3}
                        />
                      </div>
                    </div>
                  </div>

                  {expandedOrderId === order.id && (
                    <div className="border-t-2 border-[var(--border-color)] p-4 space-y-4 animate-slide-up">
                      <div>
                        <h3 className="font-bold mb-2 text-sm sm:text-base">SHIPPING ADDRESS</h3>
                        <div className="nb-card p-3 bg-[var(--bg-tertiary)] text-sm">
                          <p>{order.shipping_name}</p>
                          <p>{order.shipping_phone}</p>
                          <p>{order.shipping_address}</p>
                          <p>{order.shipping_city}</p>
                          {order.shipping_landmark && <p className="text-xs">📍 {order.shipping_landmark}</p>}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold mb-2 text-sm sm:text-base">ORDER ITEMS</h3>
                        <div className="space-y-2">
                          {order.items?.map(item => (
                            <div key={item.id} className="nb-card p-3 flex gap-3">
                              <img src={item.product_image} alt={item.product_name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover border-2 border-[var(--border-color)]" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{item.product_name}</p>
                                <p className="text-xs">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                              </div>
                              <p className="font-bold text-sm">${item.total_price.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold mb-2 text-sm sm:text-base">UPDATE STATUS</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map(status => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(order.id, status)}
                              className={`nb-button py-2 text-xs sm:text-sm ${order.status === status ? 'bg-[var(--accent-green)]' : ''}`}
                            >
                              {status.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="m-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="nb-heading text-xl">PRODUCT MANAGEMENT</h2>
            <button className="nb-button px-4 py-2 flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span className="hidden sm:inline">ADD PRODUCT</span>
            </button>
          </div>

          {loading ? (
            <div className="nb-card p-12 text-center">
              <p className="text-lg font-bold">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="nb-card p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
              <p className="text-lg font-bold">No products yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="nb-card overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover border-b-2 border-[var(--border-color)]" />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="nb-badge text-xs">{product.category}</span>
                      <span className={`nb-badge text-xs ${product.is_active ? 'nb-badge-green' : 'nb-badge-red'}`}>
                        {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-2xl font-black mb-3">${product.price.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleProductActive(product.id, product.is_active)}
                        className="nb-button-secondary px-3 py-1.5 text-xs flex-1"
                      >
                        {product.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="nb-button-secondary px-3 py-1.5 text-xs"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="m-4">
          <h2 className="nb-heading text-xl mb-4">CATEGORY MANAGEMENT</h2>
          <div className="nb-card p-12 text-center">
            <Tag className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
            <p className="text-lg font-bold mb-2">Category Management</p>
            <p className="text-sm text-[var(--text-muted)]">Coming soon - Manage product categories</p>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="m-4">
          <h2 className="nb-heading text-xl mb-4">CAMPAIGN MANAGEMENT</h2>
          <div className="nb-card p-12 text-center">
            <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
            <p className="text-lg font-bold mb-2">Campaign Management</p>
            <p className="text-sm text-[var(--text-muted)]">Coming soon - Manage marketing campaigns</p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="m-4">
          <h2 className="nb-heading text-xl mb-4">STORE SETTINGS</h2>
          <div className="nb-card p-12 text-center">
            <Settings className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
            <p className="text-lg font-bold mb-2">Store Settings</p>
            <p className="text-sm text-[var(--text-muted)]">Coming soon - Configure store settings</p>
          </div>
        </div>
      )}
    </div>
  );
}

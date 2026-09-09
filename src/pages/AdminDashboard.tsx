import { useState, useEffect } from 'react';
import { supabase, Order } from '../lib/supabase';
import { ArrowLeft, Package, TrendingUp, Users, RefreshCw, ChevronDown } from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      
      // Calculate stats
      const totalRevenue = data?.reduce((sum, order) => sum + order.total, 0) || 0;
      const pendingOrders = data?.filter(o => o.status === 'pending').length || 0;
      
      setStats({
        totalOrders: data?.length || 0,
        totalRevenue,
        pendingOrders,
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
      alert('Error loading orders. Please check your Supabase connection.');
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

  return (
    <div className="min-h-screen">
      <div className="nb-card m-4">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="nb-button-secondary p-2">
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            </button>
            <h1 className="nb-heading text-2xl">ADMIN DASHBOARD</h1>
          </div>
          <button onClick={fetchOrders} className="nb-button px-4 py-2 flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={3} />
            REFRESH
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="m-4 grid md:grid-cols-3 gap-4">
        <div className="nb-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--accent-blue)] border-2 border-[var(--border-color)] flex items-center justify-center">
              <Package className="w-6 h-6" strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-bold">TOTAL ORDERS</p>
              <p className="text-3xl font-black">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="nb-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--accent-green)] border-2 border-[var(--border-color)] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-bold">TOTAL REVENUE</p>
              <p className="text-3xl font-black">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="nb-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--accent-pink)] border-2 border-[var(--border-color)] flex items-center justify-center">
              <Users className="w-6 h-6" strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-bold">PENDING ORDERS</p>
              <p className="text-3xl font-black">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="m-4">
        <h2 className="nb-heading text-xl mb-4">ORDERS</h2>
        
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
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-black text-lg">#{order.order_number}</p>
                        <span className={`nb-badge ${
                          order.status === 'pending' ? 'nb-badge-red' :
                          order.status === 'processing' ? 'nb-badge-blue' :
                          order.status === 'shipped' ? 'nb-badge-pink' :
                          order.status === 'delivered' ? 'nb-badge-green' : ''
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>👤 {order.shipping_name}</span>
                        <span>📞 {order.shipping_phone}</span>
                        <span>📅 {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-2xl font-black">${order.total.toFixed(2)}</p>
                      <ChevronDown
                        className={`w-6 h-6 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`}
                        strokeWidth={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrderId === order.id && (
                  <div className="border-t-2 border-[var(--border-color)] p-4 space-y-4 animate-slide-up">
                    {/* Shipping Address */}
                    <div>
                      <h3 className="font-bold mb-2">SHIPPING ADDRESS</h3>
                      <div className="nb-card p-3 bg-[var(--bg-tertiary)]">
                        <p>{order.shipping_name}</p>
                        <p>{order.shipping_phone}</p>
                        <p>{order.shipping_address}</p>
                        <p>{order.shipping_city}</p>
                        {order.shipping_landmark && <p className="text-sm">📍 {order.shipping_landmark}</p>}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h3 className="font-bold mb-2">PAYMENT INFO</h3>
                      <div className="nb-card p-3 bg-[var(--bg-tertiary)]">
                        <p>Method: <span className="font-bold">{order.payment_method.toUpperCase()}</span></p>
                        <p>Status: <span className="font-bold">{order.payment_status.toUpperCase()}</span></p>
                        {order.mobile_banking_provider && (
                          <>
                            <p>Provider: <span className="font-bold">{order.mobile_banking_provider.toUpperCase()}</span></p>
                            <p>Mobile: <span className="font-bold">{order.mobile_banking_number}</span></p>
                            <p>Transaction ID: <span className="font-bold">{order.mobile_banking_transaction_id}</span></p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-bold mb-2">ORDER ITEMS</h3>
                      <div className="space-y-2">
                        {order.items?.map(item => (
                          <div key={item.id} className="nb-card p-3 flex gap-3">
                            <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover border-2 border-[var(--border-color)]" />
                            <div className="flex-1">
                              <p className="font-bold">{item.product_name}</p>
                              <p className="text-sm">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                            </div>
                            <p className="font-bold">${item.total_price.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="nb-card p-3 bg-[var(--bg-tertiary)]">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Subtotal:</span>
                        <span className="font-bold">${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Shipping:</span>
                        <span className="font-bold">${order.shipping_cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tax:</span>
                        <span className="font-bold">${order.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg border-t-2 border-[var(--border-color)] pt-2">
                        <span className="font-black">TOTAL:</span>
                        <span className="font-black">${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Update Status */}
                    <div>
                      <h3 className="font-bold mb-2">UPDATE STATUS</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map(status => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status)}
                            className={`nb-button py-2 ${order.status === status ? 'bg-[var(--accent-green)]' : ''}`}
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
    </div>
  );
}

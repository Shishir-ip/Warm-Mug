import { useState, useEffect } from 'react';
import { supabase, UserProfile, Order, UserAddress } from '../lib/supabase';
import { ArrowLeft, User, Package, MapPin, LogOut, Plus } from 'lucide-react';

interface UserAccountPageProps {
  onBack: () => void;
  onLogout: () => void;
}

type Tab = 'profile' | 'orders' | 'addresses';

export default function UserAccountPage({ onBack, onLogout }: UserAccountPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setProfileForm({
          full_name: profileData.full_name,
          phone: profileData.phone || '',
        });
      }

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch order items for user's orders
      const orderIds = ordersData?.map(o => o.id) || [];
      const { data: orderItemsData } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      // Merge order items with orders
      const ordersWithItems = (ordersData || []).map((order: any) => ({
        ...order,
        items: (orderItemsData || []).filter((item: any) => item.order_id === order.id)
      }));

      setOrders(ordersWithItems);

      // Fetch addresses
      const { data: addressesData } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setAddresses(addressesData || []);
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;

      // Try to update first, if it fails (no profile exists), insert instead
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone || null,
        })
        .eq('id', user.id);

      if (updateError) {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([{
            id: user.id,
            email: user.email,
            full_name: profileForm.full_name,
            phone: profileForm.phone || null,
          }]);

        if (insertError) throw insertError;
      }

      setEditingProfile(false);
      fetchUserData();
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Delete this address?')) return;
    
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      fetchUserData();
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Error deleting address');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="nb-card m-2 sm:m-4">
        <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button onClick={onBack} className="nb-button-secondary p-2 flex-shrink-0">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
            </button>
            <h1 className="nb-heading text-lg sm:text-2xl truncate">MY ACCOUNT</h1>
          </div>
          <button onClick={onLogout} className="nb-button px-3 py-2 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
            <span className="text-xs sm:text-sm">LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="m-2 sm:m-4 flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        <button
          onClick={() => setActiveTab('profile')}
          className={`nb-button px-3 py-2 sm:px-6 sm:py-3 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${activeTab === 'profile' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <User className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
          <span>PROFILE</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`nb-button px-3 py-2 sm:px-6 sm:py-3 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${activeTab === 'orders' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <Package className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
          <span>ORDERS ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`nb-button px-3 py-2 sm:px-6 sm:py-3 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${activeTab === 'addresses' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
          <span>ADDRESSES ({addresses.length})</span>
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="m-2 sm:m-4">
          <div className="nb-card p-4 sm:p-6">
            <h2 className="nb-heading text-lg sm:text-xl mb-4">PROFILE INFORMATION</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-base sm:text-lg font-bold">Loading profile...</p>
              </div>
            ) : !profile ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
                <p className="text-base sm:text-lg font-bold mb-2">No profile found</p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-4">Please complete your profile information</p>
                <button 
                  onClick={() => setEditingProfile(true)} 
                  className="nb-button px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base"
                >
                  CREATE PROFILE
                </button>
              </div>
            ) : editingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2">FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="nb-input w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2">EMAIL</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="nb-input w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2">PHONE</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="nb-input w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="nb-button px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base flex-1">SAVE</button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="nb-button-secondary px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base flex-1">CANCEL</button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm font-bold">FULL NAME</p>
                  <p className="text-base sm:text-lg break-words">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold">EMAIL</p>
                  <p className="text-base sm:text-lg break-all">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold">PHONE</p>
                  <p className="text-base sm:text-lg break-all">{profile.phone || 'Not set'}</p>
                </div>
                <button onClick={() => setEditingProfile(true)} className="nb-button px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base w-full sm:w-auto">EDIT PROFILE</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="m-2 sm:m-4 space-y-3 sm:space-y-4">
          <h2 className="nb-heading text-lg sm:text-xl">ORDER HISTORY</h2>
          
          {orders.length === 0 ? (
            <div className="nb-card p-8 sm:p-12 text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
              <p className="text-base sm:text-lg font-bold">No orders yet</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="nb-card p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-sm sm:text-lg truncate">#{order.order_number}</p>
                    <p className="text-xs sm:text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`nb-badge text-[10px] sm:text-xs ${
                      order.status === 'pending' ? 'nb-badge-red' :
                      order.status === 'processing' ? 'nb-badge-blue' :
                      order.status === 'shipped' ? 'nb-badge-pink' :
                      'nb-badge-green'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                    <p className="text-xl sm:text-2xl font-black mt-2">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="border-t-2 border-[var(--border-color)] pt-2 sm:pt-3 space-y-2">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex gap-2 sm:gap-3">
                      <img src={item.product_image} alt={item.product_name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover border-2 border-[var(--border-color)] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs sm:text-sm truncate">{item.product_name}</p>
                        <p className="text-[10px] sm:text-xs">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                      </div>
                      <p className="font-bold text-xs sm:text-sm flex-shrink-0">${item.total_price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="m-2 sm:m-4 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="nb-heading text-lg sm:text-xl">SAVED ADDRESSES</h2>
            <button className="nb-button px-3 py-2 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
              <span className="hidden sm:inline">ADD ADDRESS</span>
              <span className="sm:hidden">ADD</span>
            </button>
          </div>
          
          {addresses.length === 0 ? (
            <div className="nb-card p-8 sm:p-12 text-center">
              <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
              <p className="text-base sm:text-lg font-bold">No saved addresses</p>
            </div>
          ) : (
            addresses.map(address => (
              <div key={address.id} className="nb-card p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-black text-base sm:text-lg truncate">{address.label}</p>
                      {address.is_default && (
                        <span className="nb-badge nb-badge-green text-[10px] sm:text-xs">DEFAULT</span>
                      )}
                    </div>
                    <p className="font-bold text-sm sm:text-base truncate">{address.full_name}</p>
                    <p className="text-xs sm:text-sm break-all">{address.phone}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="nb-button-secondary px-3 py-1.5 sm:p-2 text-xs sm:text-sm flex-shrink-0"
                  >
                    DELETE
                  </button>
                </div>
                <div className="border-t-2 border-[var(--border-color)] pt-2">
                  <p className="text-xs sm:text-sm break-words">{address.address_line}</p>
                  <p className="text-xs sm:text-sm">{address.city}</p>
                  {address.landmark && <p className="text-xs sm:text-sm break-words">📍 {address.landmark}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

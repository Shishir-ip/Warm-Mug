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
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);

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
      <div className="nb-card m-4">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="nb-button-secondary p-2">
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            </button>
            <h1 className="nb-heading text-2xl">MY ACCOUNT</h1>
          </div>
          <button onClick={onLogout} className="nb-button px-4 py-2 flex items-center gap-2">
            <LogOut className="w-4 h-4" strokeWidth={3} />
            LOGOUT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="m-4 flex gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`nb-button px-6 py-3 flex items-center gap-2 ${activeTab === 'profile' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <User className="w-5 h-5" strokeWidth={3} />
          PROFILE
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`nb-button px-6 py-3 flex items-center gap-2 ${activeTab === 'orders' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <Package className="w-5 h-5" strokeWidth={3} />
          ORDERS ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`nb-button px-6 py-3 flex items-center gap-2 ${activeTab === 'addresses' ? 'bg-[var(--accent-yellow)]' : ''}`}
        >
          <MapPin className="w-5 h-5" strokeWidth={3} />
          ADDRESSES ({addresses.length})
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="m-4">
          <div className="nb-card p-6">
            <h2 className="nb-heading text-xl mb-4">PROFILE INFORMATION</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-lg font-bold">Loading profile...</p>
              </div>
            ) : !profile ? (
              <div className="text-center py-8">
                <User className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
                <p className="text-lg font-bold mb-2">No profile found</p>
                <p className="text-sm text-[var(--text-muted)] mb-4">Please complete your profile information</p>
                <button 
                  onClick={() => setEditingProfile(true)} 
                  className="nb-button px-6 py-2"
                >
                  CREATE PROFILE
                </button>
              </div>
            ) : editingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="nb-input w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">EMAIL</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="nb-input w-full px-4 py-3 opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">PHONE</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="nb-input w-full px-4 py-3"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="nb-button px-6 py-2">SAVE</button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="nb-button-secondary px-6 py-2">CANCEL</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold">FULL NAME</p>
                  <p className="text-lg">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-bold">EMAIL</p>
                  <p className="text-lg">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-bold">PHONE</p>
                  <p className="text-lg">{profile.phone || 'Not set'}</p>
                </div>
                <button onClick={() => setEditingProfile(true)} className="nb-button px-6 py-2">EDIT PROFILE</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="m-4 space-y-4">
          <h2 className="nb-heading text-xl">ORDER HISTORY</h2>
          
          {orders.length === 0 ? (
            <div className="nb-card p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
              <p className="text-lg font-bold">No orders yet</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="nb-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-black text-lg">#{order.order_number}</p>
                    <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`nb-badge ${
                      order.status === 'pending' ? 'nb-badge-red' :
                      order.status === 'processing' ? 'nb-badge-blue' :
                      order.status === 'shipped' ? 'nb-badge-pink' :
                      'nb-badge-green'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                    <p className="text-2xl font-black mt-2">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="border-t-2 border-[var(--border-color)] pt-3 space-y-2">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover border-2 border-[var(--border-color)]" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.product_name}</p>
                        <p className="text-xs">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                      </div>
                      <p className="font-bold">${item.total_price.toFixed(2)}</p>
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
        <div className="m-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="nb-heading text-xl">SAVED ADDRESSES</h2>
            <button className="nb-button px-4 py-2 flex items-center gap-2">
              <Plus className="w-4 h-4" strokeWidth={3} />
              ADD ADDRESS
            </button>
          </div>
          
          {addresses.length === 0 ? (
            <div className="nb-card p-12 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
              <p className="text-lg font-bold">No saved addresses</p>
            </div>
          ) : (
            addresses.map(address => (
              <div key={address.id} className="nb-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-lg">{address.label}</p>
                      {address.is_default && (
                        <span className="nb-badge nb-badge-green text-xs">DEFAULT</span>
                      )}
                    </div>
                    <p className="font-bold">{address.full_name}</p>
                    <p className="text-sm">{address.phone}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="nb-button-secondary p-2"
                  >
                    DELETE
                  </button>
                </div>
                <div className="border-t-2 border-[var(--border-color)] pt-2">
                  <p className="text-sm">{address.address_line}</p>
                  <p className="text-sm">{address.city}</p>
                  {address.landmark && <p className="text-sm">📍 {address.landmark}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

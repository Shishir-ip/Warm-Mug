import { useState, useEffect } from 'react';
import { supabase, Order, Product } from '../lib/supabase';
import { ArrowLeft, Package, TrendingUp, Users, RefreshCw, ChevronDown, ShoppingBag, Tag, Settings, Megaphone, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

type Tab = 'overview' | 'orders' | 'products' | 'categories' | 'campaigns' | 'settings';

// Categories Tab Component
function CategoriesTab({ categories, onAdd, onEdit, onDelete, showForm, editingCategory, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        slug: editingCategory.slug || '',
        description: editingCategory.description || ''
      });
    } else {
      setFormData({ name: '', slug: '', description: '' });
    }
  }, [editingCategory, showForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="m-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="nb-heading text-xl">CATEGORY MANAGEMENT</h2>
        <button onClick={onAdd} className="nb-button px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" strokeWidth={3} />
          ADD CATEGORY
        </button>
      </div>

      {showForm && (
        <div className="nb-card p-6 mb-4">
          <h3 className="nb-heading text-lg mb-4">{editingCategory ? 'EDIT' : 'ADD'} CATEGORY</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">NAME</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="nb-input w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">SLUG</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="nb-input w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">DESCRIPTION</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="nb-input w-full px-4 py-3"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="nb-button px-6 py-2 flex items-center gap-2">
                <Save className="w-4 h-4" strokeWidth={3} />
                SAVE
              </button>
              <button type="button" onClick={onCancel} className="nb-button-secondary px-6 py-2 flex items-center gap-2">
                <X className="w-4 h-4" strokeWidth={3} />
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="nb-card p-12 text-center">
          <Tag className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
          <p className="text-lg font-bold">No categories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <div key={cat.id} className="nb-card p-4">
              <h3 className="font-bold text-lg mb-1">{cat.name}</h3>
              <p className="text-xs text-[var(--text-muted)] mb-2">/{cat.slug}</p>
              <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{cat.description}</p>
              <div className="flex gap-2">
                <button onClick={() => onEdit(cat)} className="nb-button-secondary px-3 py-1.5 text-xs flex items-center gap-1">
                  <Edit2 className="w-3 h-3" strokeWidth={3} />
                  EDIT
                </button>
                <button onClick={() => onDelete(cat.id)} className="nb-button-secondary px-3 py-1.5 text-xs flex items-center gap-1">
                  <Trash2 className="w-3 h-3" strokeWidth={3} />
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Campaigns Tab Component
function CampaignsTab({ campaigns, products, onAdd, onEdit, onDelete, onToggleActive, showForm, editingCampaign, onSave, onCancel, onSaveProducts }: any) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    button_text: 'Shop Now',
    button_link: '/shop',
    bg_color: '#fbbf24',
    text_color: '#1a1a1a',
    is_active: true,
    display_order: 0
  });
  const [selectedCampaignProducts, setSelectedCampaignProducts] = useState<Record<number, number[]>>({});
  const [showProductSelector, setShowProductSelector] = useState<number | null>(null);

  useEffect(() => {
    if (editingCampaign) {
      setFormData({
        title: editingCampaign.title || '',
        subtitle: editingCampaign.subtitle || '',
        description: editingCampaign.description || '',
        image_url: editingCampaign.image_url || '',
        button_text: editingCampaign.button_text || 'Shop Now',
        button_link: editingCampaign.button_link || '/shop',
        bg_color: editingCampaign.bg_color || '#fbbf24',
        text_color: editingCampaign.text_color || '#1a1a1a',
        is_active: editingCampaign.is_active !== false,
        display_order: editingCampaign.display_order || 0
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        image_url: '',
        button_text: 'Shop Now',
        button_link: '/shop',
        bg_color: '#fbbf24',
        text_color: '#1a1a1a',
        is_active: true,
        display_order: 0
      });
    }
  }, [editingCampaign, showForm]);

  // Fetch campaign products
  useEffect(() => {
    const fetchCampaignProducts = async () => {
      const productsMap: Record<number, number[]> = {};
      for (const campaign of campaigns) {
        const { data: campaignProducts } = await supabase
          .from('campaign_products')
          .select('product_id')
          .eq('campaign_id', campaign.id);
        
        productsMap[campaign.id] = (campaignProducts || []).map((cp: any) => cp.product_id);
      }
      setSelectedCampaignProducts(productsMap);
    };
    
    if (campaigns.length > 0) {
      fetchCampaignProducts();
    }
  }, [campaigns]);

  const toggleProductForCampaign = (campaignId: number, productId: number) => {
    setSelectedCampaignProducts(prev => {
      const current = prev[campaignId] || [];
      const updated = current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId];
      return { ...prev, [campaignId]: updated };
    });
  };

  const handleSaveCampaignProducts = async (campaignId: number) => {
    const productIds = selectedCampaignProducts[campaignId] || [];
    
    // Delete existing assignments
    await supabase
      .from('campaign_products')
      .delete()
      .eq('campaign_id', campaignId);
    
    // Insert new assignments
    if (productIds.length > 0) {
      const assignments = productIds.map(productId => ({
        campaign_id: campaignId,
        product_id: productId
      }));
      
      await supabase
      .from('campaign_products')
      .insert(assignments);
    }
    
    setShowProductSelector(null);
    if (onSaveProducts) {
      onSaveProducts();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="m-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="nb-heading text-xl">CAMPAIGN MANAGEMENT</h2>
        <button onClick={onAdd} className="nb-button px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" strokeWidth={3} />
          ADD CAMPAIGN
        </button>
      </div>

      {showForm && (
        <div className="nb-card p-6 mb-4">
          <h3 className="nb-heading text-lg mb-4">{editingCampaign ? 'EDIT' : 'ADD'} CAMPAIGN</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">TITLE</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">SUBTITLE</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">DESCRIPTION</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="nb-input w-full px-4 py-3"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">IMAGE URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="nb-input w-full px-4 py-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">BUTTON TEXT</label>
                <input
                  type="text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">BUTTON LINK</label>
                <input
                  type="text"
                  value={formData.button_link}
                  onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">BG COLOR</label>
                <input
                  type="color"
                  value={formData.bg_color}
                  onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                  className="nb-input w-full h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">TEXT COLOR</label>
                <input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  className="nb-input w-full h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">DISPLAY ORDER</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5"
              />
              <label className="text-sm font-bold">ACTIVE</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="nb-button px-6 py-2 flex items-center gap-2">
                <Save className="w-4 h-4" strokeWidth={3} />
                SAVE
              </button>
              <button type="button" onClick={onCancel} className="nb-button-secondary px-6 py-2 flex items-center gap-2">
                <X className="w-4 h-4" strokeWidth={3} />
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="nb-card p-12 text-center">
          <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
          <p className="text-lg font-bold">No campaigns yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((camp: any) => (
            <div key={camp.id} className="nb-card overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {camp.image_url && (
                  <img src={camp.image_url} alt={camp.title} className="w-full sm:w-48 h-32 object-cover" />
                )}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{camp.title}</h3>
                      {camp.subtitle && <p className="text-sm text-[var(--text-secondary)]">{camp.subtitle}</p>}
                    </div>
                    <span className={`nb-badge text-xs ${camp.is_active ? 'nb-badge-green' : 'nb-badge-red'}`}>
                      {camp.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{camp.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold">
                      PRODUCTS: {(selectedCampaignProducts[camp.id] || []).length}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => onEdit(camp)} className="nb-button-secondary px-3 py-1.5 text-xs flex items-center gap-1">
                      <Edit2 className="w-3 h-3" strokeWidth={3} />
                      EDIT
                    </button>
                    <button 
                      onClick={() => setShowProductSelector(camp.id)} 
                      className="nb-button-secondary px-3 py-1.5 text-xs flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" strokeWidth={3} />
                      MANAGE PRODUCTS
                    </button>
                    <button onClick={() => onToggleActive(camp.id, camp.is_active)} className="nb-button-secondary px-3 py-1.5 text-xs">
                      {camp.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                    </button>
                    <button onClick={() => onDelete(camp.id)} className="nb-button-secondary px-3 py-1.5 text-xs flex items-center gap-1">
                      <Trash2 className="w-3 h-3" strokeWidth={3} />
                      DELETE
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Selector Modal */}
              {showProductSelector === camp.id && (
                <div className="border-t-2 border-[var(--border-color)] p-4 bg-[var(--bg-tertiary)]">
                  <h4 className="nb-heading text-base mb-3">SELECT PRODUCTS FOR THIS CAMPAIGN</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4 max-h-96 overflow-y-auto">
                    {products.map((product: any) => {
                      const isSelected = (selectedCampaignProducts[camp.id] || []).includes(product.id);
                      return (
                        <div 
                          key={product.id} 
                          onClick={() => toggleProductForCampaign(camp.id, product.id)}
                          className={`nb-card p-2 cursor-pointer transition-all ${
                            isSelected ? 'bg-[var(--accent-green)]' : 'hover:bg-[var(--bg-secondary)]'
                          }`}
                        >
                          <img src={product.image} alt={product.name} className="w-full h-20 object-cover mb-2" />
                          <p className="text-xs font-bold line-clamp-2">{product.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">${product.price}</p>
                          {isSelected && (
                            <div className="mt-1">
                              <span className="nb-badge nb-badge-green text-[10px]">SELECTED</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSaveCampaignProducts(camp.id)}
                      className="nb-button px-4 py-2 text-xs flex items-center gap-2"
                    >
                      <Save className="w-3 h-3" strokeWidth={3} />
                      SAVE PRODUCTS
                    </button>
                    <button 
                      onClick={() => setShowProductSelector(null)}
                      className="nb-button-secondary px-4 py-2 text-xs flex items-center gap-2"
                    >
                      <X className="w-3 h-3" strokeWidth={3} />
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ settings, onSave }: any) {
  const [formData, setFormData] = useState({
    store_name: '',
    store_tagline: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    store_hours: '',
    about_text: '',
    story_text: '',
    mission_text: '',
    instagram: '',
    twitter: '',
    facebook: '',
    free_shipping_threshold: '',
    shipping_flat_rate: '',
    tax_rate: '',
    return_policy: '',
    privacy_policy: ''
  });

  useEffect(() => {
    setFormData({
      store_name: settings.store_name || '',
      store_tagline: settings.store_tagline || '',
      store_email: settings.store_email || '',
      store_phone: settings.store_phone || '',
      store_address: settings.store_address || '',
      store_hours: settings.store_hours || '',
      about_text: settings.about_text || '',
      story_text: settings.story_text || '',
      mission_text: settings.mission_text || '',
      instagram: settings.instagram || '',
      twitter: settings.twitter || '',
      facebook: settings.facebook || '',
      free_shipping_threshold: settings.free_shipping_threshold || '',
      shipping_flat_rate: settings.shipping_flat_rate || '',
      tax_rate: settings.tax_rate || '',
      return_policy: settings.return_policy || '',
      privacy_policy: settings.privacy_policy || ''
    });
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="m-4">
      <h2 className="nb-heading text-xl mb-4">STORE SETTINGS</h2>
      <div className="nb-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-4">GENERAL</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">STORE NAME</label>
                <input
                  type="text"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">TAGLINE</label>
                <input
                  type="text"
                  value={formData.store_tagline}
                  onChange={(e) => setFormData({ ...formData, store_tagline: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  placeholder="Specialty Coffee"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-bold mb-2">STORE HOURS</label>
              <input
                type="text"
                value={formData.store_hours}
                onChange={(e) => setFormData({ ...formData, store_hours: e.target.value })}
                className="nb-input w-full px-4 py-3"
                placeholder="Mon-Fri: 7am-7pm, Sat-Sun: 8am-5pm"
              />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">CONTACT</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">EMAIL</label>
                <input
                  type="email"
                  value={formData.store_email}
                  onChange={(e) => setFormData({ ...formData, store_email: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">PHONE</label>
                <input
                  type="tel"
                  value={formData.store_phone}
                  onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-bold mb-2">ADDRESS</label>
              <textarea
                value={formData.store_address}
                onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
                className="nb-input w-full px-4 py-3"
                rows={2}
              />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">ABOUT & CONTENT</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">ABOUT TEXT (Short)</label>
                <textarea
                  value={formData.about_text}
                  onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  rows={2}
                  placeholder="Brief description for footer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">OUR STORY</label>
                <textarea
                  value={formData.story_text}
                  onChange={(e) => setFormData({ ...formData, story_text: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  rows={3}
                  placeholder="Tell your brand story"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">OUR MISSION</label>
                <textarea
                  value={formData.mission_text}
                  onChange={(e) => setFormData({ ...formData, mission_text: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  rows={3}
                  placeholder="What drives your business"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">SOCIAL MEDIA</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">INSTAGRAM URL</label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">TWITTER URL</label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">FACEBOOK URL</label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">SHIPPING & PRICING</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">FREE SHIPPING THRESHOLD ($)</label>
                <input
                  type="number"
                  value={formData.free_shipping_threshold}
                  onChange={(e) => setFormData({ ...formData, free_shipping_threshold: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">FLAT SHIPPING RATE ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.shipping_flat_rate}
                  onChange={(e) => setFormData({ ...formData, shipping_flat_rate: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">TAX RATE (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">POLICIES</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">RETURN POLICY</label>
                <textarea
                  value={formData.return_policy}
                  onChange={(e) => setFormData({ ...formData, return_policy: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  rows={3}
                  placeholder="Your return policy details"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">PRIVACY POLICY</label>
                <textarea
                  value={formData.privacy_policy}
                  onChange={(e) => setFormData({ ...formData, privacy_policy: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  rows={3}
                  placeholder="Your privacy policy details"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="nb-button px-6 py-3 flex items-center gap-2">
            <Save className="w-5 h-5" strokeWidth={3} />
            SAVE ALL SETTINGS
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
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
      // Fetch orders first
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items separately
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*');

      if (orderItemsError) throw orderItemsError;

      // Merge order items with orders
      const ordersWithItems = (ordersData || []).map((order: any) => ({
        ...order,
        items: (orderItemsData || []).filter((item: any) => item.order_id === order.id)
      }));

      setOrders(ordersWithItems);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      setCategories(categoriesData || []);

      // Fetch campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .order('display_order');

      setCampaigns(campaignsData || []);

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('store_settings')
        .select('*');

      const settingsObj: any = {};
      (settingsData || []).forEach((s: any) => {
        settingsObj[s.setting_key] = s.setting_value;
      });
      setSettings(settingsObj);

      // Calculate stats
      const totalRevenue = ordersData?.reduce((sum: number, order: any) => sum + order.total, 0) || 0;
      const pendingOrders = ordersData?.filter((o: any) => o.status === 'pending').length || 0;

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

  // Category CRUD
  const saveCategory = async (categoryData: any) => {
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);
        if (error) throw error;
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      fetchAllData();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Error saving category.');
    }
  };

  const deleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      if (error) throw error;
      fetchAllData();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Error deleting category.');
    }
  };

  // Campaign CRUD
  const saveCampaign = async (campaignData: any) => {
    try {
      if (editingCampaign) {
        const { error } = await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('campaigns')
          .insert([campaignData]);
        if (error) throw error;
      }
      setShowCampaignForm(false);
      setEditingCampaign(null);
      fetchAllData();
    } catch (err) {
      console.error('Error saving campaign:', err);
      alert('Error saving campaign.');
    }
  };

  const deleteCampaign = async (campaignId: number) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);
      if (error) throw error;
      fetchAllData();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Error deleting campaign.');
    }
  };

  const toggleCampaignActive = async (campaignId: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ is_active: !isActive })
        .eq('id', campaignId);
      if (error) throw error;
      fetchAllData();
    } catch (err) {
      console.error('Error updating campaign:', err);
      alert('Error updating campaign.');
    }
  };

  // Settings
  const saveSettings = async (newSettings: any) => {
    try {
      for (const [key, value] of Object.entries(newSettings)) {
        await supabase
          .from('store_settings')
          .upsert({ setting_key: key, setting_value: value as string }, { onConflict: 'setting_key' });
      }
      alert('Settings saved successfully!');
      fetchAllData();
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error saving settings.');
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
        <CategoriesTab 
          categories={categories}
          onAdd={() => { setEditingCategory(null); setShowCategoryForm(true); }}
          onEdit={(cat: any) => { setEditingCategory(cat); setShowCategoryForm(true); }}
          onDelete={deleteCategory}
          showForm={showCategoryForm}
          editingCategory={editingCategory}
          onSave={saveCategory}
          onCancel={() => { setShowCategoryForm(false); setEditingCategory(null); }}
        />
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <CampaignsTab 
          campaigns={campaigns}
          products={products}
          onAdd={() => { setEditingCampaign(null); setShowCampaignForm(true); }}
          onEdit={(camp: any) => { setEditingCampaign(camp); setShowCampaignForm(true); }}
          onDelete={deleteCampaign}
          onToggleActive={toggleCampaignActive}
          showForm={showCampaignForm}
          editingCampaign={editingCampaign}
          onSave={saveCampaign}
          onCancel={() => { setShowCampaignForm(false); setEditingCampaign(null); }}
          onSaveProducts={fetchAllData}
        />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <SettingsTab 
          settings={settings}
          onSave={saveSettings}
        />
      )}
    </div>
  );
}

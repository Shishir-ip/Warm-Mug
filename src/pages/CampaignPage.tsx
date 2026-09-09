import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ShoppingBag, Star } from 'lucide-react';

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

interface CampaignPageProps {
  campaignId: number;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

interface Campaign {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  bg_color: string;
  text_color: string;
}

export default function CampaignPage({ campaignId, onBack, onAddToCart, onViewProduct }: CampaignPageProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  const fetchCampaignData = async () => {
    try {
      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Fetch products assigned to this campaign
      const { data: campaignProducts, error: productsError } = await supabase
        .from('campaign_products')
        .select('product_id')
        .eq('campaign_id', campaignId);

      if (productsError) throw productsError;

      if (campaignProducts && campaignProducts.length > 0) {
        const productIds = campaignProducts.map((cp: any) => cp.product_id);
        
        // Fetch product details
        const { data: productsData, error: detailsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)
          .eq('is_active', true);

        if (detailsError) throw detailsError;

        // Convert to Product format
        const formattedProducts: Product[] = (productsData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          longDescription: p.long_description || p.description,
          price: p.price,
          originalPrice: p.original_price,
          discountType: p.discount_type,
          discountValue: p.discount_value,
          image: p.image,
          category: p.category,
          origin: p.origin,
          roast: p.roast,
          notes: p.notes || [],
          weight: p.weight,
          rating: p.rating,
          reviews: p.reviews
        }));

        setProducts(formattedProducts);
      }
    } catch (err) {
      console.error('Error fetching campaign ', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="nb-card p-8">
          <p className="text-lg font-bold">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="nb-card p-8">
          <p className="text-lg font-bold">Campaign not found</p>
          <button onClick={onBack} className="nb-button mt-4 px-6 py-2">
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Campaign Header */}
      <div 
        className="relative h-[300px] sm:h-[400px] overflow-hidden"
        style={{ backgroundColor: campaign.bg_color }}
      >
        {campaign.image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${campaign.image_url})` }}
          />
        )}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: campaign.bg_color, opacity: 0.85 }}
        />
        
        <div className="relative h-full flex flex-col justify-center px-6 sm:px-12" style={{ color: campaign.text_color }}>
          <button
            onClick={onBack}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 nb-button-secondary p-2 sm:p-3"
            style={{
              backgroundColor: campaign.text_color,
              color: campaign.bg_color,
              borderColor: campaign.text_color
            }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={3} />
          </button>

          <div className="max-w-2xl ml-0 sm:ml-16">
            {campaign.subtitle && (
              <p className="text-sm sm:text-base font-bold mb-2 uppercase tracking-wider">
                {campaign.subtitle}
              </p>
            )}
            <h1 className="text-3xl sm:text-5xl font-black mb-3 sm:mb-4 leading-tight">
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className="text-sm sm:text-lg opacity-90">
                {campaign.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="m-2 sm:m-4 mt-6 sm:mt-8">
        <h2 className="nb-heading text-xl sm:text-2xl mb-4 sm:mb-6">
          FEATURED PRODUCTS ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="nb-card p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={3} />
            <p className="text-lg font-bold mb-2">No products in this campaign yet</p>
            <p className="text-sm text-[var(--text-muted)]">Check back later for exciting products!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {products.map(product => (
              <div key={product.id} className="nb-card overflow-hidden group flex flex-col">
                <div
                  className="aspect-square overflow-hidden border-b-[var(--border-width)] border-[var(--border-color)] cursor-pointer relative flex-shrink-0"
                  onClick={() => onViewProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.originalPrice && product.discountType && product.discountValue && (
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
                    onClick={() => onViewProduct(product)}
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
                      {product.originalPrice && product.discountType && product.discountValue && (
                        <span className="text-[10px] sm:text-xs line-through text-[var(--text-muted)] mr-1 block sm:inline">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-base sm:text-lg font-black block sm:inline">${product.price.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="nb-button px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 text-[10px] sm:text-xs flex-shrink-0"
                    >
                      <ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />
                      <span className="hidden sm:inline">ADD</span>
                      <span className="sm:hidden">+</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

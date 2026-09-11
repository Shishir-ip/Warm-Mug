import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Campaign {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  button_text: string;
  button_link: string;
  bg_color: string;
  text_color: string;
  is_active: boolean;
  display_order: number;
}

interface CarouselProps {
  onCampaignClick?: (campaignId: number) => void;
}

export default function Carousel({ onCampaignClick }: CarouselProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  useEffect(() => {
    if (campaigns.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [campaigns.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  };

  if (campaigns.length === 0) {
    return null;
  }

  const currentCampaign = campaigns[currentIndex];

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden nb-card">
      {/* Background Image */}
      {currentCampaign.image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `url(${currentCampaign.image_url})`,
            backgroundColor: currentCampaign.bg_color
          }}
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{ backgroundColor: currentCampaign.bg_color, opacity: 0.85 }}
      />

      {/* Content */}
      <div
        className="relative h-full flex flex-col justify-center px-6 sm:px-12 transition-all duration-500"
        style={{ color: currentCampaign.text_color }}
      >
        <div className="max-w-2xl">
          {currentCampaign.subtitle && (
            <p className="text-sm sm:text-base font-bold mb-2 uppercase tracking-wider">
              {currentCampaign.subtitle}
            </p>
          )}
          <h2 className="text-3xl sm:text-5xl font-black mb-3 sm:mb-4 leading-tight">
            {currentCampaign.title}
          </h2>
          {currentCampaign.description && (
            <p className="text-sm sm:text-lg mb-4 sm:mb-6 opacity-90">
              {currentCampaign.description}
            </p>
          )}
          {onCampaignClick && (
            <button
              onClick={() => onCampaignClick(currentCampaign.id)}
              className="nb-button px-6 py-3 text-sm sm:text-base"
              style={{
                backgroundColor: currentCampaign.text_color,
                color: currentCampaign.bg_color,
                borderColor: currentCampaign.text_color
              }}
            >
              {currentCampaign.button_text}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {campaigns.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 nb-button-secondary p-2 sm:p-3 opacity-80 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 nb-button-secondary p-2 sm:p-3 opacity-80 hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {campaigns.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {campaigns.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-[var(--text-primary)] w-6 sm:w-8'
                  : 'bg-[var(--text-primary)]/50 hover:bg-[var(--text-primary)]/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

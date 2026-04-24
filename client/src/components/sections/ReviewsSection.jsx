import React, { useEffect, useState } from 'react';
import { API_URL } from '../../utils/api';

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/reviews/active`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(data.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/40">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <p>Error loading reviews: {error}</p>
      </div>
    );
  }

  // Show only first 4 reviews
  const displayedReviews = reviews.slice(0, 4);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
            What Our VIPs Are Saying
          </h2>
          <p className="mt-4 text-white/40 text-xl">
            Hear from our satisfied customers about their boosting experience
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayedReviews.map((review) => (
            <div 
              key={review._id} 
              className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all flex flex-col h-full"
            >
              {review.reviewImage && (
                <div className="w-full h-40 rounded-xl overflow-hidden border border-white/10 mb-4 flex-shrink-0">
                  <img 
                    src={`${API_URL}${review.reviewImage}`} 
                    alt="Review" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-4 h-4 ${i < review.stars ? 'text-[#a2e63e]' : 'text-white/10'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-xs text-white/40">
                  ({review.stars}/5)
                </span>
              </div>
              
              <h4 className="text-white font-bold text-lg mb-2 line-clamp-2">
                {review.title || 'No Title'}
              </h4>
              
              <p className="text-white/60 text-sm flex-1 mb-4 line-clamp-3">
                {review.description}
              </p>
              
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-white/40 text-[12px] font-bold uppercase tracking-widest">
                  <span>{review.reviewerName}</span>
                  {review.countryName && (
                    <span className="flex items-center gap-1.5">
                      <img 
                        src={`https://flagcdn.com/w20/${getCountryCode(review.countryName)}.png`} 
                        alt="" 
                        className="w-4 h-4" 
                      />
                      {review.countryName}
                    </span>
                  )}
                </div>
                <span className="block mt-1 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {reviews.length > 4 && (
          <div className="mt-12 text-center">
            <a 
              href="/reviews" 
              className="inline-block px-8 py-4 bg-primary text-black font-black uppercase tracking-widest text-[13px] rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              View all reviews
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

// Helper function to get country code from country name
const getCountryCode = (countryName) => {
  const countryMap = {
    'United States': 'us',
    'United Kingdom': 'gb',
    'Canada': 'ca',
    'Australia': 'au',
    'Germany': 'de',
    'France': 'fr',
    'Italy': 'it',
    'Spain': 'es',
    'Brazil': 'br',
    'Japan': 'jp',
    'China': 'cn',
    'India': 'in',
    'Russia': 'ru',
    'South Korea': 'kr',
    'United Arab Emirates': 'ae',
    'Saudi Arabia': 'sa',
    'Turkey': 'tr',
    'Netherlands': 'nl',
    'Sweden': 'se',
    'Norway': 'no',
    'Denmark': 'dk',
    'Finland': 'fi',
    'Poland': 'pl',
    'Mexico': 'mx',
    'Argentina': 'ar',
    'Chile': 'cl',
    'Colombia': 'co',
    'Portugal': 'pt',
    'Belgium': 'be',
    'Switzerland': 'ch',
    'Austria': 'at',
    'Greece': 'gr',
    'Singapore': 'sg',
    'Malaysia': 'my',
    'Thailand': 'th',
    'Vietnam': 'vn',
    'Philippines': 'ph',
    'Indonesia': 'id',
    'South Africa': 'za',
    'Egypt': 'eg',
    'Pakistan': 'pk',
    'Bangladesh': 'bd',
    'Ukraine': 'ua',
    'Romania': 'ro',
    'Czech Republic': 'cz',
    'Hungary': 'hu',
    'Ireland': 'ie',
    'New Zealand': 'nz',
    'Israel': 'il',
    'Kuwait': 'kw',
    'Qatar': 'qa'
  };
  return countryMap[countryName] || 'us'; // default to US if not found
};

export default ReviewsSection;
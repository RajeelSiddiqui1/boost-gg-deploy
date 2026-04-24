import React, { useEffect, useState } from 'react';
import { API_URL } from '../utils/api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

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

  // Calculate current page reviews
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // Calculate total pages
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/40">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <p className="text-center text-red-400 px-6">
          Error loading reviews: {error}
        </p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 text-white/20 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-white font-bold text-xl mb-2">No reviews yet</h3>
          <p className="text-white/40">Be the first to leave a review!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-[#050505] relative overflow-hidden">
      {/* Top Left Background Glow */}
      <div className="absolute top-0 left-0 w-[600px] h-[800px] bg-[#a2e63e]/10 blur-[150px] rounded-full pointer-events-none -translate-x-1/4 -translate-y-1/4 z-0" />
      
      <div className="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
            What Our VIPs Are Saying
          </h2>
          <p className="mt-4 text-white/40 text-xl">
            Hear from our satisfied customers about their boosting experience
          </p>
        </div>

        <div className="flex flex-col gap-6 max-w-5xl mx-auto relative z-10">
          {currentReviews.map((review) => (
            <div 
              key={review._id} 
              className="group bg-white/[0.02] border border-white/5 rounded-[24px] p-6 md:p-8 transition-all duration-500 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] hover:shadow-[0_0_40px_-10px_rgba(162,230,62,0.2)] hover:border-[#a2e63e]/30 hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm"
            >
              {/* Left Logo / Image */}
              <div className="flex-shrink-0 md:pr-8 md:border-r border-white/10 flex items-center justify-center w-full md:w-auto">
                {review.reviewImage ? (
                  <img 
                    src={`${API_URL}${review.reviewImage}`} 
                    alt="Game Logo" 
                    className="w-24 h-24 object-contain opacity-80 hover:opacity-100 transition-opacity" 
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Right Content */}
              <div className="flex-1 text-center flex flex-col items-center justify-center">
                <p className="text-white/80 text-lg md:text-xl font-medium mb-6 leading-relaxed">
                  "{review.description}"
                </p>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
                    {review.countryName && (
                      <img 
                        src={`https://flagcdn.com/w20/${getCountryCode(review.countryName)}.png`} 
                        alt={review.countryName} 
                        className="w-4 h-3 object-cover rounded-sm" 
                      />
                    )}
                    <span>{review.countryName || 'United States of America'},</span>
                    <span>{getTimeAgo(review.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-xl ${i < review.stars ? 'text-[#ffb800]' : 'text-white/10'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-3 rounded-lg transition-all ${
                  currentPage === 1 
                    ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="hidden sm:flex space-x-2">
                {/* Show first page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-4 py-3 text-white/40">
                        ...
                      </span>
                    )}
                  </>
                )}

                {/* Page numbers around current */}
                {[...Array(totalPages).keys()].map(page => page + 1)
                  .filter(page =>
                    Math.abs(page - currentPage) <= 2 ||
                    page === 1 ||
                    page === totalPages
                  )
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-3 rounded-lg transition-all ${
                        page === currentPage
                          ? 'bg-primary text-black'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                {/* Show last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-4 py-3 text-white/40">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-3 rounded-lg transition-all ${
                  currentPage === totalPages 
                    ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Showing info */}
        <div className="mt-8 text-center text-white/40 text-sm">
          Showing {indexOfFirstReview + 1} - {Math.min(indexOfLastReview, reviews.length)} of {reviews.length} reviews
        </div>
      </div>
    </div>
  );
};

// Helper function to get relative time
const getTimeAgo = (dateString) => {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
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

export default Reviews;
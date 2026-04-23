import React, { useState, useEffect } from 'react';
import { Star, Loader2, Globe } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../utils/api';

const TestimonialsSection = () => {
 const [reviews, setReviews] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 axios.get(`${API_URL}/api/v1/reviews/active`)
 .then(res => {
 setReviews(res.data.data || []);
 setLoading(false);
 })
 .catch(err => {
 console.error('Error fetching reviews:', err);
 setLoading(false);
 });
 }, []);

 // Helper to get full image URL
 const getImageUrl = (url) => {
 if (!url) return '';
 if (url.startsWith('http')) return url;
 return `${API_URL}${url}`;
 };

 // Helper to calculate "days ago"
 const getTimeAgo = (date) => {
 const seconds = Math.floor((new Date() - new Date(date)) / 1000);
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

 return (
 <section className="px-6 py-16 bg-black relative overflow-hidden">
 {/* Subtle background glow */}
 <div className="absolute -top-[10%] -right-[5%] w-[30%] h-[400px] bg-primary/5 blur-[120px] pointer-events-none"></div>
 
 <div className="max-w-[1400px] mx-auto relative z-10">
 <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-4">
 <div>
 <h2 className="text-[32px] font-black tracking-tight text-white uppercase">
 What our <span className="text-primary">VIPs</span> are saying
 </h2>
 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Verified Customer Testimonials</p>
 </div>
 <div className="flex items-center gap-6">
 <div className="flex flex-col items-end">
 <div className="flex gap-1">
 {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-[#a2e63e] fill-[#a2e63e]" />)}
 </div>
 <span className="text-[10px] font-black text-white/40 mt-1 uppercase tracking-widest">Trust Rating: Excellent</span>
 </div>
 </div>
 </div>

 {loading ? (
 <div className="flex justify-center py-24">
 <Loader2 className="w-8 h-8 text-primary animate-spin" />
 </div>
 ) : reviews.length === 0 ? (
 <div className="text-center py-24 border border-white/5 rounded-[40px] bg-white/[0.02]">
 <p className="text-white/20 font-black uppercase tracking-widest text-xs">No reviews found in this sector</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {reviews.slice(0, 4).map((review, i) => (
 <div key={review._id || i} className="p-8 rounded-[40px] bg-[#0A0A0A] border border-white/5 flex flex-col h-full group hover:border-primary/20 hover:bg-white/[0.03] transition-all duration-500 overflow-hidden relative">
 {/* Ambient Review Image Overlay */}
 {review.reviewImage && (
 <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
 <img src={getImageUrl(review.reviewImage)} alt="" className="w-full h-full object-cover grayscale brightness-150" />
 </div>
 )}
 
 <div className="flex items-center justify-between mb-8 relative z-10">
 <div className="flex gap-0.5">
 {[...Array(5)].map((_, j) => (
 <Star 
 key={j} 
 className={`w-3.5 h-3.5 ${j < review.stars ? 'text-[#a2e63e] fill-[#a2e63e]' : 'text-white/10'}`} 
 />
 ))}
 </div>
 {review.countryImage && (
 <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
 <img src={getImageUrl(review.countryImage)} alt={review.countryName} className="w-4 object-contain" />
 {review.countryName && <span className="text-[9px] font-black text-white/40 uppercase">{review.countryName.substring(0, 3)}</span>}
 </div>
 )}
 </div>
 
 <div className="relative z-10">
 {review.title && (
 <h4 className="text-[14px] font-black text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{review.title}</h4>
 )}
 <p className="text-[17px] font-bold text-white/80 leading-[1.4] mb-8 line-clamp-4">
 "{review.description}"
 </p>
 </div>

 <div className="mt-auto flex items-end justify-between relative z-10">
 <div>
 <span className="text-[13px] font-black text-white block mb-0.5">{review.reviewerName}</span>
 <div className="flex items-center gap-2">
 <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
 <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Verified</span>
 </div>
 </div>
 <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest whitespace-nowrap">
 {getTimeAgo(review.createdAt)}
 </span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </section>
 );
};

export default TestimonialsSection;

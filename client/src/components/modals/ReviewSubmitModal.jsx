import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const ReviewSubmitModal = ({ onClose }) => {
 const { user } = useAuth();
 const { addToast } = useToast();
 const [loading, setLoading] = useState(false);
 const [rating, setRating] = useState(0);
 const [hoverRating, setHoverRating] = useState(0);
 const [formData, setFormData] = useState({
 title: '',
 reviewerName: user?.name || '',
 text: ''
 });

 const handleSubmit = async (e) => {
 e.preventDefault();
 
 if (rating === 0) {
 addToast('Please select a rating', 'error');
 return;
 }

 setLoading(true);
 try {
 await axios.post(`${API_URL}/api/v1/reviews/submit`, {
 ...formData,
 rating
 });
 
 addToast('Thank you! Your review has been submitted and is pending approval.', 'success');
 onClose();
 } catch (err) {
 addToast(err.response?.data?.message || 'Failed to submit review', 'error');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
 <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8" onClick={e => e.stopPropagation()}>
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-[24px] font-black text-white ">Submit Your Review</h3>
 <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
 <X className="w-6 h-6" />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Rating Stars */}
 <div>
 <label className="text-white/60 text-[13px] font-black uppercase tracking-widest mb-3 block">Your Rating</label>
 <div className="flex gap-2">
 {[1, 2, 3, 4, 5].map(star => (
 <button
 key={star}
 type="button"
 onClick={() => setRating(star)}
 onMouseEnter={() => setHoverRating(star)}
 onMouseLeave={() => setHoverRating(0)}
 className="transition-transform hover:scale-110"
 >
 <Star 
 className={`w-8 h-8 transition-colors ${
 star <= (hoverRating || rating) 
 ? 'text-[#a2e63e] fill-[#a2e63e]' 
 : 'text-white/20'
 }`} 
 />
 </button>
 ))}
 </div>
 </div>

 {/* Name */}
 <div>
 <label className="text-white/60 text-[13px] font-black uppercase tracking-widest mb-2 block">Your Name</label>
 <input
 type="text"
 value={formData.reviewerName}
 onChange={e => setFormData({...formData, reviewerName: e.target.value})}
 className="w-full px-5 py-4 bg-black border border-white/10 rounded-xl text-white placeholder-white/30 font-medium focus:outline-none focus:border-primary/50"
 placeholder="Enter your name"
 required
 />
 </div>

 {/* Title */}
 <div>
 <label className="text-white/60 text-[13px] font-black uppercase tracking-widest mb-2 block">Review Title</label>
 <input
 type="text"
 value={formData.title}
 onChange={e => setFormData({...formData, title: e.target.value})}
 className="w-full px-5 py-4 bg-black border border-white/10 rounded-xl text-white placeholder-white/30 font-medium focus:outline-none focus:border-primary/50"
 placeholder="Summarize your experience"
 />
 </div>

 {/* Review Text */}
 <div>
 <label className="text-white/60 text-[13px] font-black uppercase tracking-widest mb-2 block">Your Review</label>
 <textarea
 value={formData.text}
 onChange={e => setFormData({...formData, text: e.target.value})}
 className="w-full px-5 py-4 bg-black border border-white/10 rounded-xl text-white placeholder-white/30 font-medium focus:outline-none focus:border-primary/50 min-h-[120px] resize-none"
 placeholder="Tell us about your experience with BoostGG"
 required
 />
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[13px] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 Submitting...
 </>
 ) : (
 'Submit Review'
 )}
 </button>
 </form>
 </div>
 </div>
 );
};

export default ReviewSubmitModal;

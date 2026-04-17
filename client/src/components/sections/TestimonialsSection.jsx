import React, { useState, useEffect } from 'react';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import ReviewSubmitModal from '../modals/ReviewSubmitModal';

const TestimonialsSection = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

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

    return (
        <section className="px-6 py-16 bg-black">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-16">
                    <h2 className="text-[32px] font-black italic tracking-tight text-white">What our customers are saying</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-[#a2e63e] fill-[#a2e63e]" />)}
                            </div>
                            <span className="text-[12px] font-black text-white/40 ml-2 uppercase tracking-widest">Excellent</span>
                        </div>
                        
                        <button 
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[13px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Write a Review
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                        No reviews yet. Be the first to write a review!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {reviews.slice(0, 4).map((review, i) => (
                            <div key={review._id || i} className="p-10 rounded-[40px] bg-[#0A0A0A] border border-white/5 flex flex-col h-full group hover:border-white/10 transition-all">
                                <div className="flex gap-0.5 mb-8">
                                    {[...Array(5)].map((_, j) => (
                                        <Star 
                                            key={j} 
                                            className={`w-3.5 h-3.5 ${j < review.rating ? 'text-[#a2e63e] fill-[#a2e63e]' : 'text-white/10'}`} 
                                        />
                                    ))}
                                </div>
                                {review.title && (
                                    <h4 className="text-[16px] font-bold text-white mb-3">{review.title}</h4>
                                )}
                                <p className="text-[20px] font-black text-white leading-tight mb-6 group-hover:text-primary transition-colors">
                                    "{review.text}"
                                </p>
                                <div className="mt-auto">
                                    <span className="text-[13px] font-bold text-white/40 block mb-1">{review.reviewerName} recommends BoostGG</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && <ReviewSubmitModal onClose={() => setShowModal(false)} />}
        </section>
    );
};

export default TestimonialsSection;

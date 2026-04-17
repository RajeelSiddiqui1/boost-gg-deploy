import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Check, X, Loader2, Search } from 'lucide-react';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [notification, setNotification] = useState(null);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/v1/reviews/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(res.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/api/v1/reviews/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setNotification({ type: 'success', message: `Review ${status} successfully` });
            fetchReviews();
            
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to update review status' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = !filterStatus || review.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = reviews.filter(r => r.status === 'pending').length;

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                            Reviews Management
                        </h1>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                            Approve and manage customer reviews
                        </p>
                    </div>
                    {pendingCount > 0 && (
                        <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <span className="text-yellow-400 font-black text-[13px] uppercase tracking-widest">
                                {pendingCount} Pending Review{pendingCount > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search reviews..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary/50"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`mb-6 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider ${
                        notification.type === 'success' 
                            ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
                            : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    }`}>
                        {notification.message}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="text-center py-24">
                        <Star className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-xl mb-2">No reviews found</h3>
                        <p className="text-white/40">Reviews submitted by customers will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredReviews.map(review => (
                            <div 
                                key={review._id} 
                                className={`p-6 rounded-[24px] border transition-all ${
                                    review.status === 'pending' 
                                        ? 'bg-yellow-500/5 border-yellow-500/20' 
                                        : review.status === 'approved'
                                        ? 'bg-green-500/5 border-green-500/20'
                                        : 'bg-red-500/5 border-red-500/20 bg-white/[0.02] border-white/5'
                                }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={`w-4 h-4 ${
                                                            i < review.rating 
                                                                ? 'text-[#a2e63e] fill-[#a2e63e]' 
                                                                : 'text-white/10'
                                                        }`} 
                                                    />
                                                ))}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
                                                review.status === 'pending' 
                                                    ? 'bg-yellow-500/20 text-yellow-400' 
                                                    : review.status === 'approved'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {review.status}
                                            </span>
                                        </div>
                                        
                                        {review.title && (
                                            <h4 className="text-white font-bold text-lg mb-2">{review.title}</h4>
                                        )}
                                        
                                        <p className="text-white/80 text-[15px] mb-4">"{review.text}"</p>
                                        
                                        <div className="flex items-center gap-4 text-white/40 text-[13px]">
                                            <span className="font-bold">{review.reviewerName}</span>
                                            {review.userId?.name && (
                                                <span className="text-primary/60">({review.userId.email})</span>
                                            )}
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 md:flex-shrink-0">
                                        {review.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(review._id, 'approved')}
                                                    className="px-6 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-green-500/30 transition-all flex items-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(review._id, 'rejected')}
                                                    className="px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-red-500/30 transition-all flex items-center gap-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {review.status === 'approved' && (
                                            <button
                                                onClick={() => updateStatus(review._id, 'rejected')}
                                                className="px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-red-500/30 transition-all"
                                            >
                                                Unapprove
                                            </button>
                                        )}
                                        {review.status === 'rejected' && (
                                            <button
                                                onClick={() => updateStatus(review._id, 'approved')}
                                                className="px-6 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-green-500/30 transition-all"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Reviews;

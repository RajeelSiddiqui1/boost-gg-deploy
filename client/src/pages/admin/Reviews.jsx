import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
 Star, 
 Check, 
 X, 
 Loader2, 
 Search, 
 Plus, 
 Edit2, 
 Trash2, 
 Image as ImageIcon, 
 Globe,
 Eye,
 EyeOff,
 ChevronDown
} from 'lucide-react';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

// Country list for flag API
const COUNTRIES = [
 { code: 'us', name: 'United States' },
 { code: 'gb', name: 'United Kingdom' },
 { code: 'ca', name: 'Canada' },
 { code: 'au', name: 'Australia' },
 { code: 'de', name: 'Germany' },
 { code: 'fr', name: 'France' },
 { code: 'it', name: 'Italy' },
 { code: 'es', name: 'Spain' },
 { code: 'br', name: 'Brazil' },
 { code: 'jp', name: 'Japan' },
 { code: 'cn', name: 'China' },
 { code: 'in', name: 'India' },
 { code: 'ru', name: 'Russia' },
 { code: 'kr', name: 'South Korea' },
 { code: 'ae', name: 'United Arab Emirates' },
 { code: 'sa', name: 'Saudi Arabia' },
 { code: 'tr', name: 'Turkey' },
 { code: 'nl', name: 'Netherlands' },
 { code: 'se', name: 'Sweden' },
 { code: 'no', name: 'Norway' },
 { code: 'dk', name: 'Denmark' },
 { code: 'fi', name: 'Finland' },
 { code: 'pl', name: 'Poland' },
 { code: 'mx', name: 'Mexico' },
 { code: 'ar', name: 'Argentina' },
 { code: 'cl', name: 'Chile' },
 { code: 'co', name: 'Colombia' },
 { code: 'pt', name: 'Portugal' },
 { code: 'be', name: 'Belgium' },
 { code: 'ch', name: 'Switzerland' },
 { code: 'at', name: 'Austria' },
 { code: 'gr', name: 'Greece' },
 { code: 'sg', name: 'Singapore' },
 { code: 'my', name: 'Malaysia' },
 { code: 'th', name: 'Thailand' },
 { code: 'vn', name: 'Vietnam' },
 { code: 'ph', name: 'Philippines' },
 { code: 'id', name: 'Indonesia' },
 { code: 'za', name: 'South Africa' },
 { code: 'eg', name: 'Egypt' },
 { code: 'pk', name: 'Pakistan' },
 { code: 'bd', name: 'Bangladesh' },
 { code: 'ua', name: 'Ukraine' },
 { code: 'ro', name: 'Romania' },
 { code: 'cz', name: 'Czech Republic' },
 { code: 'hu', name: 'Hungary' },
 { code: 'ie', name: 'Ireland' },
 { code: 'nz', name: 'New Zealand' },
 { code: 'il', name: 'Israel' },
 { code: 'kw', name: 'Kuwait' },
 { code: 'qa', name: 'Qatar' }
].sort((a, b) => a.name.localeCompare(b.name));

const Reviews = () => {
 const [reviews, setReviews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [notification, setNotification] = useState(null);
 const [showModal, setShowModal] = useState(false);
 const [editingReview, setEditingReview] = useState(null);
 const [isSubmitting, setIsSubmitting] = useState(false);

 // Searchable dropdown state
 const [countrySearch, setCountrySearch] = useState('');
 const [showCountryDropdown, setShowCountryDropdown] = useState(false);
 const countryDropdownRef = useRef(null);

 // Form state
 const [formData, setFormData] = useState({
 title: '',
 reviewerName: '',
 stars: 5,
 description: '',
 countryName: '',
 countryImage: '',
 reviewImage: '',
 isPublished: true
 });

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
 
 // Handle clicking outside country dropdown
 const handleClickOutside = (event) => {
 if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
 setShowCountryDropdown(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const handleFileUpload = async (e, field) => {
 const file = e.target.files[0];
 if (!file) return;

 const uploadFormData = new FormData();
 uploadFormData.append('files', file);

 try {
 const token = localStorage.getItem('token');
 const res = await axios.post(`${API_URL}/api/v1/uploads/multiple?folder=reviews`, uploadFormData, {
 headers: { 
 Authorization: `Bearer ${token}`,
 'Content-Type': 'multipart/form-data'
 }
 });
 
 // Controller returns array of strings, not objects with url property
 const imageUrl = res.data.data[0];
 setFormData(prev => ({ ...prev, [field]: imageUrl }));
 } catch (error) {
 console.error('Upload failed:', error);
 setNotification({ type: 'error', message: 'Image upload failed' });
 setTimeout(() => setNotification(null), 3000);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const token = localStorage.getItem('token');
 if (editingReview) {
 await axios.put(`${API_URL}/api/v1/reviews/${editingReview._id}`, formData, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setNotification({ type: 'success', message: 'Review updated successfully' });
 } else {
 await axios.post(`${API_URL}/api/v1/reviews`, formData, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setNotification({ type: 'success', message: 'Review created successfully' });
 }
 setShowModal(false);
 setEditingReview(null);
 resetForm();
 fetchReviews();
 } catch (error) {
 console.error('Submit failed:', error);
 setNotification({ type: 'error', message: 'Failed to save review' });
 } finally {
 setIsSubmitting(false);
 setTimeout(() => setNotification(null), 3000);
 }
 };

 const resetForm = () => {
 setFormData({
 title: '',
 reviewerName: '',
 stars: 5,
 description: '',
 countryName: '',
 countryImage: '',
 reviewImage: '',
 isPublished: true
 });
 setCountrySearch('');
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this review?')) return;
 try {
 const token = localStorage.getItem('token');
 await axios.delete(`${API_URL}/api/v1/reviews/${id}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setNotification({ type: 'success', message: 'Review deleted successfully' });
 fetchReviews();
 } catch (error) {
 setNotification({ type: 'error', message: 'Failed to delete review' });
 } finally {
 setTimeout(() => setNotification(null), 3000);
 }
 };

 const togglePublish = async (id) => {
 try {
 const token = localStorage.getItem('token');
 await axios.patch(`${API_URL}/api/v1/reviews/${id}/publish`, {}, {
 headers: { Authorization: `Bearer ${token}` }
 });
 fetchReviews();
 } catch (error) {
 setNotification({ type: 'error', message: 'Failed to toggle status' });
 setTimeout(() => setNotification(null), 3000);
 }
 };

 const openEdit = (review) => {
 setEditingReview(review);
 setFormData({
 title: review.title || '',
 reviewerName: review.reviewerName || '',
 stars: review.stars || 5,
 description: review.description || '',
 countryName: review.countryName || '',
 countryImage: review.countryImage || '',
 reviewImage: review.reviewImage || '',
 isPublished: review.isPublished
 });
 setCountrySearch(review.countryName || '');
 setShowModal(true);
 };

 // Helper to get full image URL
 const getImageUrl = (url) => {
 if (!url) return '';
 if (url.startsWith('http')) return url;
 return `${API_URL}${url}`;
 };

 const selectCountry = (country) => {
 setFormData(prev => ({
 ...prev,
 countryName: country.name,
 countryImage: `https://flagcdn.com/w40/${country.code}.png`
 }));
 setCountrySearch(country.name);
 setShowCountryDropdown(false);
 };

 const filteredCountries = COUNTRIES.filter(c => 
 c.name.toLowerCase().includes(countrySearch.toLowerCase())
 );

 const filteredReviews = reviews.filter(review => {
 return (
 review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
 review.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
 (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase()))
 );
 });

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
 <AdminLayout>
 <div className="p-6">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
 <div>
 <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
 Reviews Management
 </h1>
 <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
 Create, edit and manage site reviews
 </p>
 </div>
 <button 
 onClick={() => {
 setEditingReview(null);
 resetForm();
 setShowModal(true);
 }}
 className="px-6 py-3 bg-primary text-black font-black uppercase tracking-widest text-[13px] rounded-xl hover:scale-[1.02] transition-all flex items-center gap-2"
 >
 <Plus className="w-4 h-4" />
 Add Review
 </button>
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
 <p className="text-white/40">Start by adding a manual review</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-4">
 {filteredReviews.map(review => (
 <div 
 key={review._id} 
 className="p-6 bg-white/[0.02] border border-white/5 rounded-[24px] hover:border-white/10 transition-all group"
 >
 <div className="flex flex-col lg:flex-row lg:items-start gap-6">
 <div className="flex gap-4">
 {review.reviewImage && (
 <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black">
 <img src={getImageUrl(review.reviewImage)} alt="Review" className="w-full h-full object-cover" />
 </div>
 )}
 {review.countryImage && (
 <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black/40 flex items-center justify-center p-1">
 <img src={getImageUrl(review.countryImage)} alt="Flag" className="w-full object-contain" />
 </div>
 )}
 </div>

 <div className="flex-1">
 <div className="flex items-center gap-4 mb-3">
 <div className="flex gap-0.5">
 {[...Array(5)].map((_, i) => (
 <Star 
 key={i} 
 className={`w-4 h-4 ${
 i < review.stars 
 ? 'text-[#a2e63e] fill-[#a2e63e]' 
 : 'text-white/10'
 }`} 
 />
 ))}
 </div>
 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
 review.isPublished 
 ? 'bg-green-500/20 text-green-400' 
 : 'bg-white/10 text-white/40'
 }`}>
 {review.isPublished ? 'Published' : 'Unpublished'}
 </span>
 <span className="text-white/20 text-[11px] font-bold uppercase tracking-widest">
 {getTimeAgo(review.createdAt)}
 </span>
 </div>
 
 <h4 className="text-white font-bold text-lg mb-1">{review.title || 'No Title'}</h4>
 <p className="text-white/60 text-sm mb-4 line-clamp-2">{review.description}</p>
 
 <div className="flex items-center gap-4 text-white/40 text-[12px] font-bold uppercase tracking-widest">
 <span className="text-white/80">{review.reviewerName}</span>
 {review.countryName && (
 <span className="flex items-center gap-1.5">
 <Globe className="w-3.5 h-3.5" />
 {review.countryName}
 </span>
 )}
 </div>
 </div>
 
 <div className="flex gap-2 lg:flex-shrink-0">
 <button
 onClick={() => togglePublish(review._id)}
 className={`p-3 rounded-xl border transition-all ${
 review.isPublished 
 ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20' 
 : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
 }`}
 title={review.isPublished ? 'Unpublish' : 'Publish'}
 >
 {review.isPublished ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 <button
 onClick={() => openEdit(review)}
 className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all"
 title="Edit"
 >
 <Edit2 className="w-5 h-5" />
 </button>
 <button
 onClick={() => handleDelete(review._id)}
 className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
 title="Delete"
 >
 <Trash2 className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Create/Edit Modal */}
 {showModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
 <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-2xl rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-200">
 <div className="p-8 border-b border-white/10 flex items-center justify-between">
 <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
 {editingReview ? 'Edit Review' : 'Add New Review'}
 </h2>
 <button 
 onClick={() => setShowModal(false)}
 className="p-2 hover:bg-white/5 rounded-full transition-colors"
 >
 <X className="w-6 h-6 text-white/40" />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Reviewer Name</label>
 <input
 required
 type="text"
 value={formData.reviewerName}
 onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
 placeholder="e.g. John Doe"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Review Title</label>
 <input
 type="text"
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
 placeholder="e.g. Amazing Service"
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description</label>
 <textarea
 required
 rows={4}
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 resize-none"
 placeholder="Enter review content..."
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Stars (1-5)</label>
 <select
 value={formData.stars}
 onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) })}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
 >
 <option value={5}>5 Stars</option>
 <option value={4}>4 Stars</option>
 <option value={3}>3 Stars</option>
 <option value={2}>2 Stars</option>
 <option value={1}>1 Star</option>
 </select>
 </div>

 {/* Searchable Country Dropdown */}
 <div className="space-y-2 relative" ref={countryDropdownRef}>
 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Country</label>
 <div 
 className="relative cursor-pointer"
 onClick={() => setShowCountryDropdown(!showCountryDropdown)}
 >
 <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center justify-between">
 <div className="flex items-center gap-3">
 {formData.countryImage && (
 <img src={getImageUrl(formData.countryImage)} alt="" className="w-5 object-contain" />
 )}
 <span className={formData.countryName ? 'text-white' : 'text-white/20'}>
 {formData.countryName || 'Select Country'}
 </span>
 </div>
 <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
 </div>
 </div>

 {showCountryDropdown && (
 <div className="absolute z-[60] top-full left-0 w-full mt-2 bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
 <div className="p-3 border-b border-white/5">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
 <input
 type="text"
 autoFocus
 value={countrySearch}
 onChange={(e) => setCountrySearch(e.target.value)}
 onClick={(e) => e.stopPropagation()}
 placeholder="Search countries..."
 className="w-full bg-white/5 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none"
 />
 </div>
 </div>
 <div className="max-h-60 overflow-y-auto custom-scrollbar">
 {filteredCountries.map(country => (
 <div
 key={country.code}
 onClick={() => selectCountry(country)}
 className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors group"
 >
 <img src={`https://flagcdn.com/w20/${country.code}.png`} alt="" className="w-5 object-contain opacity-60 group-hover:opacity-100" />
 <span className="text-sm text-white/60 group-hover:text-white">{country.name}</span>
 </div>
 ))}
 {filteredCountries.length === 0 && (
 <div className="px-4 py-8 text-center text-xs text-white/20 uppercase font-bold tracking-widest">
 No countries found
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="space-y-4">
 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Review Content Image (PNG)</label>
 <div className="relative group">
 <input
 type="file"
 accept="image/png"
 onChange={(e) => handleFileUpload(e, 'reviewImage')}
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
 />
 <div className="w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-primary/30 transition-all overflow-hidden relative">
 {formData.reviewImage ? (
 <>
 <img src={getImageUrl(formData.reviewImage)} alt="Preview" className="w-full h-full object-contain p-4" />
 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
 <span className="text-[10px] font-black text-white uppercase tracking-widest">Click to Change</span>
 </div>
 </>
 ) : (
 <>
 <ImageIcon className="w-10 h-10 text-white/20" />
 <div className="text-center">
 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Drop PNG review image here</p>
 <p className="text-[9px] text-white/20 uppercase mt-1">Recommended size: 1200x800px</p>
 </div>
 </>
 )}
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
 <div>
 <h5 className="text-[11px] font-black text-white uppercase tracking-widest">Publish Status</h5>
 <p className="text-[10px] text-white/40 uppercase tracking-widest">Make review visible on site</p>
 </div>
 <button
 type="button"
 onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
 className={`w-14 h-7 rounded-full transition-all relative ${formData.isPublished ? 'bg-primary' : 'bg-white/10'}`}
 >
 <div className={`absolute top-1 w-5 h-5 rounded-full transition-all ${formData.isPublished ? 'right-1 bg-black' : 'left-1 bg-white/20'}`}></div>
 </button>
 </div>
 </form>

 <div className="p-8 border-t border-white/10 flex gap-4">
 <button 
 type="button"
 onClick={() => setShowModal(false)}
 className="flex-1 py-4 bg-white/5 text-white font-black uppercase tracking-widest text-[13px] rounded-xl hover:bg-white/10 transition-all"
 >
 Cancel
 </button>
 <button 
 type="submit"
 onClick={handleSubmit}
 disabled={isSubmitting}
 className="flex-1 py-4 bg-primary text-black font-black uppercase tracking-widest text-[13px] rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
 >
 {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
 {editingReview ? 'Update Review' : 'Create Review'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 </AdminLayout>
 );
};

export default Reviews;

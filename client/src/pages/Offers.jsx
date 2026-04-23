import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';

const Offers = () => {
 const [offers, setOffers] = useState([]);
 const [loading, setLoading] = useState(true);
 const { formatPrice } = useCurrency();

 useEffect(() => {
 axios.get(`${API_URL}/api/v1/offers`)
 .then(res => {
 setOffers(res.data.data);
 setLoading(false);
 })
 .catch(err => {
 console.error(err);
 setLoading(false);
 });
 }, []);

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 return (
 <div className="min-h-screen px-6 py-20 bg-black">
 <div className="max-w-[1440px] mx-auto">
 <h1 className="text-5xl md:text-7xl font-black mb-16 tracking-tight text-white transition-colors">
 Special Offers
 </h1>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {offers.map((offer, i) => (
 <div
 key={i}
 className="p-10 rounded-[48px] border transition-all shadow-2xl bg-[#0A0A0A] border-white/10"
 >
 <img src={offer.image} className="w-full h-48 object-cover rounded-3xl mb-8" alt={offer.title} />
 <h3 className="text-2xl font-black mb-4 text-white">
 {offer.title}
 </h3>
 <p className="font-bold mb-8 text-white/60">
 {offer.description || 'Exclusive boost offer for our community.'}
 </p>
 <div className="flex items-center justify-between">
 <span className="text-primary text-2xl font-black">{formatPrice(offer.price || 49.99)}</span>
 <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all">
 View Detail
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

export default Offers;

import React from 'react';
import Hero from '../sections/Hero';
import HotOffers from '../sections/HotOffers';
import BrandBanner from '../sections/BrandBanner';
import StatsGrid from '../sections/StatsGrid';
import TestimonialsSection from '../sections/TestimonialsSection';
import GuidesSection from '../sections/GuidesSection';
import DiscoverGames from '../sections/DiscoverGames';
import CommunityEarnings from '../sections/CommunityEarnings';
import GameGrid from '../sections/GameGrid';
import CategoryFilter from './CategoryFilter';
import { useUI } from '../../context/UIContext';
import ServiceCard from '../ui/ServiceCard';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { useState, useEffect } from 'react';

const BoostingMode = () => {
    const { setIsMegaMenuOpen } = useUI();
    const [activeCategory, setActiveCategory] = useState('all');
    const [filteredServices, setFilteredServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);

    useEffect(() => {
        if (activeCategory !== 'all') {
            const fetchFiltered = async () => {
                setLoadingServices(true);
                try {
                    const res = await axios.get(`${API_URL}/api/v1/services?boostCategory=${activeCategory}&limit=12`);
                    setFilteredServices(res.data.data);
                } catch (err) {
                    console.error("Error fetching filtered services:", err);
                } finally {
                    setLoadingServices(false);
                }
            };
            fetchFiltered();
        }
    }, [activeCategory]);

    const handleLoadMore = () => {
        setIsMegaMenuOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="animate-fade-in">
            <Hero />
            <div className="mt-[-40px] relative z-20">
                <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            </div>

            {activeCategory === 'all' ? (
                <GameGrid onLoadMore={handleLoadMore} />
            ) : (
                <section className="pb-16 px-6 bg-black min-h-[400px]">
                    <div className="max-w-[1400px] mx-auto">
                        {loadingServices ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="h-[320px] rounded-[48px] bg-[#0D0D0D] border border-white/10 flex items-center justify-center animate-pulse">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredServices.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredServices.map((service) => (
                                    <ServiceCard key={service._id} service={service} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center">
                                <p className="text-white/20 font-black uppercase tracking-widest italic">No {activeCategory.replace('-', ' ')} services available right now.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}
            <HotOffers />
            <BrandBanner />
            <StatsGrid />
            <TestimonialsSection />
            <GuidesSection />
            <CommunityEarnings />
            <DiscoverGames />
        </div>
    );
};

export default BoostingMode;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import WowHero from '../components/wow/WowHero';
import WowFilterBar from '../components/wow/WowFilterBar';
import WowOfferGrid from '../components/wow/WowOfferGrid';
import WowCustomOffer from '../components/wow/WowCustomOffer';
import SubNavbar from '../components/layout/SubNavbar';
import Breadcrumbs from '../components/layout/Breadcrumbs';

const WowBoost = () => {
    const [services, setServices] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('popularityScore');
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const [wowGameId, setWowGameId] = useState(null);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/v1/games/wow/services`, {
                params: {
                    category: activeCategory,
                    sortBy: sortBy.includes('_') ? sortBy.split('_')[0] : sortBy,
                    sortOrder: sortBy.includes('_') ? sortBy.split('_')[1] : 'desc',
                    page: pagination.page,
                    limit: 12
                }
            });

            if (res.data.success) {
                setServices(res.data.data);
                setStats(res.data.stats);
                setPagination(res.data.pagination);

                // Extract gameId if we don't have it (needed for custom requests)
                if (res.data.data.length > 0 && !wowGameId) {
                    setWowGameId(res.data.data[0].gameId);
                }
            }
        } catch (err) {
            console.error('Failed to fetch services', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
        // Set document title for SEO
        document.title = 'WoW Boost Services | World of Warcraft Boosting - BoostGG';
    }, [activeCategory, sortBy, pagination.page]);

    // Metadata / SEO
    useEffect(() => {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = "Premium WoW boosting services. Raids, Dungeons, PvP, and leveling delivered by top boosters. Secure and fast World of Warcraft service.";
        }
    }, []);

    return (
        <main className="bg-black min-h-screen">
            <SubNavbar />

            {/* Page Header Area */}
            <div className="container mx-auto px-6 pt-24 pb-4">
                <Breadcrumbs items={[{ label: 'Games', path: '/' }, { label: 'World of Warcraft', path: '/wow-boost' }]} />
            </div>

            <WowHero stats={stats} />

            <WowFilterBar
                activeCategory={activeCategory}
                onCategoryChange={(cat) => {
                    setActiveCategory(cat);
                    setPagination(prev => ({ ...prev, page: 1 }));
                }}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            <section className="py-12 bg-black/20">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black italic uppercase text-white flex items-center gap-4">
                            <span className="w-8 h-1 bg-primary rounded-full" />
                            {activeCategory === 'all' ? 'All Offers' : `${activeCategory} Offers`}
                        </h2>
                        <div className="text-xs font-bold uppercase tracking-widest text-white/20">
                            Showing {services.length} of {pagination.total || 0} services
                        </div>
                    </div>

                    <WowOfferGrid services={services} loading={loading} />

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="mt-16 flex items-center justify-center gap-2">
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                    className={`w-12 h-12 rounded-xl border font-black transition-all ${pagination.page === i + 1
                                            ? 'bg-primary border-primary text-black'
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <WowCustomOffer gameId={wowGameId} />
        </main>
    );
};

export default WowBoost;

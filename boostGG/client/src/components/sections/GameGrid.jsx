import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GameCard from '../ui/GameCard';
import ServiceCard from '../ui/ServiceCard';
import { API_URL } from '../../utils/api';
import { ChevronRight } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const GameGrid = ({ onLoadMore }) => {
    const { experienceToggle } = useUI();

    // Generic states for both modes
    const [items, setItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch logic based on the toggle state
    useEffect(() => {
        setLoading(true);
        setItems([]);

        // Fetch Games for all toggles, because we render Gold/Accounts as Game Cards
        axios.get(`${API_URL}/api/v1/games`)
            .then(res => {
                let allGames = (res.data.data || []).slice(2); // Skip first 2

                // Shuffle games slightly for different tabs so it visually changes
                if (experienceToggle === 'gold' || experienceToggle === 'accounts') {
                    allGames = [...allGames].sort(() => 0.5 - Math.random());
                }

                setTotalItems(allGames.length);
                setItems(allGames.slice(0, 12));
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching games:', err);
                setLoading(false);
            });
    }, [experienceToggle]);

    return (
        <section className="pb-16 px-6 bg-black">
            <div className="max-w-[1400px] mx-auto">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="h-[240px] rounded-[48px] bg-[#0D0D0D] border border-white/10 flex items-center justify-center">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    null
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {items.map((item, i) => (
                                <GameCard key={item._id || i} game={item} />
                            ))}
                        </div>

                        {totalItems > 12 && (
                            <div className="mt-12 flex flex-col items-center justify-center gap-4">
                                <span className="text-white/40 text-[14px] font-[900] uppercase tracking-[0.2em]">
                                    Showing 12 of {totalItems + 2} {experienceToggle === 'selection' ? 'games' : 'options'}
                                </span>
                                <button
                                    onClick={onLoadMore}
                                    className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    Load More {experienceToggle === 'selection' ? 'Games' : 'Options'}
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default GameGrid;

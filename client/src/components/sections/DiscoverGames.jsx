import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2, Gamepad2 } from 'lucide-react';
import axios from 'axios';
import { API_URL, getImageUrl } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const DiscoverGames = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_URL}/api/v1/games`)
            .then(res => {
                setGames(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching games:', err);
                setLoading(false);
            });
    }, []);

    const displayedGames = expanded ? games : games.slice(0, 30);

    return (
        <section className="px-6 py-20 bg-black">
            <div className="max-w-[1400px] mx-auto">
                <div className="bg-[#111111] rounded-[48px] p-8 md:p-14 border border-white/[0.05]">
                    <h2 className="text-2xl md:text-[34px] font-black text-white tracking-tight mb-10">
                        Discover all {games.length || 137} games on BoostGG
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-2.5">
                                {displayedGames.map((game, i) => (
                                    <button 
                                        key={game._id || i} 
                                        onClick={() => navigate(`/game/${game.slug || game._id}`)}
                                        className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#1A1A1A] border border-white/[0.08] rounded-xl text-white/50 text-[13px] font-bold hover:bg-[#222] hover:text-white hover:border-white/15 transition-all active:scale-95"
                                    >
                                        <div className="w-5 h-5 flex-shrink-0">
                                            {game.icon ? (
                                                <img 
                                                    src={getImageUrl(game.icon)} 
                                                    className="w-full h-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                                                    alt="" 
                                                />
                                            ) : (
                                                <Gamepad2 className="w-full h-full text-white/20" />
                                            )}
                                        </div>
                                        <span>{game.name}</span>
                                    </button>
                                ))}
                            </div>
                            
                            {games.length > 30 && (
                                <div className="mt-10 flex justify-start">
                                    <button 
                                        onClick={() => setExpanded(!expanded)}
                                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 text-[12px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        {expanded ? (
                                            <>Show less <ChevronUp className="w-4 h-4" /></>
                                        ) : (
                                            <>Show {games.length - 30} more games <ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style jsx="true">{`
                .grayscale {
                    filter: grayscale(1);
                }
                button:hover .grayscale {
                    filter: grayscale(0);
                    opacity: 1;
                }
            `}</style>
        </section>
    );
};

export default DiscoverGames;


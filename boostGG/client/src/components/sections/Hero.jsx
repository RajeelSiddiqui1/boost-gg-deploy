import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, Zap } from 'lucide-react';
import GameCard from '../ui/GameCard';
import { API_URL } from '../../utils/api';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  // Fetch first 2 games from API
  useEffect(() => {
    axios.get(`${API_URL}/api/v1/games`)
      .then(res => {
        // Access the data property which contains the array of games
        const gamesList = res.data.data || [];
        setGames(gamesList.slice(0, 2)); // Get top 2 games for sidebar (no scroll)
        setLoadingGames(false);
      })
      .catch(err => {
        console.error('Error fetching games:', err);
        setLoadingGames(false);
      });
  }, []);

  const slides = [
    {
      id: 1,
      subtitle: "Boost your game — and your wallet",
      title: "Cashback Program",
      buttonText: "Read more",
      visual: (
        <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/20 via-transparent to-transparent z-10"></div>
          <div className="relative h-full flex items-center justify-center scale-125">
            <div className="absolute w-[300px] h-[300px] bg-primary/40 blur-[100px] rounded-full"></div>
            <div className="relative z-20 space-y-4">
              <div className="w-24 h-12 bg-white/10 rounded-lg border border-white/10 rotate-12 flex items-center justify-center text-[10px] font-black text-white">$100</div>
              <div className="w-24 h-12 bg-white/10 rounded-lg border border-white/10 -rotate-12 translate-x-12 flex items-center justify-center text-[10px] font-black text-white">$50</div>
              <div className="w-24 h-12 bg-white/10 rounded-lg border border-white/10 rotate-6 -translate-x-8 flex items-center justify-center text-[10px] font-black text-white">$20</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      subtitle: "Exclusive Perks & Benefits",
      title: "VIP Status",
      buttonText: "Join VIP",
      visual: (
        <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/20 via-transparent to-transparent z-10"></div>
          <div className="relative h-full flex items-center justify-center scale-110">
            <div className="absolute w-[300px] h-[300px] bg-primary/30 blur-[100px] rounded-full"></div>
            <Zap className="w-48 h-48 text-white/10 rotate-12" />
          </div>
        </div>
      )
    },
    {
      id: 3,
      subtitle: "Earn together",
      title: "Invite Friends",
      buttonText: "Get Link",
      visual: (
        <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/20 via-transparent to-transparent z-10"></div>
          <div className="relative h-full flex items-center justify-center scale-110">
            <div className="absolute w-[300px] h-[300px] bg-primary/30 blur-[100px] rounded-full"></div>
            <div className="flex -space-x-4">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20"></div>
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20"></div>
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/50 font-bold">+5</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-6 pb-6 px-6 bg-black">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-12 gap-5 mb-5">
          {/* Big Carousel Card: Dynamic */}
          <div className="col-span-12 lg:col-span-8 h-[416px] rounded-[48px] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 relative overflow-hidden group p-12 flex flex-col justify-center transition-all duration-500">

            {/* Dynamic Visual Backgrounds */}
            {slides.map((slide, index) => (
              <div key={index} className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                {slide.visual}
              </div>
            ))}

            <div className="relative z-20 max-w-md h-full flex flex-col justify-center">
              {/* Content Swapping */}
              {slides.map((slide, index) => (
                <div key={index} className={`transition-all duration-700 absolute inset-0 flex flex-col justify-center ${index === currentSlide ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                  <p className="text-white/40 text-[14px] font-bold mb-4">{slide.subtitle}</p>
                  <h2 className="text-[56px] font-black text-white leading-[1] tracking-tighter mb-10">
                    {slide.title}
                  </h2>
                  <div>
                    <button className="bg-primary hover:bg-primary-light text-white px-10 py-4 rounded-2xl font-black text-[14px] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/40">
                      {slide.buttonText}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-10 left-12 flex gap-2 z-30">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Stack: 2 Game Cards (Fixed, No Scroll) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-[416px]">
            {loadingGames ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="rounded-[32px] bg-[#0D0D0D] border border-white/10 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ))
            ) : games.length === 0 ? (
              <div className="col-span-2 rounded-[32px] bg-[#0D0D0D] border border-white/10 flex items-center justify-center">
                <p className="text-white/20 text-sm">No games</p>
              </div>
            ) : (
              games.map((game, index) => (
                <GameCard key={game._id || index} game={game} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

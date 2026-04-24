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
        const gamesList = res.data.data || [];
        setGames(gamesList.slice(0, 2));
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
      image: "/hero-images/hero-1.jpg",
      logoPos: "top-10 right-10"
    },
    {
      id: 2,
      subtitle: "Exclusive Perks & Benefits",
      title: "VIP Status",
      buttonText: "Join VIP",
      image: "/hero-images/hero-2.jpg",
      logoPos: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    },
    {
      id: 3,
      subtitle: "Earn together",
      title: "Invite Friends",
      buttonText: "Get Link",
      image: "/hero-images/hero-3.jpg",
      logoPos: "bottom-10 left-10"
    },
    {
      id: 4,
      subtitle: "Professional Services",
      title: "Pro Boosting",
      buttonText: "Start Now",
      image: "/hero-images/hero-4.jpg",
      logoPos: "top-10 left-1/2 -translate-x-1/2"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="pt-6 pb-6 px-6 bg-black font-['Outfit']">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-12 gap-5 mb-5">
          {/* Big Carousel Card: Dynamic */}
          <div className="col-span-12 lg:col-span-8 h-[416px] rounded-[48px] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 relative overflow-hidden group transition-all duration-500">
            
            {/* Dynamic Visual Backgrounds */}
            {slides.map((slide, index) => (
              <div 
                key={index} 
                className={`absolute inset-0 transition-all duration-1000 ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
              >
                <img src={slide.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                <div className={`absolute ${slide.logoPos} z-30`}>
                  <span className="text-[10px] font-black text-white/40 tracking-[0.5em] uppercase px-4 py-2 bg-black/20 backdrop-blur-md rounded-lg border border-white/5">BOOSTGG</span>
                </div>
              </div>
            ))}

            <div className="relative z-20 max-w-md h-full flex flex-col justify-center px-12">
              {/* Content Swapping */}
              {slides.map((slide, index) => (
                <div 
                  key={index} 
                  className={`transition-all duration-700 absolute inset-y-0 left-12 flex flex-col justify-center ${index === currentSlide ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}`}
                >
                  <p className="text-white/40 text-[14px] font-bold mb-4 uppercase tracking-widest">{slide.subtitle}</p>
                  <h2 className="text-[56px] font-black text-white leading-[1] tracking-tighter mb-10 uppercase">
                    {slide.title}
                  </h2>
                  <div>
                    <button className="bg-primary hover:bg-primary-light text-white px-10 py-4 rounded-2xl font-black text-[14px] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/40 uppercase tracking-widest">
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
              [...Array(2)].map((_, i) => (
                <div key={i} className="flex-1 rounded-[32px] bg-[#0D0D0D] border border-white/10 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ))
            ) : games.length === 0 ? (
              <div className="flex-1 rounded-[32px] bg-[#0D0D0D] border border-white/10 flex items-center justify-center">
                <p className="text-white/20 text-sm">No games</p>
              </div>
            ) : (
              games.map((game, index) => (
                <div key={game._id || index} className="flex-1 min-h-0">
                  <GameCard game={game} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import React, { useState, useRef } from "react";
import video from "../assets/about.mp4";
import {
  ShieldCheck,
  Headphones,
  Users2,
  Gamepad,
  Star,
  ChevronRight,
  Quote,
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX
} from "lucide-react";
const About = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };
  return (
    <div className="min-h-screen bg-black text-white font-['Outfit'] selection:bg-primary/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto text-center relative z-10 px-6">
          <h1 className="text-[12px] font-black uppercase tracking-[0.3em] text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            About BoostGG
          </h1>
          <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-[0.95] mb-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
            TO HELP YOU PLAY YOUR WAY AND ENJOY YOUR GAMES
          </h2>

          {/* Video Player Section - 100% Width */}
          <div className="w-full mt-16 aspect-video bg-[#111] relative overflow-hidden group shadow-2xl shadow-primary/20 animate-in fade-in zoom-in duration-1000">
            <video
              ref={videoRef}
              src={video}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

            {/* Custom Controls (Functional) */}
            <div className="absolute bottom-8 right-8 flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all pointer-events-auto"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all pointer-events-auto"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all pointer-events-auto"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Watermark/Text at Bottom Center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <span className="text-4xl font-black italic text-white/20 tracking-tighter uppercase select-none">boosts</span>
            </div>

            {/* Philosophy Text (Floating) */}
            <div className="absolute bottom-10 left-10 text-left pointer-events-none">
              <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">
                Watch Video
              </p>
              <h3 className="text-xl font-black italic">OUR PHILOSOPHY</h3>
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/40 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#8bc332]/30 rounded-full blur-[120px]"></div>
        </div>
      </section>

      {/* Philosophy Cards Grid */}
      <section className="py-24 px-6 relative">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Safety and transparency",
              desc: "We care about every customer and prioritize safety at every step",
              icon: ShieldCheck,
              color: "text-green-400",
            },
            {
              title: "Support 24/7 and professionalism",
              desc: "We're here to help with anything, and our experts provide reliable support",
              icon: Headphones,
              color: "text-primary",
            },
            {
              title: "Connection and community",
              desc: "We're gamers too, and we share your enthusiasm for gaming",
              icon: Users2,
              color: "text-[#8bc332]",
            },
            {
              title: "Individuality and freedom",
              desc: "We believe everyone should be able to play their way and fully enjoy their games",
              icon: Gamepad,
              color: "text-orange-400",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[40px] hover:border-white/10 transition-all group hover:-translate-y-2 duration-500"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.color}`}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black italic mb-4 leading-tight uppercase">
                {item.title}
              </h3>
              <p className="text-white/40 font-bold leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] mb-10">
              WHAT BOOSTS YOU, <br />
              MAKES US
            </h2>
            <div className="space-y-6 text-lg font-bold text-white/50 leading-relaxed">
              <p>
                Since 2020, BoostGG has brought together seasoned professionals
                and like-minded gamers to help you enjoy every moment of your
                favorite titles. We've been gaming since the days of our first
                consoles and PCs, and that passion fuels everything we do at
                BoostGG.
              </p>
              <p>
                But we're more than just a service — we're a tight-knit
                community of pro players, coaches, engineers, designers,
                managers, and everything in between. When we come together, the
                game becomes more dynamic, and achievements shine brighter.
                That's why we're not just a set of offerings — we're a true
                community, driven by your goals and inspired by your success.
                After all, what boosts you, makes us.
              </p>
              <p>
                Whether you're playing for fun or striving for that competitive
                edge, we're here to elevate your gaming experience. And if our
                vision resonates with you, join our team—together, we'll keep
                pushing the boundaries of what's possible in gaming.
              </p>
            </div>
            <button className="mt-12 flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-primary/20">
              Join BoostGG Family
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Image Placeholder */}
          <div className="relative aspect-square bg-[#111] border border-white/5 rounded-[64px] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="w-full h-full border-2 border-dashed border-white/10 rounded-[48px] flex items-center justify-center text-white/10 font-black text-2xl uppercase tracking-widest italic">
                Team Image Placeholder
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#8bc332]/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Trustpilot Section */}
      <section className="py-24 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-6 h-6 fill-[#00B67A] text-[#00B67A]" />
              <span className="font-black text-xl italic italic">
                Trustpilot
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
              "BoostGG is really <br className="md:hidden" />
              trustworthy!"
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Awesome! Just Awesome!",
                text: "Staff is super nice and replies extremely quickly. The pro I work with is really nice and gets stuff done quick!",
                author: "Verified Customer",
              },
              {
                title: "As Good As It Gets",
                text: "Fantastic service! Quick and professional. Players are really good and have great personalities. Cost is also way better than competitors.",
                author: "Verified Customer",
              },
              {
                title: "Awesome",
                text: "Their communication is fast and efficient, making the entire experience a breeze. The product they offer is nothing short of excellent.",
                author: "Verified Customer",
              },
            ].map((review, i) => (
              <div
                key={i}
                className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[40px] relative overflow-hidden group hover:border-primary/20 transition-all"
              >
                <Quote className="absolute top-6 right-8 w-12 h-12 text-white/5 -rotate-12" />
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className="w-5 h-5 bg-[#00B67A] rounded-sm flex items-center justify-center"
                    >
                      <Star className="w-3 h-3 fill-white text-white" />
                    </div>
                  ))}
                </div>
                <h4 className="text-lg font-black italic mb-4 uppercase">
                  {review.title}
                </h4>
                <p className="text-white/40 font-bold leading-relaxed mb-6">
                  {review.text}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#00B67A]">
                  {review.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

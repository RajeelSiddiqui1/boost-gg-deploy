import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/api";
import { Flame, Play, Coins, UserCircle2, ChevronRight } from "lucide-react";
import { useMode } from "../../context/ModeContext";

const GameCard = ({ game, className = "h-[200px]" }) => {
 const navigate = useNavigate();
 const { activeMode, MODES } = useMode();

 const handleClick = () => {
 let path = `/game/${game.slug || game._id}`;
 if (game.slug === 'world-of-warcraft' || game.slug === 'wow') {
 path = '/wow-boost';
 }
 
 // Append mode if not default
 if (activeMode && activeMode !== MODES.BOOSTING) {
 path += `?mode=${activeMode}`;
 }
 
 navigate(path);
 };

 let titleSuffix = "";
 let buttonText = "Explore";
 let ButtonIcon = ChevronRight;

 if (activeMode === MODES.CURRENCY) {
 titleSuffix = " Gold & Currency";
 buttonText = "Buy Gold";
 ButtonIcon = Coins;
 } else if (activeMode === MODES.ACCOUNTS) {
 titleSuffix = " Accounts";
 buttonText = "Get Account";
 ButtonIcon = UserCircle2;
 }

 return (
 <div
 onClick={handleClick}
 className={`
 relative group
 w-full
 rounded-[32px]
 overflow-hidden
 bg-[#090909]
 border border-white/[0.04]
 cursor-pointer
 transition-all duration-500
 hover:border-primary/40
 hover:shadow-[0_0_50px_rgba(162,230,62,0.15)]
 flex flex-col
 ${className}
 `}
 >
 {/* Background Imagery */}
 <div className="absolute inset-0 z-0">
 <img
 src={getImageUrl(game.bgImage || game.image)}
 alt={game.name || game.title}
 className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 group-hover:opacity-60 transition-all duration-[1500ms]"
 />
 {/* Deep Skycoach-style gradient mask */}
 <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent"></div>
 <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
 </div>

 {/* Character pop-out imagery */}
 {game.characterImage && (
 <img
 src={getImageUrl(game.characterImage)}
 alt={`${game.name || game.title} character`}
 className="absolute bottom-[-5%] right-[-5%] h-[110%] w-auto object-contain z-10 opacity-90 group-hover:scale-[1.03] group-hover:-translate-x-2 transition-transform duration-[1000ms] pointer-events-none drop-shadow-2xl"
 />
 )}

 {/* Main Content Container */}
 <div className="relative z-20 h-full flex flex-col justify-between p-6">

 {/* Top: Icon + Name */}
 <div className="flex items-start gap-4 max-w-[75%]">
 <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 bg-black/80 flex-shrink-0 shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:border-primary/50 transition-colors">
 <img src={getImageUrl(game.icon)} alt={game.name} className="w-full h-full object-cover p-1 opacity-90 group-hover:opacity-100" />
 </div>
 <div className="pt-1">
 <h3 className="text-[16px] font-black text-white leading-[1.15] tracking-tight drop-shadow-lg">
 {(game.name || game.title) + titleSuffix}
 </h3>
 <div className="flex items-center gap-1.5 mt-1.5">
 {(game.isHot || game.isFeatured) && (
 <Flame className="w-3 h-3 text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
 )}
 <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] drop-shadow-md">
 {game.category || 'Premium Category'}
 </p>
 </div>
 </div>
 </div>


 {/* Bottom Bar: Services count + CTA */}
 <div className="flex items-end justify-between mt-auto">
 <div className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-md border border-white/5 pr-4 pl-1.5 py-1.5 rounded-full shadow-inner">
 <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
 <span className="text-[10px] font-black text-white">{game.servicesCount || 0}</span>
 </div>
 <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] pt-0.5">Services</span>
 </div>

 <button className="flex items-center gap-2 bg-primary group-hover:bg-[#8cc63e] text-black px-6 py-3 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(162,230,62,0.2)] group-hover:shadow-[0_0_30px_rgba(162,230,62,0.4)] hover:scale-105 active:scale-95">
 <ButtonIcon className="w-4 h-4 fill-current" />
 <span className="text-[11px] font-black uppercase tracking-widest leading-none pt-0.5">{buttonText}</span>
 </button>
 </div>
 </div>
 </div>
 );
};

export default GameCard;

import React from 'react';

const Switch = ({ label, active, onClick }) => {
 return (
 <div className="flex items-center gap-4">
 <span className={`text-[15px] font-bold transition-colors whitespace-nowrap tracking-wide ${active
 ? 'text-white'
 : 'text-white/40'
 }`}>
 {label}
 </span>
 <div
 onClick={onClick}
 className={`w-[48px] h-[24px] rounded-full relative cursor-pointer transition-all duration-300 ${active
 ? 'bg-white'
 : 'bg-white/10'
 }`}
 >
 <div
 className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${active
 ? 'left-[26px] bg-black shadow-lg'
 : 'left-1 bg-gray-500'
 }`}
 ></div>
 </div>
 </div>
 );
};

export default Switch;

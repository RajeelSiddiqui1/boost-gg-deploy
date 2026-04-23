import React from 'react';
import { Clock } from 'lucide-react';

const Placeholder = ({ title = 'Coming Soon' }) => {
 return (
 <div className="flex flex-col items-center justify-center h-[60vh] text-center">
 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
 <Clock className="w-10 h-10 text-white/20" />
 </div>
 <h2 className="text-2xl font-black uppercase text-white/60 mb-2">{title}</h2>
 <p className="text-white/30 text-sm">This feature is under development</p>
 </div>
 );
};

export default Placeholder;

import React from 'react';
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Breadcrumbs = ({ gameName, categoryName, productName }) => {
 const navigate = useNavigate();

 return (
 <div className="flex flex-wrap items-center gap-5 py-8">
 <button
 onClick={() => navigate(-1)}
 className="flex items-center gap-2 rounded-md bg-white/[0.03] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 transition-all hover:bg-white/[0.08] hover:text-white active:scale-95 border border-white/5"
 >
 <ChevronLeft size={14} />
 Back
 </button>
 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
 <Link to="/" className="hover:text-white transition-colors">BoostGG</Link>
 <span className="opacity-40">/</span>
 <span className="hover:text-white cursor-pointer transition-colors">{gameName || 'WoW'}</span>
 <span className="opacity-40">/</span>
 <span className="hover:text-white cursor-pointer transition-colors">{categoryName || 'Raids'}</span>
 <span className="opacity-40">/</span>
 <span className="text-white/60">{productName}</span>
 </div>
 </div>
 );
};

export default Breadcrumbs;

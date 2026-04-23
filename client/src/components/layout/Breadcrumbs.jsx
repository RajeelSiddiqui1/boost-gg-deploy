import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items = [] }) => {
 return (
 <nav className="flex" aria-label="Breadcrumb">
 <ol className="inline-flex items-center space-x-1 md:space-x-3">
 <li className="inline-flex items-center">
 <Link to="/" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors">
 <Home className="w-3 h-3 mr-2" />
 Home
 </Link>
 </li>
 {items.map((item, index) => (
 <li key={index}>
 <div className="flex items-center">
 <ChevronRight className="w-3 h-3 text-white/20 mx-1" />
 <Link
 to={item.path}
 className={`ml-1 md:ml-2 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors ${index === items.length - 1 ? 'text-white pointer-events-none' : 'text-white/40'
 }`}
 >
 {item.label}
 </Link>
 </div>
 </li>
 ))}
 </ol>
 </nav>
 );
};

export default Breadcrumbs;

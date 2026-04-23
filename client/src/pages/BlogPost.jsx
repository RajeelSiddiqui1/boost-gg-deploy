import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
 Calendar,
 User,
 Eye,
 ChevronLeft,
 Share2,
 Clock,
 Zap,
 Star,
 MessageSquare,
 Trophy,
 AlertCircle,
 Code,
 Quote,
 Info,
 CheckCircle,
 Table as TableIcon,
 BookOpen,
 ThumbsUp,
 Facebook,
 Twitter,
 Linkedin,
 Link as LinkIcon,
 Instagram,
 Youtube,
 ChevronDown,
 Video,
 Heart,
 Flag,
 Award,
 Shield,
 Target
} from 'lucide-react';
import { API_URL, getImageUrl } from '../utils/api';

// Component to render individual layout blocks
const LayoutBlock = ({ block }) => {
 const [expandedItems, setExpandedItems] = useState({});
 
 const toggleAccordion = (itemId) => {
 setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
 };
 
 const getAlertStyles = (type) => {
 switch (type) {
 case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
 case 'success': return 'bg-green-500/10 border-green-500/30 text-green-500';
 case 'error': return 'bg-red-500/10 border-red-500/30 text-red-500';
 default: return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
 }
 };

 const getCalloutStyles = (type) => {
 switch (type) {
 case 'tip': return 'bg-purple-500/10 border-purple-500/30';
 case 'note': return 'bg-gray-500/10 border-gray-500/30';
 default: return 'bg-primary/10 border-primary/30';
 }
 };

 if (block.columns) {
 return (
 <section style={{ padding: block.settings?.padding, backgroundColor: block.settings?.backgroundColor }} className="w-full my-6">
 <div className="flex flex-col md:flex-row flex-wrap" style={{ gap: block.settings?.gap || '20px' }}>
 {block.columns.map(col => (
 <div key={col.id}
 className="admin-column flex-shrink-0"
 style={{
 '--col-width': col.width || '100%',
 padding: col.settings?.padding,
 backgroundColor: col.settings?.backgroundColor,
 borderRadius: col.settings?.borderRadius,
 border: col.settings?.border
 }}>
 {col.widgets.map(w => <LayoutBlock key={w.id} block={{ ...w, isNewWidget: true }} />)}
 </div>
 ))}
 </div>
 </section>
 );
 }

 if (block.isNewWidget || block.settings) {
 const c = block.settings || {};
 const a = block.advanced || {};
 let widgetHtml = null;
 switch (block.type) {
 case 'heading':
 const Tag = c.tag || 'h2';
 widgetHtml = <Tag style={{ color: c.color, textAlign: c.align, fontSize: c.size, margin: 0 }} className="font-black uppercase tracking-tight">{c.text}</Tag>;
 break;
 case 'text':
 widgetHtml = <div style={{ color: c.color, textAlign: c.align, fontSize: c.size, lineHeight: c.lineHeight }} dangerouslySetInnerHTML={{ __html: (c.text || '').replace(/\n/g, '<br/>') }} className="text-white/80" />;
 break;
 case 'image':
 widgetHtml = <div style={{ textAlign: c.align }}><img src={c.src?.startsWith('data:') ? c.src : getImageUrl(c.src)} alt={c.alt} style={{ width: c.width, borderRadius: c.radius, display: c.align === 'center' ? 'inline-block' : 'block' }} className="border border-white/10 shadow-lg max-w-full h-auto" /></div>;
 break;
 case 'video':
 let vSrc = c.src || '';
 if (vSrc.includes('youtube.com/watch')) vSrc = 'https://www.youtube.com/embed/' + vSrc.split('v=')[1]?.split('&')[0];
 widgetHtml = <div style={{ aspectRatio: c.aspectRatio || '16/9' }} className="w-full bg-black rounded-lg overflow-hidden border border-white/10 shadow-lg">{vSrc ? <iframe src={vSrc} className="w-full h-full" /> : <div className="flex items-center justify-center h-full"><Video className="w-10 h-10 text-white/20" /></div>}</div>;
 break;
 case 'button':
 const btnStyle = c.style === 'primary' ? 'bg-primary text-black hover:bg-primary/90' : c.style === 'secondary' ? 'bg-white/10 text-white hover:bg-white/20' : 'border border-primary text-primary hover:bg-primary/10';
 widgetHtml = <div style={{ textAlign: c.align }}><a href={c.link} style={{ borderRadius: c.radius }} className={`inline-block px-8 py-4 font-black uppercase text-xs tracking-widest transition-all ${btnStyle}`}>{c.text}</a></div>;
 break;
 case 'divider':
 widgetHtml = <div style={{ padding: c.margin }}><div style={{ width: c.width, height: c.height, backgroundColor: c.color, margin: '0 auto' }}></div></div>;
 break;
 case 'spacer':
 widgetHtml = <div style={{ height: c.height }}></div>;
 break;
 case 'quote':
 widgetHtml = <blockquote style={{ borderLeftColor: c.borderColor }} className="border-l-4 pl-6 py-2 my-4 bg-white/5 rounded-r-lg">
 <p style={{ color: c.color }} className="text-xl md:text-2xl font-medium leading-relaxed">"{c.text}"</p>
 {c.author && <cite className="block mt-4 text-primary text-xs font-bold uppercase tracking-widest">— {c.author}</cite>}
 </blockquote>;
 break;
 case 'code':
 widgetHtml = <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
 <div className="bg-white/5 py-2 px-4 text-xs font-bold uppercase tracking-widest text-white/50 border-b border-white/10 flex items-center"><Code className="w-3 h-3 mr-2" /> {c.language}</div>
 <pre className="p-6 text-sm font-mono text-green-400 overflow-x-auto">{c.code}</pre>
 </div>;
 break;
 default: return null;
 }
 return <div style={{ margin: a.margin, padding: a.padding }}>{widgetHtml}</div>;
 }

 switch (block.type) {
 case 'heading1':
 return (
 <h1 className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] mb-6 md:mb-8 ${block.fontSize === 'small' ? 'text-xl md:text-2xl' : block.fontSize === 'large' ? 'text-4xl md:text-5xl lg:text-6xl' : block.fontSize === 'xlarge' ? 'text-5xl md:text-6xl lg:text-7xl' : ''}`} style={{ color: block.color || '#ffffff' }}>
 {block.content}
 </h1>
 );

 case 'heading2':
 return (
 <h2 className={`text-xl md:text-2xl lg:text-3xl font-black tracking-tight mb-4 md:mb-6 mt-6 md:mt-8 ${block.fontSize === 'small' ? 'text-lg md:text-xl' : block.fontSize === 'large' ? 'text-2xl md:text-3xl lg:text-4xl' : block.fontSize === 'xlarge' ? 'text-3xl md:text-4xl lg:text-5xl' : ''}`} style={{ color: block.color || '#ffffff' }}>
 {block.content}
 </h2>
 );

 case 'heading3':
 return (
 <h3 className={`text-base md:text-lg lg:text-xl font-black mb-3 md:mb-4 mt-4 md:mt-6 ${block.fontSize === 'small' ? 'text-sm md:text-base' : block.fontSize === 'large' ? 'text-lg md:text-xl lg:text-2xl' : block.fontSize === 'xlarge' ? 'text-xl md:text-2xl lg:text-3xl' : ''}`} style={{ color: block.color || '#ffffff' }}>
 {block.content}
 </h3>
 );

 case 'paragraph':
 return (
 <p className="text-white/80 text-sm md:text-base lg:text-lg leading-6 md:leading-7 lg:leading-8 mb-6 md:mb-8 font-normal">
 {block.content}
 </p>
 );

 case 'image':
 if (!block.src) return null;
 const imageSrc = typeof block.src === 'string' ? (block.src.startsWith('data:') ? block.src : getImageUrl(block.src)) : getImageUrl(block.src);
 const imgHeight = block.height ? Number(block.height) : 700;
 return (
 <div className="my-6 md:my-8 w-full overflow-hidden">
 <img
 src={imageSrc}
 alt={block.alt || block.content || 'Blog image'}
 className="w-full h-auto max-h-[500px] md:max-h-[700px] rounded-lg md:rounded-xl border border-primary/20 shadow-lg"
 style={{
 maxHeight: imgHeight,
 objectFit: 'contain'
 }}
 />
 {block.caption && (
 <p className="text-white/50 text-center mt-2 md:mt-3 text-xs md:text-sm font-medium px-2">
 {block.caption}
 </p>
 )}
 </div>
 );

 case 'video':
 if (!block.src) return null;
 const videoSrc = block.src.includes('youtube') || block.src.includes('youtu.be')
 ? block.src.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
 : block.src;

 return (
 <div className="my-6 md:my-8 rounded-lg md:rounded-xl overflow-hidden aspect-video bg-black shadow-lg border border-white/10">
 {block.src.includes('youtube') || block.src.includes('youtu.be') || block.src.includes('embed') ? (
 <iframe
 src={videoSrc}
 className="w-full h-full"
 allowFullScreen
 title="Video embed"
 />
 ) : (
 <video src={videoSrc} controls className="w-full h-full object-cover" />
 )}
 </div>
 );

 case 'quote':
 return (
 <blockquote className="border-l-2 md:border-l-4 border-primary pl-4 md:pl-6 my-6 md:my-8 py-1">
 <p className="text-lg md:text-xl font-medium text-white/80 mb-2 md:mb-3 leading-relaxed">
 "{block.content}"
 </p>
 {block.author && (
 <cite className="text-primary text-xs md:text-sm font-bold uppercase tracking-wider block">
 — {block.author}
 </cite>
 )}
 </blockquote>
 );

 case 'code':
 return (
 <div className="my-6 md:my-8 rounded-lg md:rounded-xl overflow-hidden">
 <div className="bg-gray-900/80 px-3 md:px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-2 border-b border-white/5">
 <Code className="w-3 h-3" />
 Code
 </div>
 <pre className="bg-black/90 border border-white/10 p-3 md:p-4 overflow-x-auto">
 <code className="text-green-400 font-mono text-xs md:text-sm whitespace-pre-wrap">
 {block.content}
 </code>
 </pre>
 </div>
 );

 case 'divider':
 return <hr className="border-white/10 my-8 md:my-12" />;

 case 'alert':
 return (
 <div className={`border rounded-lg md:rounded-xl p-4 md:p-6 my-6 md:my-8 ${getAlertStyles(block.alertType)}`}>
 <div className="flex items-start gap-3 md:gap-4">
 <AlertCircle className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
 <div>
 <p className="text-sm md:text-base font-medium">{block.content}</p>
 </div>
 </div>
 </div>
 );

 case 'list':
 const items = block.content.split('\n').filter(i => i.trim());
 return (
 <ul className="list-disc list-inside space-y-2 md:space-y-3 my-6 md:my-8 text-white/70 text-sm md:text-base ml-2 md:ml-4">
 {items.map((item, i) => (
 <li key={i} className="leading-relaxed">{item}</li>
 ))}
 </ul>
 );

 case 'orderedList':
 const orderedItems = block.content.split('\n').filter(i => i.trim());
 return (
 <ol className="list-decimal list-inside space-y-2 md:space-y-3 my-6 md:my-8 text-white/70 text-sm md:text-base ml-2 md:ml-4">
 {orderedItems.map((item, i) => (
 <li key={i} className="leading-relaxed">{item}</li>
 ))}
 </ol>
 );

 case 'callout':
 return (
 <div className={`border rounded-lg md:rounded-xl p-4 md:p-6 my-6 md:my-8 ${getCalloutStyles(block.calloutType)}`}>
 <div className="flex items-start gap-3 md:gap-4">
 <Star className="w-4 h-4 md:w-5 md:h-5 text-primary mt-1 flex-shrink-0" />
 <p className="text-white text-sm md:text-base font-medium">{block.content}</p>
 </div>
 </div>
 );

 case 'toc':
 const tocItems = block.content.split('\n').filter(i => i.trim());
 return (
 <div className="bg-white/5 border border-white/10 rounded-lg md:rounded-xl p-4 md:p-6 my-6 md:my-10">
 <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
 <BookOpen className="w-4 h-4 text-primary" />
 <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white/80">Table of Contents</h4>
 </div>
 <ul className="space-y-1 md:space-y-2">
 {tocItems.map((item, i) => (
 <li key={i}>
 <a href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-white/50 hover:text-primary text-sm font-medium transition-colors block py-1">
 {item}
 </a>
 </li>
 ))}
 </ul>
 </div>
 );

 case 'infoBox':
 return (
 <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg md:rounded-xl p-4 md:p-6 my-6 md:my-10">
 <div className="flex items-start gap-3 md:gap-4">
 <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-1 flex-shrink-0" />
 <div>
 {block.title && <h5 className="text-blue-400 font-bold uppercase text-xs md:text-sm tracking-wider mb-1 md:mb-2">{block.title}</h5>}
 <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">{block.content}</p>
 </div>
 </div>
 </div>
 );

 case 'checklist':
 const checkItems = block.content.split('\n').filter(i => i.trim());
 return (
 <div className="my-6 md:my-10">
 <h4 className="text-sm md:text-base font-bold uppercase tracking-wide text-white/80 mb-3 md:mb-4 flex items-center gap-2">
 <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
 Checklist
 </h4>
 <div className="space-y-2 md:space-y-3">
 {checkItems.map((item, i) => (
 <div key={i} className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-white/5 rounded-lg border border-white/10">
 <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/20 border border-primary flex items-center justify-center flex-shrink-0">
 <CheckCircle className="w-2 h-2 md:w-3 md:h-3 text-primary" />
 </div>
 <span className="text-white/80 text-sm md:text-base font-medium">{item}</span>
 </div>
 ))}
 </div>
 </div>
 );

 case 'table':
 const tableRows = block.content.split('\n').filter(row => row.trim());
 return (
 <div className="overflow-x-auto my-6 md:my-10 rounded-lg md:rounded-xl border border-white/10">
 <table className="w-full">
 <thead>
 <tr className="bg-white/5">
 {tableRows[0]?.split('|').map((header, i) => (
 <th key={i} className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10">{header.trim()}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {tableRows.slice(1).map((row, rowIndex) => (
 <tr key={rowIndex} className="border-b border-white/5 hover:bg-white/5 transition-colors">
 {row.split('|').map((cell, cellIndex) => (
 <td key={cellIndex} className="px-3 md:px-4 py-2 md:py-3 text-white/70 text-xs md:text-sm font-medium">{cell.trim()}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );

 case 'columns':
 const leftWidth = block.columnWidths?.[0] || 50;
 const rightWidth = block.columnWidths?.[1] || 50;
 return (
 <div className="grid gap-4 md:gap-6 my-8" style={{ gridTemplateColumns: `${leftWidth}% ${rightWidth}%` }}>
 <div className="p-4 md:p-6 bg-white/5 rounded-xl border border-white/10">
 {block.leftContent ? (
 <p className="text-white/80 text-sm md:text-base leading-relaxed">{block.leftContent}</p>
 ) : (
 <p className="text-white/30 text-center text-sm">Left Column Content</p>
 )}
 </div>
 <div className="p-4 md:p-6 bg-white/5 rounded-xl border border-white/10">
 {block.rightContent ? (
 <p className="text-white/80 text-sm md:text-base leading-relaxed">{block.rightContent}</p>
 ) : (
 <p className="text-white/30 text-center text-sm">Right Column Content</p>
 )}
 </div>
 </div>
 );

 case 'button':
 const buttonStyles = {
 primary: 'bg-primary hover:bg-primary/90 text-white',
 secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
 outline: 'bg-transparent hover:bg-white/10 text-white border-2 border-primary',
 ghost: 'bg-transparent hover:bg-white/5 text-white'
 };
 return (
 <div className="my-8 text-center">
 <a
 href={block.url || '#'}
 className={`inline-block px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all ${buttonStyles[block.buttonStyle] || buttonStyles.primary}`}
 >
 {block.text || 'Click Here'}
 </a>
 </div>
 );

 case 'accordion':
 const accordionItems = block.items && block.items.length > 0 
 ? block.items 
 : [{ id: 'legacy', title: block.title || 'Click to expand', content: block.content || 'Accordion content...' }];
 return (
 <div className="my-6 md:my-8 space-y-2">
 {accordionItems.map((item, idx) => {
 const isExpanded = expandedItems[item.id] !== false;
 return (
 <div key={item.id || idx} className="border border-white/10 rounded-lg md:rounded-xl overflow-hidden">
 <div 
 className="bg-white/5 p-4 md:p-5 flex items-center justify-between cursor-pointer hover:bg-white/10"
 onClick={() => toggleAccordion(item.id)}
 >
 <span className="text-white font-bold text-sm md:text-base">{item.title || 'Click to expand'}</span>
 <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
 </div>
 {isExpanded && (
 <div className="p-4 md:p-5 text-white/70 text-sm md:text-base bg-black/20">
 {item.content || 'Accordion content...'}
 </div>
 )}
 </div>
 );
 })}
 </div>
 );

 case 'icon':
 const iconMap = { star: Star, heart: Heart, check: CheckCircle, flag: Flag, award: Award, zap: Zap, shield: Shield, target: Target };
 const IconComponent = iconMap[block.iconName] || Star;
 const iconContent = (
 <IconComponent
 size={block.iconSize || 48}
 style={{ color: block.iconColor || '#FFD700' }}
 />
 );
 if (block.url) {
 return <div className="my-6 md:my-8 flex justify-center"><a href={block.url} className="hover:scale-110 transition-transform">{iconContent}</a></div>;
 }
 return <div className="my-6 md:my-8 flex justify-center">{iconContent}</div>;

 case 'social':
 return (
 <div className="my-6 md:my-8 flex justify-center gap-4 md:gap-6">
 {block.facebook && (
 <a href={block.facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
 <Facebook className="w-6 h-6 md:w-7 md:h-7 text-blue-500" />
 </a>
 )}
 {block.twitter && (
 <a href={block.twitter} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
 <Twitter className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
 </a>
 )}
 {block.instagram && (
 <a href={block.instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
 <Instagram className="w-6 h-6 md:w-7 md:h-7 text-pink-500" />
 </a>
 )}
 {block.youtube && (
 <a href={block.youtube} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
 <Youtube className="w-6 h-6 md:w-7 md:h-7 text-red-500" />
 </a>
 )}
 </div>
 );

 case 'videoEmbed':
 let embedSrc = block.videoUrl || '';
 // Convert YouTube URL to embed URL
 if (block.videoType === 'youtube' && embedSrc.includes('youtube.com/watch')) {
 const videoId = embedSrc.split('v=')[1]?.split('&')[0];
 embedSrc = `https://www.youtube.com/embed/${videoId}`;
 }
 // Convert Vimeo URL to embed URL
 if (block.videoType === 'vimeo' && embedSrc.includes('vimeo.com/')) {
 const videoId = embedSrc.split('vimeo.com/')[1];
 embedSrc = `https://player.vimeo.com/video/${videoId}`;
 }
 return (
 <div className="my-6 md:my-8 aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
 {embedSrc ? (
 <iframe
 src={embedSrc}
 className="w-full h-full"
 title="Video"
 frameBorder="0"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-white/30">
 <div className="text-center">
 <Video className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 opacity-50" />
 <p className="text-sm">Video not available</p>
 </div>
 </div>
 )}
 </div>
 );

 case 'spacer':
 return <div style={{ height: block.height || 40 }} className="my-4" />;

 case 'columns2':
 const col2LeftW = block.leftWidth || 50;
 const col2RightW = 100 - col2LeftW;
 return (
 <div className="grid gap-4 md:gap-6 my-8" style={{ gridTemplateColumns: `${col2LeftW}% ${col2RightW}%` }}>
 <div className="p-2 md:p-4 bg-white/5 rounded-lg md:rounded-xl">
 {(block.leftBlocks || []).length > 0 ? (
 <div className="space-y-2">
 {block.leftBlocks.map((b, i) => <LayoutBlock key={b.id || i} block={b} />)}
 </div>
 ) : (
 <p className="text-white/30 text-center text-sm">Left Column</p>
 )}
 </div>
 <div className="p-2 md:p-4 bg-white/5 rounded-lg md:rounded-xl">
 {(block.rightBlocks || []).length > 0 ? (
 <div className="space-y-2">
 {block.rightBlocks.map((b, i) => <LayoutBlock key={b.id || i} block={b} />)}
 </div>
 ) : (
 <p className="text-white/30 text-center text-sm">Right Column</p>
 )}
 </div>
 </div>
 );

 case 'columns3':
 const col3LeftW = block.leftWidth || 33;
 const col3MiddleW = block.middleWidth || 33;
 const col3RightW = 100 - col3LeftW - col3MiddleW;
 return (
 <div className="grid gap-4 md:gap-6 my-8" style={{ gridTemplateColumns: `${col3LeftW}% ${col3MiddleW}% ${col3RightW}%` }}>
 <div className="p-2 md:p-4 bg-white/5 rounded-lg md:rounded-xl">
 {(block.leftBlocks || []).length > 0 ? (
 <div className="space-y-2">
 {block.leftBlocks.map((b, i) => <LayoutBlock key={b.id || i} block={b} />)}
 </div>
 ) : (
 <p className="text-white/30 text-center text-sm">Left Column</p>
 )}
 </div>
 <div className="p-2 md:p-4 bg-white/5 rounded-lg md:rounded-xl">
 {(block.middleBlocks || []).length > 0 ? (
 <div className="space-y-2">
 {block.middleBlocks.map((b, i) => <LayoutBlock key={b.id || i} block={b} />)}
 </div>
 ) : (
 <p className="text-white/30 text-center text-sm">Middle Column</p>
 )}
 </div>
 <div className="p-2 md:p-4 bg-white/5 rounded-lg md:rounded-xl">
 {(block.rightBlocks || []).length > 0 ? (
 <div className="space-y-2">
 {block.rightBlocks.map((b, i) => <LayoutBlock key={b.id || i} block={b} />)}
 </div>
 ) : (
 <p className="text-white/30 text-center text-sm">Right Column</p>
 )}
 </div>
 </div>
 );

 default:
 return null;
 }
};

const BlogPost = () => {
 const { slug } = useParams();
 const navigate = useNavigate();
 const [blog, setBlog] = useState(null);
 const [loading, setLoading] = useState(true);
 const [relatedBlogs, setRelatedBlogs] = useState([]);

 useEffect(() => {
 fetchBlog();
 window.scrollTo(0, 0);
 }, [slug]);

 const fetchBlog = async () => {
 try {
 setLoading(true);
 const res = await axios.get(`${API_URL}/api/v1/blogs/${slug}`);
 setBlog(res.data.data);

 // Fetch related blogs from same category
 const relatedRes = await axios.get(`${API_URL}/api/v1/blogs`, {
 params: { category: res.data.data.category, limit: 3 }
 });
 setRelatedBlogs(relatedRes.data.data.filter(b => b.slug !== slug));

 setLoading(false);
 } catch (error) {
 console.error('Error fetching blog:', error);
 setLoading(false);
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-black flex items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 if (!blog) {
 return (
 <div className="min-h-screen bg-black flex flex-col items-center justify-center">
 <h1 className="text-4xl font-black uppercase tracking-tighter mb-6">Article Not Found</h1>
 <button onClick={() => navigate('/blog')} className="text-primary font-black uppercase tracking-widest text-sm flex items-center gap-2">
 <ChevronLeft className="w-5 h-5" />
 Back to Blog
 </button>
 </div>
 );
 }

 // Check if blog has layout data
 const hasLayout = blog.layout && Array.isArray(blog.layout) && blog.layout.length > 0;

 // Extract TOC items from layout if present
 const tocBlock = hasLayout ? blog.layout.find(b => b.type === 'toc') : null;

 // Calculate reading time based on content
 const calculateReadingTime = () => {
 if (!blog.content) return 5;
 const words = blog.content.split(/\s+/).length;
 return Math.max(1, Math.ceil(words / 200));
 };

 // Share handlers
 const shareToFacebook = () => {
 window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank');
 };
 const shareToTwitter = () => {
 window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`, '_blank');
 };
 const shareToLinkedIn = () => {
 window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank');
 };
 const copyLink = () => {
 navigator.clipboard.writeText(window.location.href);
 };

 return (
 <div className="min-h-screen bg-black text-white font-['Outfit'] selection:bg-primary/30 pb-24">
 {/* Hero Header */}
 <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
 <img
 src={getImageUrl(blog.image)}
 alt={blog.title}
 className="w-full h-full object-cover"
 />
 {/* Gradient Overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>

 {/* Content */}
 <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
 <div className="max-w-5xl mx-auto">
 {/* Category & Breadcrumb */}
 <div className="flex items-center gap-3 mb-6">
 <Link to="/blog" className="text-primary font-bold uppercase tracking-wider text-sm hover:underline">
 Blog
 </Link>
 <span className="text-white/30">/</span>
 <span className="text-white/60 font-medium uppercase tracking-wider text-sm">{blog.category}</span>
 </div>

 {/* Title */}
 <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-8 text-white">
 {blog.title}
 </h1>

 {/* Author Info Row */}
 <div className="flex flex-wrap items-center gap-8">
 {/* Author */}
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
 <User className="w-6 h-6 text-primary" />
 </div>
 <div>
 <p className="text-white font-bold">{blog.author}</p>
 <p className="text-white/40 text-sm">Author</p>
 </div>
 </div>

 {/* Date */}
 <div className="flex items-center gap-2 text-white/60">
 <Calendar className="w-4 h-4" />
 <span className="text-sm font-medium">
 {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
 </span>
 </div>

 {/* Reading Time */}
 <div className="flex items-center gap-2 text-white/60">
 <Clock className="w-4 h-4" />
 <span className="text-sm font-medium">{calculateReadingTime()} min read</span>
 </div>

 {/* Views */}
 <div className="flex items-center gap-2 text-white/60">
 <Eye className="w-4 h-4" />
 <span className="text-sm font-medium">{blog.views.toLocaleString()} views</span>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Content Area - Three Column Layout */}
 <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
 <div className="flex flex-col xl:flex-row gap-8">

 {/* Left Sidebar - Table of Contents (Sticky) */}
 {tocBlock && (
 <aside className="hidden xl:block w-64 flex-shrink-0">
 <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6">
 <div className="flex items-center gap-2 mb-4">
 <BookOpen className="w-4 h-4 text-primary" />
 <h4 className="text-xs font-black uppercase tracking-widest text-white/60">Contents</h4>
 </div>
 <ul className="space-y-2">
 {tocBlock.content.split('\n').filter(i => i.trim()).map((item, i) => (
 <li key={i}>
 <a href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-white/50 hover:text-primary text-sm transition-colors block py-1">
 {item}
 </a>
 </li>
 ))}
 </ul>
 </div>
 </aside>
 )}

 {/* Main Content */}
 <article className="flex-1 bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-40 -mt-40"></div>

 {hasLayout ? (
 // Render layout blocks
 <div className="relative z-10">
 {blog.layout.map((block, index) => (
 <LayoutBlock key={block.id || index} block={block} />
 ))}
 </div>
 ) : (
 // Fallback to HTML content
 <div
 className="prose prose-invert prose-primary max-w-none relative z-10
 prose-headings:font-black prose-headings: prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-white
 prose-p:text-white/70 prose-p:text-xl prose-p:leading-relaxed prose-p:font-medium
 prose-strong:text-white prose-strong:font-black
 prose-a:text-primary prose-a:font-black prose-a:no-underline hover:prose-a:bg-primary/10 transition-all px-1 rounded
 prose-img:rounded-[40px] prose-img:border prose-img:border-primary/20 prose-img:shadow-2xl prose-img:mx-auto
 prose-li:text-white/60 prose-li:font-medium"
 dangerouslySetInnerHTML={{ __html: blog.content }}
 />
 )}

 <div className="mt-16 pt-12 border-t border-white/5 flex flex-wrap items-center justify-between gap-8">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
 <User className="w-6 h-6" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Written by</p>
 <p className="font-black uppercase tracking-tight">{blog.author}</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-white/40 text-sm font-medium mr-2">Share:</span>
 <button onClick={shareToFacebook} className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 flex items-center justify-center transition-colors">
 <Facebook className="w-4 h-4 text-white/60 hover:text-primary" />
 </button>
 <button onClick={shareToTwitter} className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 flex items-center justify-center transition-colors">
 <Twitter className="w-4 h-4 text-white/60 hover:text-primary" />
 </button>
 <button onClick={shareToLinkedIn} className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 flex items-center justify-center transition-colors">
 <Linkedin className="w-4 h-4 text-white/60 hover:text-primary" />
 </button>
 <button onClick={copyLink} className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 flex items-center justify-center transition-colors">
 <LinkIcon className="w-4 h-4 text-white/60 hover:text-primary" />
 </button>
 </div>
 </div>
 </article>

 {/* Right Sidebar */}
 <aside className="w-full xl:w-80 flex-shrink-0 space-y-8">
 {/* Promotion */}
 <div className="bg-primary rounded-2xl p-8 text-center relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-6 opacity-10 -rotate-12 transition-transform group-hover:scale-125">
 <Trophy className="w-20 h-20" />
 </div>
 <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 relative z-10">Need a Boost?</h4>
 <p className="text-white/80 font-bold mb-6 relative z-10">Fastest and safest way to level up your game.</p>
 <Link to="/" className="block bg-white text-black py-3 rounded-xl font-black uppercase tracking-widest text-xs relative z-10 hover:scale-105 transition-all">
 Get Started
 </Link>
 </div>

 {/* Related Posts */}
 {relatedBlogs.length > 0 && (
 <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
 <h3 className="text-xs font-black uppercase tracking-widest text-white/60 mb-6 flex items-center gap-2">
 <Star className="w-4 h-4 text-primary" />
 Related Guides
 </h3>
 <div className="space-y-4">
 {relatedBlogs.map(rel => (
 <Link
 key={rel._id}
 to={`/blog/${rel.slug}`}
 className="group flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-all"
 >
 <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
 <img src={getImageUrl(rel.image)} alt={rel.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
 </div>
 <div className="flex-1 py-1">
 <h5 className="text-sm font-bold text-white/80 group-hover:text-primary transition-colors line-clamp-2">{rel.title}</h5>
 </div>
 </Link>
 ))}
 </div>
 </div>
 )}
 </aside>
 </div>
 </div>
 </div>
 );
};

export default BlogPost;

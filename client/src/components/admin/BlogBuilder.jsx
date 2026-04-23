import React, { useState, useCallback, useRef } from 'react';
import {
 Type,
 Image as ImageIcon,
 Video,
 Quote,
 Code,
 AlignLeft,
 Heading1,
 Heading2,
 Heading3,
 GripVertical,
 Trash2,
 Copy,
 Settings,
 Eye,
 Plus,
 X,
 Upload,
 Play,
 Link as LinkIcon,
 List,
 ListOrdered,
 Minus,
 Star,
 MessageSquare,
 AlertCircle,
 Monitor,
 Columns,
 PanelLeft,
 ArrowRight,
 Move,
 BookOpen,
 Table,
 Info,
 CheckCircle,
 ArrowDown
} from 'lucide-react';

// Available block types
const BLOCK_TYPES = [
 { type: 'heading1', icon: Heading1, label: 'H1 Heading', defaultContent: 'Main Heading' },
 { type: 'heading2', icon: Heading2, label: 'H2 Heading', defaultContent: 'Section Heading' },
 { type: 'heading3', icon: Heading3, label: 'H3 Heading', defaultContent: 'Subsection' },
 { type: 'paragraph', icon: Type, label: 'Paragraph', defaultContent: 'Write your content here...' },
 { type: 'image', icon: ImageIcon, label: 'Image', defaultContent: '', src: '' },
 { type: 'video', icon: Video, label: 'Video Embed', defaultContent: '', src: '' },
 { type: 'quote', icon: Quote, label: 'Quote', defaultContent: 'Enter quote text...' },
 { type: 'code', icon: Code, label: 'Code Block', defaultContent: '// Your code here' },
 { type: 'divider', icon: Minus, label: 'Divider', defaultContent: '' },
 { type: 'alert', icon: AlertCircle, label: 'Alert Box', defaultContent: 'Important information here...' },
 { type: 'list', icon: List, label: 'Bullet List', defaultContent: 'Item 1\nItem 2\nItem 3' },
 { type: 'orderedList', icon: ListOrdered, label: 'Numbered List', defaultContent: 'First item\nSecond item\nThird item' },
 { type: 'callout', icon: Star, label: 'Callout Box', defaultContent: 'Callout message...' },
 { type: 'toc', icon: BookOpen, label: 'Table of Contents', defaultContent: 'Introduction\nGetting Started\nAdvanced Tips\nConclusion' },
 { type: 'infoBox', icon: Info, label: 'Info Box', defaultContent: 'Additional information here...' },
 { type: 'checklist', icon: CheckCircle, label: 'Checklist', defaultContent: 'Item 1\nItem 2\nItem 3' },
 { type: 'table', icon: Table, label: 'Table', defaultContent: 'Header 1|Header 2|Header 3\nRow 1 Col 1|Row 1 Col 2|Row 1 Col 3\nRow 2 Col 1|Row 2 Col 2|Row 2 Col 3' },
 { type: 'columns', icon: Columns, label: '2 Columns (Side by Side)', leftContent: '', rightContent: '', columnWidths: [50, 50] },
 { type: 'columns2', icon: Columns, label: '2 Columns (Nested)', leftBlocks: [], rightBlocks: [], leftWidth: 50 },
 { type: 'columns3', icon: Columns, label: '3 Columns', leftBlocks: [], middleBlocks: [], rightBlocks: [], leftWidth: 33, middleWidth: 33 },
];

// Generate unique ID
const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Block Editor Component
const BlockEditor = ({ block, onUpdate, onDelete, isSelected, onSelect }) => {
 const [isEditing, setIsEditing] = useState(false);

 const handleContentChange = (e) => {
 onUpdate({ ...block, content: e.target.value });
 };

 const handleSrcChange = (e) => {
 onUpdate({ ...block, src: e.target.value });
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

 const renderEditor = () => {
 switch (block.type) {
 case 'heading1':
 case 'heading2':
 case 'heading3':
 return (
 <input
 type="text"
 value={block.content}
 onChange={handleContentChange}
 className="w-full bg-transparent border-none focus:outline-none text-white"
 style={{ 
 fontSize: block.type === 'heading1' ? '2.5rem' : block.type === 'heading2' ? '1.75rem' : '1.25rem',
 fontWeight: '900',
 fontStyle: '',
 textTransform: 'uppercase'
 }}
 placeholder="Enter heading..."
 />
 );

 case 'paragraph':
 return (
 <textarea
 value={block.content}
 onChange={handleContentChange}
 rows={4}
 className="w-full bg-transparent border-none focus:outline-none text-white/80 text-lg leading-relaxed resize-none"
 placeholder="Write your paragraph..."
 />
 );

 case 'image':
 return (
 <div className="space-y-3">
 <input
 type="text"
 value={block.src || ''}
 onChange={handleSrcChange}
 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
 placeholder="Image URL or upload below..."
 />
 <label className="block cursor-pointer">
 <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
 <Upload className="w-6 h-6 mx-auto mb-2 text-white/40" />
 <span className="text-white/40 text-sm">Click to upload image</span>
 <input type="file" accept="image/*" className="hidden" />
 </div>
 </label>
 {block.src && (
 <input
 type="text"
 value={block.alt || ''}
 onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
 placeholder="Alt text for image..."
 />
 )}
 </div>
 );

 case 'video':
 return (
 <div className="space-y-3">
 <input
 type="text"
 value={block.src || ''}
 onChange={handleSrcChange}
 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
 placeholder="YouTube/Vimeo URL or video URL..."
 />
 <input
 type="text"
 value={block.caption || ''}
 onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
 placeholder="Video caption (optional)..."
 />
 </div>
 );

 case 'quote':
 return (
 <div className="space-y-3">
 <textarea
 value={block.content}
 onChange={handleContentChange}
 rows={3}
 className="w-full bg-transparent border-none focus:outline-none text-white/90 text-lg "
 placeholder="Enter quote..."
 />
 <input
 type="text"
 value={block.author || ''}
 onChange={(e) => onUpdate({ ...block, author: e.target.value })}
 className="w-full bg-transparent border-none focus:outline-none text-white/50 text-sm"
 placeholder="Quote author..."
 />
 </div>
 );

 case 'code':
 return (
 <textarea
 value={block.content}
 onChange={handleContentChange}
 rows={6}
 className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-green-400 font-mono text-sm"
 placeholder="// Your code here..."
 />
 );

 case 'alert':
 return (
 <div className="space-y-3">
 <select
 value={block.alertType || 'info'}
 onChange={(e) => onUpdate({ ...block, alertType: e.target.value })}
 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
 >
 <option value="info">Info</option>
 <option value="warning">Warning</option>
 <option value="success">Success</option>
 <option value="error">Error</option>
 </select>
 <textarea
 value={block.content}
 onChange={handleContentChange}
 rows={2}
 className="w-full bg-transparent border-none focus:outline-none text-white"
 placeholder="Alert message..."
 />
 </div>
 );

 case 'list':
 case 'orderedList':
 return (
 <textarea
 value={block.content}
 onChange={handleContentChange}
 rows={4}
 className="w-full bg-transparent border-none focus:outline-none text-white/80"
 placeholder="Enter items (one per line)..."
 />
 );

 case 'callout':
 return (
 <div className="space-y-3">
 <select
 value={block.calloutType || 'highlight'}
 onChange={(e) => onUpdate({ ...block, calloutType: e.target.value })}
 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
 >
 <option value="highlight">Highlight (Primary)</option>
 <option value="tip">Tip</option>
 <option value="note">Note</option>
 </select>
 <textarea
 value={block.content}
 onChange={handleContentChange}
 rows={2}
 className="w-full bg-transparent border-none focus:outline-none text-white"
 placeholder="Callout message..."
 />
 </div>
 );

 case 'divider':
 return (
 <p className="text-white/30 text-sm">Divider block - adds a horizontal line</p>
 );

 default:
 return null;
 }
 };

 const renderPreview = () => {
 switch (block.type) {
 case 'heading1':
 return <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{block.content}</h1>;
 case 'heading2':
 return <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{block.content}</h2>;
 case 'heading3':
 return <h3 className="text-xl font-black uppercase">{block.content}</h3>;
 case 'paragraph':
 return <p className="text-white/70 text-lg leading-relaxed">{block.content}</p>;
 case 'image':
 return block.src ? (
 <figure className="my-4">
 <img src={block.src} alt={block.alt || ''} className="w-full rounded-2xl border border-white/10" />
 {block.caption && <figcaption className="text-white/40 text-center mt-2 text-sm">{block.caption}</figcaption>}
 </figure>
 ) : (
 <div className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center">
 <ImageIcon className="w-8 h-8 text-white/20" />
 </div>
 );
 case 'video':
 return block.src ? (
 <div className="my-4 rounded-2xl overflow-hidden aspect-video bg-black">
 {block.src.includes('youtube') || block.src.includes('youtu.be') ? (
 <iframe src={block.src.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title="YouTube video" />
 ) : (
 <video src={block.src} controls className="w-full h-full object-cover" />
 )}
 </div>
 ) : (
 <div className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center">
 <Play className="w-8 h-8 text-white/20" />
 </div>
 );
 case 'quote':
 return (
 <blockquote className="border-l-4 border-primary pl-4 my-4">
 <p className="text-xl font-black text-white/90 mb-1">"{block.content}"</p>
 {block.author && <cite className="text-primary text-xs font-black uppercase tracking-widest">— {block.author}</cite>}
 </blockquote>
 );
 case 'code':
 return (
 <pre className="bg-black/50 border border-white/10 rounded-xl p-4 overflow-x-auto my-4">
 <code className="text-green-400 font-mono text-sm">{block.content}</code>
 </pre>
 );
 case 'divider':
 return <hr className="border-white/10 my-6" />;
 case 'alert':
 return (
 <div className={`border rounded-xl p-4 my-4 ${getAlertStyles(block.alertType)}`}>
 <div className="flex items-start gap-2">
 <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
 <p className="text-sm">{block.content}</p>
 </div>
 </div>
 );
 case 'list':
 const items = block.content.split('\n').filter(i => i.trim());
 return (
 <ul className="list-disc list-inside space-y-1 my-4 text-white/70 text-base">
 {items.map((item, i) => <li key={i}>{item}</li>)}
 </ul>
 );
 case 'orderedList':
 const orderedItems = block.content.split('\n').filter(i => i.trim());
 return (
 <ol className="list-decimal list-inside space-y-1 my-4 text-white/70 text-base">
 {orderedItems.map((item, i) => <li key={i}>{item}</li>)}
 </ol>
 );
 case 'callout':
 return (
 <div className={`border rounded-xl p-4 my-4 ${getCalloutStyles(block.calloutType)}`}>
 <p className="text-white text-base">{block.content}</p>
 </div>
 );

 case 'columns':
 return (
 <div className="space-y-4">
 <div className="flex items-center gap-4 mb-4">
 <label className="text-white/60 text-sm font-medium">Left Width:</label>
 <input
 type="range"
 min="20"
 max="80"
 value={block.columnWidths?.[0] || 50}
 onChange={(e) => onUpdate({ ...block, columnWidths: [parseInt(e.target.value), 100 - parseInt(e.target.value)] })}
 className="flex-1"
 />
 <span className="text-white text-sm font-bold w-12">{block.columnWidths?.[0] || 50}%</span>
 </div>
 <textarea
 value={block.leftContent || ''}
 onChange={(e) => onUpdate({ ...block, leftContent: e.target.value })}
 rows={3}
 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm"
 placeholder="Left column content..."
 />
 <textarea
 value={block.rightContent || ''}
 onChange={(e) => onUpdate({ ...block, rightContent: e.target.value })}
 rows={3}
 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm"
 placeholder="Right column content..."
 />
 </div>
 );

 case 'columns2':
 case 'columns3':
 return (
 <div className="space-y-3">
 <p className="text-white/50 text-sm">Nested columns with blocks - configure in advanced mode</p>
 <div className="grid gap-2" style={{ gridTemplateColumns: block.type === 'columns3' ? '1fr 1fr 1fr' : '1fr 1fr' }}>
 <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
 <p className="text-white/40 text-xs">Column 1</p>
 </div>
 <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
 <p className="text-white/40 text-xs">Column 2</p>
 </div>
 {block.type === 'columns3' && (
 <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
 <p className="text-white/40 text-xs">Column 3</p>
 </div>
 )}
 </div>
 </div>
 );

 default:
 return null;
 }
 };

 return (
 <div 
 onClick={onSelect}
 className={`group relative bg-white/[0.02] border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-primary/50 bg-primary/5' : 'border-white/5 hover:border-white/20'}`}
 >
 {/* Block Actions */}
 <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
 <button
 onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
 className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
 title={isEditing ? 'Preview' : 'Edit'}
 >
 {isEditing ? <Eye className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
 </button>
 <button
 onClick={(e) => { e.stopPropagation(); onDelete(); }}
 className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors"
 title="Delete block"
 >
 <Trash2 className="w-3 h-3" />
 </button>
 </div>

 {/* Drag Handle */}
 <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 opacity-0 group-hover:opacity-100 cursor-grab">
 <GripVertical className="w-4 h-4 text-white/30" />
 </div>

 {/* Block Type Badge */}
 <div className="absolute top-2 left-3 text-white/20 text-[8px] font-black uppercase tracking-widest">
 {block.type}
 </div>

 {/* Content */}
 <div className="p-4 pt-8">
 {isEditing ? renderEditor() : renderPreview()}
 </div>
 </div>
 );
};

// Main Blog Builder Component - Side by Side Layout
const BlogBuilder = ({ value, onChange, blogTitle, blogImage }) => {
 const [blocks, setBlocks] = useState(value || []);
 const [draggedIndex, setDraggedIndex] = useState(null);
 const [showBlockMenu, setShowBlockMenu] = useState(false);
 const [selectedBlockId, setSelectedBlockId] = useState(null);
 const [activeTab, setActiveTab] = useState('blocks'); // 'blocks' or 'preview'
 const previewRef = useRef(null);

 // Add new block
 const addBlock = (blockType) => {
 const newBlock = {
 id: generateId(),
 type: blockType.type,
 content: blockType.defaultContent,
 src: blockType.src || '',
 alt: '',
 caption: '',
 author: '',
 alertType: 'info',
 calloutType: 'highlight',
 styles: {}
 };
 const newBlocks = [...blocks, newBlock];
 setBlocks(newBlocks);
 onChange(newBlocks);
 setShowBlockMenu(false);
 setSelectedBlockId(newBlock.id);
 };

 // Update block
 const updateBlock = (id, updatedBlock) => {
 const newBlocks = blocks.map(b => b.id === id ? updatedBlock : b);
 setBlocks(newBlocks);
 onChange(newBlocks);
 };

 // Delete block
 const deleteBlock = (id) => {
 const newBlocks = blocks.filter(b => b.id !== id);
 setBlocks(newBlocks);
 onChange(newBlocks);
 if (selectedBlockId === id) setSelectedBlockId(null);
 };

 // Drag and drop handlers
 const handleDragStart = (e, index) => {
 setDraggedIndex(index);
 e.dataTransfer.effectAllowed = 'move';
 };

 const handleDragOver = (e, index) => {
 e.preventDefault();
 e.dataTransfer.dropEffect = 'move';
 };

 const handleDrop = (e, dropIndex) => {
 e.preventDefault();
 if (draggedIndex === null || draggedIndex === dropIndex) return;

 const newBlocks = [...blocks];
 const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
 newBlocks.splice(dropIndex, 0, draggedBlock);
 setBlocks(newBlocks);
 onChange(newBlocks);
 setDraggedIndex(null);
 };

 const handleDragEnd = () => {
 setDraggedIndex(null);
 };

 // Render preview content
 const renderPreviewContent = () => {
 if (blocks.length === 0) {
 return (
 <div className="text-center py-16 text-white/30">
 <p className="text-lg font-bold">No content yet</p>
 <p className="text-sm">Add blocks from the left panel</p>
 </div>
 );
 }

 return blocks.map((block, index) => {
 switch (block.type) {
 case 'heading1':
 return <h1 key={index} className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 mt-8">{block.content}</h1>;
 case 'heading2':
 return <h2 key={index} className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 mt-6">{block.content}</h2>;
 case 'heading3':
 return <h3 key={index} className="text-xl font-black uppercase mb-3 mt-4">{block.content}</h3>;
 case 'paragraph':
 return <p key={index} className="text-white/70 text-lg leading-relaxed mb-4">{block.content}</p>;
 case 'image':
 return block.src ? (
 <figure key={index} className="my-6">
 <img src={block.src} alt={block.alt || ''} className="w-full rounded-2xl border border-white/10 shadow-lg" />
 {block.caption && <figcaption className="text-white/40 text-center mt-2 text-sm">{block.caption}</figcaption>}
 </figure>
 ) : null;
 case 'video':
 return block.src ? (
 <div key={index} className="my-6 rounded-2xl overflow-hidden aspect-video bg-black">
 {block.src.includes('youtube') || block.src.includes('youtu.be') ? (
 <iframe src={block.src.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title="Video" />
 ) : (
 <video src={block.src} controls className="w-full h-full object-cover" />
 )}
 </div>
 ) : null;
 case 'quote':
 return (
 <blockquote key={index} className="border-l-4 border-primary pl-6 my-6 py-2">
 <p className="text-xl font-black text-white/90 mb-2">"{block.content}"</p>
 {block.author && <cite className="text-primary text-sm font-black uppercase tracking-widest">— {block.author}</cite>}
 </blockquote>
 );
 case 'code':
 return (
 <pre key={index} className="bg-black/50 border border-white/10 rounded-xl p-4 overflow-x-auto my-4">
 <code className="text-green-400 font-mono text-sm">{block.content}</code>
 </pre>
 );
 case 'divider':
 return <hr key={index} className="border-white/10 my-8" />;
 case 'alert':
 const alertStyles = {
 warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
 success: 'bg-green-500/10 border-green-500/30 text-green-500',
 error: 'bg-red-500/10 border-red-500/30 text-red-500',
 info: 'bg-blue-500/10 border-blue-500/30 text-blue-500'
 };
 return (
 <div key={index} className={`border rounded-xl p-4 my-4 ${alertStyles[block.alertType] || alertStyles.info}`}>
 <p className="text-sm">{block.content}</p>
 </div>
 );
 case 'list':
 const items = block.content.split('\n').filter(i => i.trim());
 return (
 <ul key={index} className="list-disc list-inside space-y-2 my-4 text-white/70">
 {items.map((item, i) => <li key={i}>{item}</li>)}
 </ul>
 );
 case 'orderedList':
 const orderedItems = block.content.split('\n').filter(i => i.trim());
 return (
 <ol key={index} className="list-decimal list-inside space-y-2 my-4 text-white/70">
 {orderedItems.map((item, i) => <li key={i}>{item}</li>)}
 </ol>
 );
 case 'callout':
 const calloutStyles = {
 tip: 'bg-purple-500/10 border-purple-500/30',
 note: 'bg-gray-500/10 border-gray-500/30',
 highlight: 'bg-primary/10 border-primary/30'
 };
 return (
 <div key={index} className={`border rounded-xl p-4 my-4 ${calloutStyles[block.calloutType] || calloutStyles.highlight}`}>
 <p className="text-white">{block.content}</p>
 </div>
 );
 case 'toc':
 const tocItems = block.content.split('\n').filter(i => i.trim());
 return (
 <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6 my-6">
 <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Table of Contents</h4>
 <ul className="space-y-2">
 {tocItems.map((item, i) => (
 <li key={i} className="text-white/60 text-sm hover:text-primary cursor-pointer transition-colors">{item}</li>
 ))}
 </ul>
 </div>
 );
 case 'infoBox':
 return (
 <div key={index} className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 my-6">
 <div className="flex items-start gap-3">
 <Info className="w-5 h-5 text-blue-500 mt-0.5" />
 <div>
 <h5 className="text-blue-400 font-black uppercase text-sm mb-2">{block.title || 'Info'}</h5>
 <p className="text-white/70 text-sm">{block.content}</p>
 </div>
 </div>
 </div>
 );
 case 'checklist':
 const checkItems = block.content.split('\n').filter(i => i.trim());
 return (
 <div key={index} className="my-6">
 {checkItems.map((item, i) => (
 <div key={i} className="flex items-center gap-3 py-2">
 <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center">
 <CheckCircle className="w-3 h-3 text-primary" />
 </div>
 <span className="text-white/70">{item}</span>
 </div>
 ))}
 </div>
 );
 case 'table':
 const tableRows = block.content.split('\n').filter(row => row.trim());
 return (
 <div key={index} className="overflow-x-auto my-6">
 <table className="w-full border border-white/10 rounded-xl overflow-hidden">
 <thead>
 <tr className="bg-white/5">
 {tableRows[0]?.split('|').map((header, i) => (
 <th key={i} className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-white/60 border-b border-white/10">{header.trim()}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {tableRows.slice(1).map((row, rowIndex) => (
 <tr key={rowIndex} className="border-b border-white/5">
 {row.split('|').map((cell, cellIndex) => (
 <td key={cellIndex} className="px-4 py-3 text-sm text-white/70">{cell.trim()}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
 case 'columns':
 const leftW = block.columnWidths?.[0] || 50;
 const rightW = block.columnWidths?.[1] || 50;
 return (
 <div key={index} className="grid gap-4 my-6" style={{ gridTemplateColumns: `${leftW}% ${rightW}%` }}>
 <div className="p-4 bg-white/5 rounded-xl border border-white/10">
 <p className="text-white/80 text-sm">{block.leftContent || 'Left column content...'}</p>
 </div>
 <div className="p-4 bg-white/5 rounded-xl border border-white/10">
 <p className="text-white/80 text-sm">{block.rightContent || 'Right column content...'}</p>
 </div>
 </div>
 );
 case 'columns2':
 const col2LeftW = block.leftWidth || 50;
 const col2RightW = 100 - col2LeftW;
 return (
 <div key={index} className="grid gap-4 my-6" style={{ gridTemplateColumns: `${col2LeftW}% ${col2RightW}%` }}>
 <div className="p-4 bg-white/5 rounded-xl border border-white/10">
 <p className="text-white/40 text-xs text-center">Left Column - {col2LeftW}%</p>
 <p className="text-white/30 text-xs text-center mt-2">Use nested blocks</p>
 </div>
 <div className="p-4 bg-white/5 rounded-xl border border-white/10">
 <p className="text-white/40 text-xs text-center">Right Column - {col2RightW}%</p>
 <p className="text-white/30 text-xs text-center mt-2">Use nested blocks</p>
 </div>
 </div>
 );
 case 'columns3':
 const col3LeftW = block.leftWidth || 33;
 const col3MiddleW = block.middleWidth || 33;
 const col3RightW = 100 - col3LeftW - col3MiddleW;
 return (
 <div key={index} className="grid gap-4 my-6" style={{ gridTemplateColumns: `${col3LeftW}% ${col3MiddleW}% ${col3RightW}%` }}>
 <div className="p-4 bg-white/5 rounded-xl border border-white/10">
 <p className="text-white/40 text-xs text-center">Left - {col3LeftW}%</p>
 </div>
 <div className="p-4 bg-white/5 rounded-xl border border-white/10">
 <p className="text-white/40 text-xs text-center">Middle - {col3MiddleW}%</p>
 </div>
 <div className="p-4 bg-white/5 rounded-xl border border-white/10">
 <p className="text-white/40 text-xs text-center">Right - {col3RightW}%</p>
 </div>
 </div>
 );
 default:
 return null;
 }
 });
 };

 return (
 <div className="flex h-[600px] border border-white/10 rounded-2xl overflow-hidden">
 {/* Left Panel - Block Options */}
 <div className="w-72 bg-[#0A0A0A] border-r border-white/10 flex flex-col">
 {/* Tabs */}
 <div className="flex border-b border-white/10">
 <button
 onClick={() => setActiveTab('blocks')}
 className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'blocks' ? 'text-primary bg-primary/10' : 'text-white/40 hover:text-white'}`}
 >
 <PanelLeft className="w-4 h-4 mx-auto mb-1" />
 Blocks
 </button>
 <button
 onClick={() => setActiveTab('preview')}
 className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'preview' ? 'text-primary bg-primary/10' : 'text-white/40 hover:text-white'}`}
 >
 <Monitor className="w-4 h-4 mx-auto mb-1" />
 Preview
 </button>
 </div>

 {activeTab === 'blocks' ? (
 <>
 {/* Add Block Button */}
 <div className="p-3 border-b border-white/10">
 <button
 onClick={() => setShowBlockMenu(!showBlockMenu)}
 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all"
 >
 <Plus className="w-4 h-4" />
 Add Block
 </button>

 {/* Block Type Menu */}
 {showBlockMenu && (
 <div className="absolute left-4 top-[180px] w-64 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto">
 <div className="p-2">
 {BLOCK_TYPES.map((blockType) => {
 const Icon = blockType.icon;
 return (
 <button
 key={blockType.type}
 onClick={() => addBlock(blockType)}
 className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all text-left"
 >
 <Icon className="w-4 h-4 text-primary" />
 <span className="text-sm font-bold">{blockType.label}</span>
 </button>
 );
 })}
 </div>
 </div>
 )}
 </div>

 {/* Block List */}
 <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
 {blocks.length === 0 ? (
 <div className="text-center py-8">
 <p className="text-white/30 text-sm">No blocks added</p>
 <p className="text-white/20 text-xs mt-1">Click "Add Block" to start</p>
 </div>
 ) : (
 blocks.map((block, index) => (
 <div
 key={block.id}
 draggable
 onDragStart={(e) => handleDragStart(e, index)}
 onDragOver={(e) => handleDragOver(e, index)}
 onDrop={(e) => handleDrop(e, index)}
 onDragEnd={handleDragEnd}
 className={`transition-all ${draggedIndex === index ? 'opacity-50' : ''}`}
 >
 <BlockEditor
 block={block}
 isSelected={selectedBlockId === block.id}
 onSelect={() => setSelectedBlockId(block.id)}
 onUpdate={(updated) => updateBlock(block.id, updated)}
 onDelete={() => deleteBlock(block.id)}
 />
 </div>
 ))
 )}
 </div>
 </>
 ) : (
 // Preview Panel
 <div className="flex-1 overflow-y-auto p-4 bg-black/50">
 <div className="text-center mb-4">
 <p className="text-white/30 text-xs font-black uppercase tracking-widest">Live Preview</p>
 </div>
 <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/5">
 {renderPreviewContent()}
 </div>
 </div>
 )}
 </div>

 {/* Right Panel - Live Preview */}
 <div className="flex-1 bg-[#050505] overflow-y-auto">
 {/* Preview Header */}
 <div className="sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 px-4 py-2 flex items-center justify-between">
 <div className="flex items-center gap-2 text-white/40 text-xs font-black uppercase tracking-widest">
 <Eye className="w-3 h-3" />
 Live Preview
 </div>
 <div className="text-white/20 text-xs">
 {blocks.length} block{blocks.length !== 1 ? 's' : ''}
 </div>
 </div>

 {/* Preview Content */}
 <div className="p-8 max-w-2xl mx-auto">
 {/* Blog Title Preview */}
 {blogTitle && (
 <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white">
 {blogTitle}
 </h1>
 )}
 
 {/* Blocks */}
 <div ref={previewRef}>
 {renderPreviewContent()}
 </div>

 {blocks.length === 0 && (
 <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
 <Plus className="w-8 h-8 text-white/20 mx-auto mb-2" />
 <p className="text-white/30 text-sm">Add blocks to see preview</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default BlogBuilder;

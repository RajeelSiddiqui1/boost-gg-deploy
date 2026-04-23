import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {
 Plus, Edit2, Trash2, Eye, Save, X, GripVertical,
 Copy, ToggleLeft, ToggleRight, Search, ChevronDown,
 Settings, Type, List, CheckSquare, Circle, Square,
 FileText, Hash, Mail, Phone, Calendar, Link, Palette,
 ArrowUp, ArrowDown, MoreVertical, Layers
} from 'lucide-react';
import { API_URL, getImageUrl } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

// Field types with icons
const FIELD_TYPES = [
 { value: 'text', label: 'Text Input', icon: Type },
 { value: 'textarea', label: 'Text Area', icon: FileText },
 { value: 'number', label: 'Number', icon: Hash },
 { value: 'email', label: 'Email', icon: Mail },
 { value: 'phone', label: 'Phone', icon: Phone },
 { value: 'select', label: 'Dropdown', icon: ChevronDown },
 { value: 'radio', label: 'Radio Buttons', icon: Circle },
 { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
 { value: 'checkbox_group', label: 'Checkbox Group', icon: Square },
 { value: 'date', label: 'Date', icon: Calendar },
 { value: 'url', label: 'URL', icon: Link },
];

const SECTION_TYPES = [
 { value: 'form', label: 'Form Section', description: 'Interactive form with input fields' },
 { value: 'info', label: 'Info Section', description: 'Information display section' },
 { value: 'pricing', label: 'Pricing Section', description: 'Price display with options' },
 { value: 'comparison', label: 'Comparison Section', description: 'Compare options side by side' },
 { value: 'faq', label: 'FAQ Section', description: 'Frequently asked questions' },
 { value: 'custom', label: 'Custom Section', description: 'Custom layout and content' },
];

const AdminSections = () => {
 const [sections, setSections] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editingSection, setEditingSection] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [filterType, setFilterType] = useState('');
 const [filterStatus, setFilterStatus] = useState('');
 const [notification, setNotification] = useState(null);
 const [games, setGames] = useState([]);
 const [services, setServices] = useState([]);

 // Form state
 const [formData, setFormData] = useState({
 title: '',
 sectionId: '',
 subheading: '',
 description: '',
 sectionType: 'custom',
 fields: [],
 settings: {
 showTitle: true,
 showSubheading: true,
 columns: 1,
 backgroundColor: '#000000',
 textColor: '#ffffff',
 borderRadius: 12,
 isVisible: true,
 animation: 'none'
 },
 status: 'active',
 displayOrder: 0,
 gameId: '',
 serviceId: '',
 categoryId: ''
 });

 // New field state
 const [newField, setNewField] = useState({
 label: '',
 sublabel: '',
 fieldType: 'text',
 placeholder: '',
 helperText: '',
 required: false,
 options: []
 });

 const [newOption, setNewOption] = useState({ value: '', label: '', priceModifier: 0 });
 const [showPreview, setShowPreview] = useState(false);

 // Notify function
 const notify = (type, message) => {
 const msg = typeof message === 'object' ? (message.message || JSON.stringify(message)) : message;
 setNotification({ type, message: msg });
 setTimeout(() => setNotification(null), 3000);
 };

 // Fetch sections
 const fetchSections = async () => {
 try {
 const token = localStorage.getItem('token');
 const params = new URLSearchParams();
 if (searchTerm) params.append('search', searchTerm);
 if (filterType) params.append('sectionType', filterType);
 if (filterStatus) params.append('status', filterStatus);

 const queryString = params.toString();
 const url = queryString
 ? `${API_URL}/api/v1/custom-sections?${queryString}`
 : `${API_URL}/api/v1/custom-sections`;

 const res = await axios.get(url, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setSections(res.data.data || []);
 setLoading(false);
 } catch (error) {
 console.error('Error fetching sections:', error);
 notify('error', 'Failed to load sections');
 setLoading(false);
 }
 };

 const fetchGamesAndServices = async () => {
 try {
 const token = localStorage.getItem('token');
 const [gamesRes, servicesRes] = await Promise.all([
 axios.get(`${API_URL}/api/v1/games`, { headers: { Authorization: `Bearer ${token}` } }),
 axios.get(`${API_URL}/api/v1/services`, { headers: { Authorization: `Bearer ${token}` } })
 ]);
 setGames(gamesRes.data.data || []);
 setServices(servicesRes.data.data || []);
 } catch (error) {
 console.error('Error fetching games/services:', error);
 }
 };

 useEffect(() => {
 fetchSections();
 }, [searchTerm, filterType, filterStatus]);

 useEffect(() => {
 fetchGamesAndServices();
 }, []);

 // Reset form
 const resetForm = () => {
 setFormData({
 title: '',
 sectionId: '',
 subheading: '',
 description: '',
 sectionType: 'custom',
 fields: [],
 settings: {
 showTitle: true,
 showSubheading: true,
 columns: 1,
 backgroundColor: '#000000',
 textColor: '#ffffff',
 borderRadius: 12,
 isVisible: true,
 animation: 'none'
 },
 status: 'active',
 displayOrder: 0
 });
 setNewField({
 label: '',
 sublabel: '',
 fieldType: 'text',
 placeholder: '',
 helperText: '',
 required: false,
 options: []
 });
 setEditingSection(null);
 };

 // Open form for new section
 const handleNewClick = () => {
 resetForm();
 setShowForm(true);
 };

 // Open form for editing
 const handleEditClick = (section) => {
 setFormData({
 title: section.title || '',
 sectionId: section.sectionId || '',
 subheading: section.subheading || '',
 description: section.description || '',
 sectionType: section.sectionType || 'custom',
 fields: section.fields || [],
 settings: section.settings || {
 showTitle: true,
 showSubheading: true,
 columns: 1,
 backgroundColor: '#000000',
 textColor: '#ffffff',
 borderRadius: 12,
 isVisible: true,
 animation: 'none'
 },
 status: section.status || 'active',
 displayOrder: section.displayOrder || 0,
 gameId: section.gameId?._id || section.gameId || '',
 serviceId: section.serviceId?._id || section.serviceId || '',
 categoryId: section.categoryId?._id || section.categoryId || ''
 });
 setEditingSection(section);
 setShowForm(true);
 };

 // Close form
 const handleFormClose = () => {
 setShowForm(false);
 resetForm();
 };

 // Handle form change
 const handleChange = (e) => {
 const { name, value, type, checked } = e.target;

 if (name.startsWith('settings.')) {
 const settingKey = name.replace('settings.', '');
 setFormData(prev => ({
 ...prev,
 settings: {
 ...prev.settings,
 [settingKey]: type === 'checkbox' ? checked : value
 }
 }));
 } else {
 setFormData(prev => ({
 ...prev,
 [name]: type === 'checkbox' ? checked : value
 }));
 }
 };

 // Add new field
 const handleAddField = () => {
 if (!newField.label.trim()) {
 notify('error', 'Field label is required');
 return;
 }

 const fieldId = 'field_' + Date.now();
 const field = {
 fieldId,
 label: newField.label,
 sublabel: newField.sublabel || '',
 fieldType: newField.fieldType,
 placeholder: newField.placeholder || '',
 helperText: newField.helperText || '',
 required: newField.required,
 options: newField.options || [],
 displayOrder: formData.fields.length
 };

 setFormData(prev => ({
 ...prev,
 fields: [...prev.fields, field]
 }));

 setNewField({
 label: '',
 sublabel: '',
 fieldType: 'text',
 placeholder: '',
 helperText: '',
 required: false,
 options: []
 });
 };

 // Remove field
 const handleRemoveField = (index) => {
 setFormData(prev => ({
 ...prev,
 fields: prev.fields.filter((_, i) => i !== index)
 }));
 };

 // Add option to new field
 const handleAddOption = () => {
 if (!newOption.label.trim()) return;

 setNewField(prev => ({
 ...prev,
 options: [...prev.options, { ...newOption, value: newOption.value || newOption.label.toLowerCase().replace(/\s+/g, '_') }]
 }));
 setNewOption({ value: '', label: '', priceModifier: 0 });
 };

 // Remove option from new field
 const handleRemoveOption = (index) => {
 setNewField(prev => ({
 ...prev,
 options: prev.options.filter((_, i) => i !== index)
 }));
 };

 // Move field up
 const handleMoveUp = (index) => {
 if (index === 0) return;
 setFormData(prev => {
 const fields = [...prev.fields];
 [fields[index - 1], fields[index]] = [fields[index], fields[index - 1]];
 return { ...prev, fields };
 });
 };

 // Move field down
 const handleMoveDown = (index) => {
 setFormData(prev => {
 const fields = [...prev.fields];
 if (index === fields.length - 1) return prev;
 [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
 return { ...prev, fields };
 });
 };

 // Submit form
 const handleSubmit = async (e) => {
 e.preventDefault();

 if (!formData.title.trim()) {
 notify('error', 'Title is required');
 return;
 }

 try {
 const token = localStorage.getItem('token');
 const config = {
 headers: { Authorization: `Bearer ${token}` }
 };

 if (editingSection) {
 await axios.put(
 `${API_URL}/api/v1/custom-sections/${editingSection._id}`,
 formData,
 config
 );
 notify('success', 'Section updated successfully');
 } else {
 await axios.post(
 `${API_URL}/api/v1/custom-sections`,
 formData,
 config
 );
 notify('success', 'Section created successfully');
 }

 fetchSections();
 handleFormClose();
 } catch (error) {
 console.error('Error saving section:', error);
 notify('error', error.response?.data?.error || 'Failed to save section');
 }
 };

 // Delete section
 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this section?')) return;

 try {
 const token = localStorage.getItem('token');
 await axios.delete(`${API_URL}/api/v1/custom-sections/${id}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 notify('success', 'Section deleted successfully');
 fetchSections();
 } catch (error) {
 console.error('Error deleting section:', error);
 notify('error', 'Failed to delete section');
 }
 };

 // Toggle status
 const handleToggleStatus = async (section) => {
 try {
 const token = localStorage.getItem('token');
 const newStatus = section.status === 'active' ? 'inactive' : 'active';
 await axios.patch(
 `${API_URL}/api/v1/custom-sections/${section._id}/status`,
 { status: newStatus },
 { headers: { Authorization: `Bearer ${token}` } }
 );
 notify('success', `Section ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
 fetchSections();
 } catch (error) {
 console.error('Error toggling status:', error);
 notify('error', 'Failed to update status');
 }
 };

 // Duplicate section
 const handleDuplicate = async (id) => {
 try {
 const token = localStorage.getItem('token');
 await axios.post(
 `${API_URL}/api/v1/custom-sections/${id}/duplicate`,
 {},
 { headers: { Authorization: `Bearer ${token}` } }
 );
 notify('success', 'Section duplicated successfully');
 fetchSections();
 } catch (error) {
 console.error('Error duplicating section:', error);
 notify('error', 'Failed to duplicate section');
 }
 };

 // Get field type icon
 const getFieldIcon = (fieldType) => {
 const field = FIELD_TYPES.find(f => f.value === fieldType);
 return field ? field.icon : Type;
 };

 if (loading && sections.length === 0) {
 return (
 <AdminLayout>
 <div className="min-h-[400px] flex items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 </AdminLayout>
 );
 }

 return (
 <AdminLayout>
 <div className="p-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
 <div>
 <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
 Section Builder
 </h1>
 <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
 Create custom sections with dynamic fields
 </p>
 </div>
 <button
 onClick={handleNewClick}
 className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all"
 >
 <Plus className="w-5 h-5" />
 Add New Section
 </button>
 </div>

 {/* Filters */}
 <div className="flex flex-col md:flex-row gap-4 mb-6">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
 <input
 type="text"
 placeholder="Search sections..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
 />
 </div>
 <select
 value={filterType}
 onChange={(e) => setFilterType(e.target.value)}
 className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary/50"
 >
 <option value="">All Types</option>
 {SECTION_TYPES.map(type => (
 <option key={type.value} value={type.value}>{type.label}</option>
 ))}
 </select>
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value)}
 className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary/50"
 >
 <option value="">All Status</option>
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 <option value="draft">Draft</option>
 </select>
 </div>

 {/* Notification */}
 {notification && (
 <div className={`mb-6 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider ${notification.type === 'success'
 ? 'bg-green-500/10 border border-green-500/20 text-green-500'
 : 'bg-red-500/10 border border-red-500/20 text-red-500'
 }`}>
 {notification.message}
 </div>
 )}

 {/* Sections List */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {sections.map(section => (
 <div key={section._id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <h3 className="text-white font-bold text-lg">{section.title}</h3>
 <p className="text-white/40 text-xs mt-1">{section.sectionId}</p>
 </div>
 <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${section.status === 'active'
 ? 'bg-green-500/20 text-green-400'
 : section.status === 'draft'
 ? 'bg-yellow-500/20 text-yellow-400'
 : 'bg-red-500/20 text-red-400'
 }`}>
 {section.status}
 </div>
 </div>

 {section.subheading && (
 <p className="text-white/60 text-sm mb-4 line-clamp-2">{section.subheading}</p>
 )}

 <div className="flex items-center gap-4 text-white/40 text-xs mb-4">
 <span className="flex items-center gap-1">
 <Layers className="w-4 h-4" />
 {section.fields?.length || 0} fields
 </span>
 <span className="capitalize">{section.sectionType}</span>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() => handleEditClick(section)}
 className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all text-sm font-bold"
 title="Edit this section"
 >
 <Edit2 className="w-4 h-4" />
 Edit
 </button>
 <button
 onClick={() => handleDuplicate(section._id)}
 className="p-2 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-all"
 title="Duplicate this section"
 >
 <Copy className="w-4 h-4" />
 </button>
 <button
 onClick={() => handleToggleStatus(section)}
 className="p-2 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-all"
 title={section.status === 'active' ? 'Deactivate section' : 'Activate section'}
 >
 {section.status === 'active'
 ? <ToggleRight className="w-4 h-4 text-green-400" />
 : <ToggleLeft className="w-4 h-4" />
 }
 </button>
 <button
 onClick={() => handleDelete(section._id)}
 className="p-2 bg-white/5 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
 title="Delete this section permanently"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))}
 </div>

 {sections.length === 0 && (
 <div className="text-center py-12">
 <Layers className="w-16 h-16 text-white/20 mx-auto mb-4" />
 <h3 className="text-white font-bold text-xl mb-2">No sections found</h3>
 <p className="text-white/40 mb-6">Create your first custom section</p>
 <button
 onClick={handleNewClick}
 className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all"
 title="Create a new custom section with fields"
 >
 <Plus className="w-5 h-5" />
 Add New Section
 </button>
 </div>
 )}
 </div>

 {/* Form Modal */}
 {showForm && ReactDOM.createPortal(
 <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-start justify-center z-[999] p-4 overflow-y-auto">
 <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 md:p-10 max-w-5xl w-full my-4 md:my-10 relative">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
 {editingSection ? 'Edit Section' : 'Create Section'}
 </h2>
 <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
 Add title, subheading and unlimited fields
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setShowPreview(!showPreview)}
 className={`p-3 hover:bg-white/5 border border-white/5 rounded-2xl transition-all ${showPreview ? 'bg-primary/20 text-primary border-primary/30' : 'text-white/40 hover:text-white'}`}
 title="Toggle preview mode"
 >
 <Eye className="w-6 h-6" />
 </button>
 <button
 onClick={handleFormClose}
 className="p-3 hover:bg-white/5 border border-white/5 rounded-2xl transition-all text-white/40 hover:text-white"
 title="Close form"
 >
 <X className="w-6 h-6" />
 </button>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Left: Section Info */}
 <div className="lg:col-span-2 space-y-6">
 {/* Basic Info */}
 <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
 <h3 className="text-white font-bold mb-4 flex items-center gap-2">
 <FileText className="w-5 h-5 text-primary" />
 Section Information
 </h3>

 <div className="space-y-4">
 <div>
 <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
 Title *
 </label>
 <input
 type="text"
 name="title"
 value={formData.title}
 onChange={handleChange}
 placeholder="Enter section title"
 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
 />
 </div>

 <div>
 <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
 Section ID
 </label>
 <input
 type="text"
 name="sectionId"
 value={formData.sectionId}
 onChange={handleChange}
 placeholder="auto-generated-if-empty"
 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
 />
 </div>

 <div>
 <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
 Subheading
 </label>
 <input
 type="text"
 name="subheading"
 value={formData.subheading}
 onChange={handleChange}
 placeholder="Enter subheading"
 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
 />
 </div>

 <div>
 <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
 Description
 </label>
 <textarea
 name="description"
 value={formData.description}
 onChange={handleChange}
 placeholder="Enter description"
 rows={3}
 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 resize-none"
 />
 </div>

 <div>
 <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
 Section Type
 </label>
 <select
 name="sectionType"
 value={formData.sectionType}
 onChange={handleChange}
 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
 >
 {SECTION_TYPES.map(type => (
 <option key={type.value} value={type.value}>
 {type.label}
 </option>
 ))}
 </select>
 </div>
 </div>
 </div>

 {/* Fields Builder */}
 <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
 <h3 className="text-white font-bold mb-4 flex items-center gap-2">
 <List className="w-5 h-5 text-primary" />
 Fields Builder
 </h3>

 {/* Existing Fields */}
 {formData.fields.length > 0 && (
 <div className="space-y-3 mb-6">
 {formData.fields.map((field, index) => {
 const Icon = getFieldIcon(field.fieldType);
 return (
 <div key={field.fieldId} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
 <div className="flex flex-col gap-1">
 <button
 type="button"
 onClick={() => handleMoveUp(index)}
 disabled={index === 0}
 className="p-1 text-white/40 hover:text-white disabled:opacity-30"
 title="Move field up"
 >
 <ArrowUp className="w-3 h-3" />
 </button>
 <button
 type="button"
 onClick={() => handleMoveDown(index)}
 disabled={index === formData.fields.length - 1}
 className="p-1 text-white/40 hover:text-white disabled:opacity-30"
 title="Move field down"
 >
 <ArrowDown className="w-3 h-3" />
 </button>
 </div>
 <Icon className="w-5 h-5 text-primary" />
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <span className="text-white font-bold">{field.label}</span>
 <span className="text-white/40 text-xs">({field.fieldType})</span>
 {field.required && <span className="text-red-400 text-xs">*required</span>}
 </div>
 {field.sublabel && (
 <p className="text-white/40 text-xs">{field.sublabel}</p>
 )}
 {field.options?.length > 0 && (
 <div className="flex flex-wrap gap-1 mt-1">
 {field.options.map((opt, i) => (
 <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60">
 {opt.label}
 </span>
 ))}
 </div>
 )}
 </div>
 <button
 type="button"
 onClick={() => handleRemoveField(index)}
 className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 );
 })}
 </div>
 )}

 {/* Add New Field */}
 <div className="border-t border-white/10 pt-6">
 <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">Add New Field</h4>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <div>
 <label className="text-white/40 text-xs mb-1 block">Label *</label>
 <input
 type="text"
 value={newField.label}
 onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
 placeholder="Field label"
 className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 text-sm"
 />
 </div>
 <div>
 <label className="text-white/40 text-xs mb-1 block">Sublabel</label>
 <input
 type="text"
 value={newField.sublabel}
 onChange={(e) => setNewField(prev => ({ ...prev, sublabel: e.target.value }))}
 placeholder="Helper text"
 className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 text-sm"
 />
 </div>
 <div>
 <label className="text-white/40 text-xs mb-1 block">Field Type</label>
 <select
 value={newField.fieldType}
 onChange={(e) => setNewField(prev => ({ ...prev, fieldType: e.target.value }))}
 className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 text-sm"
 >
 {FIELD_TYPES.map(type => (
 <option key={type.value} value={type.value}>{type.label}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="text-white/40 text-xs mb-1 block">Placeholder</label>
 <input
 type="text"
 value={newField.placeholder}
 onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
 placeholder="Placeholder text"
 className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 text-sm"
 />
 </div>
 </div>

 {/* Options for select/radio/checkbox_group */}
 {['select', 'radio', 'checkbox_group'].includes(newField.fieldType) && (
 <div className="mb-4 p-4 bg-white/5 rounded-lg">
 <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 block">
 Options
 </label>

 <div className="space-y-2 mb-3">
 {newField.options.map((opt, index) => (
 <div key={index} className="flex items-center gap-2">
 <span className="flex-1 text-white text-sm">{opt.label}</span>
 <span className="text-white/40 text-xs">({opt.value})</span>
 {opt.priceModifier !== 0 && (
 <span className="text-primary text-xs">{opt.priceModifier > 0 ? '+' : ''}{opt.priceModifier}%</span>
 )}
 <button
 type="button"
 onClick={() => handleRemoveOption(index)}
 className="p-1 text-red-400"
 >
 <X className="w-3 h-3" />
 </button>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
 <input
 type="text"
 value={newOption.label}
 onChange={(e) => setNewOption(prev => ({ ...prev, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
 placeholder="Label"
 className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm"
 />
 <input
 type="number"
 value={newOption.priceModifier}
 onChange={(e) => setNewOption(prev => ({ ...prev, priceModifier: parseFloat(e.target.value) || 0 }))}
 placeholder="Price %"
 className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm"
 />
 <button
 type="button"
 onClick={handleAddOption}
 disabled={!newOption.label.trim()}
 className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 disabled:opacity-50 text-sm font-bold"
 >
 Add Option
 </button>
 </div>
 </div>
 )}

 <div className="flex items-center gap-4">
 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={newField.required}
 onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
 className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary"
 />
 <span className="text-white/60 text-sm">Required</span>
 </label>

 <button
 type="button"
 onClick={handleAddField}
 disabled={!newField.label.trim()}
 className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 disabled:opacity-50 font-bold text-sm"
 >
 <Plus className="w-4 h-4" />
 Add Field
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Right: Settings */}
 <div className="space-y-6">
 {/* Status & Display */}
 <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
 <h3 className="text-white font-bold mb-4 flex items-center gap-2">
 <Settings className="w-5 h-5 text-primary" />
 Settings
 </h3>

 <div className="space-y-4">
 <div>
 <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
 Status
 </label>
 <select
 name="status"
 value={formData.status}
 onChange={handleChange}
 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
 >
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 <option value="draft">Draft</option>
 </select>
 </div>

 <div>
 <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
 Display Order
 </label>
 <input
 type="number"
 name="displayOrder"
 value={formData.displayOrder}
 onChange={handleChange}
 min="0"
 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 name="settings.showTitle"
 checked={formData.settings.showTitle}
 onChange={handleChange}
 className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary"
 />
 <span className="text-white/60 text-sm">Show Title</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 name="settings.showSubheading"
 checked={formData.settings.showSubheading}
 onChange={handleChange}
 className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary"
 />
 <span className="text-white/60 text-sm">Show Subheading</span>
 </label>
 </div>

 <div>
 <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
 Columns
 </label>
 <select
 name="settings.columns"
 value={formData.settings.columns}
 onChange={handleChange}
 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
 >
 <option value="1">1 Column</option>
 <option value="2">2 Columns</option>
 <option value="3">3 Columns</option>
 <option value="4">4 Columns</option>
 </select>
 </div>

 <div>
 <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
 Link to Game
 </label>
 <select
 name="gameId"
 value={formData.gameId}
 onChange={handleChange}
 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
 >
 <option value="">Global (No Game)</option>
 {games.map(game => (
 <option key={game._id} value={game._id}>{game.title || game.name}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
 Link to Service
 </label>
 <select
 name="serviceId"
 value={formData.serviceId}
 onChange={handleChange}
 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
 >
 <option value="">All Services</option>
 {services.map(service => (
 <option key={service._id} value={service._id}>{service.title || service.name}</option>
 ))}
 </select>
 </div>
 </div>
 </div>

 {/* Styling */}
 <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
 <h3 className="text-white font-bold mb-4 flex items-center gap-2">
 <Palette className="w-5 h-5 text-primary" />
 Styling
 </h3>

 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-white/40 text-xs mb-1 block">Background</label>
 <div className="flex items-center gap-2">
 <input
 type="color"
 name="settings.backgroundColor"
 value={formData.settings.backgroundColor}
 onChange={handleChange}
 className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer"
 />
 <span className="text-white/60 text-xs">{formData.settings.backgroundColor}</span>
 </div>
 </div>
 <div>
 <label className="text-white/40 text-xs mb-1 block">Text Color</label>
 <div className="flex items-center gap-2">
 <input
 type="color"
 name="settings.textColor"
 value={formData.settings.textColor}
 onChange={handleChange}
 className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer"
 />
 <span className="text-white/60 text-xs">{formData.settings.textColor}</span>
 </div>
 </div>
 </div>

 <div>
 <label className="text-white/40 text-xs mb-1 block">Border Radius</label>
 <input
 type="range"
 name="settings.borderRadius"
 value={formData.settings.borderRadius}
 onChange={handleChange}
 min="0"
 max="32"
 className="w-full"
 />
 <div className="text-right text-white/40 text-xs">{formData.settings.borderRadius}px</div>
 </div>
 </div>
 </div>

 {/* Preview */}
 {showPreview && (
 <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
 <h3 className="text-white font-bold mb-4">Preview</h3>
 <div
 className="p-4 rounded-xl"
 style={{
 backgroundColor: formData.settings.backgroundColor,
 borderRadius: formData.settings.borderRadius
 }}
 >
 {formData.settings.showTitle && formData.title && (
 <h4 className="text-lg font-bold mb-2" style={{ color: formData.settings.textColor }}>
 {formData.title}
 </h4>
 )}
 {formData.settings.showSubheading && formData.subheading && (
 <p className="text-sm mb-4 opacity-70" style={{ color: formData.settings.textColor }}>
 {formData.subheading}
 </p>
 )}
 {formData.fields.length > 0 && (
 <div className="space-y-3">
 {formData.fields.slice(0, 3).map(field => (
 <div key={field.fieldId}>
 <label className="text-xs font-bold block mb-1" style={{ color: formData.settings.textColor }}>
 {field.label} {field.required && '*'}
 </label>
 {field.fieldType === 'select' ? (
 <select
 className="w-full px-3 py-2 bg-white/10 rounded-lg text-sm"
 style={{ color: formData.settings.textColor }}
 >
 <option>Select...</option>
 {field.options?.map(opt => (
 <option key={opt.value}>{opt.label}</option>
 ))}
 </select>
 ) : field.fieldType === 'radio' ? (
 <div className="flex gap-3">
 {field.options?.map(opt => (
 <label key={opt.value} className="flex items-center gap-1">
 <input type="radio" name={field.fieldId} />
 <span className="text-xs" style={{ color: formData.settings.textColor }}>{opt.label}</span>
 </label>
 ))}
 </div>
 ) : field.fieldType === 'checkbox' ? (
 <label className="flex items-center gap-2">
 <input type="checkbox" />
 <span className="text-xs" style={{ color: formData.settings.textColor }}>{field.sublabel || field.label}</span>
 </label>
 ) : (
 <input
 type={field.fieldType === 'number' ? 'number' : 'text'}
 placeholder={field.placeholder}
 className="w-full px-3 py-2 bg-white/10 rounded-lg text-sm"
 style={{ color: formData.settings.textColor }}
 />
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {/* Submit */}
 <button
 type="submit"
 className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all"
 >
 <Save className="w-5 h-5" />
 {editingSection ? 'Update Section' : 'Create Section'}
 </button>
 </div>
 </div>
 </form>
 </div>
 </div>,
 document.body
 )}
 </AdminLayout>
 );
};

export default AdminSections;

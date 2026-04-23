import React, { useState } from 'react';
import RankSlider from './RankSlider';

const FIELD_TYPES = [
 { value: 'text', label: 'Text' },
 { value: 'number', label: 'Number' },
 { value: 'select', label: 'Dropdown' },
 { value: 'radio', label: 'Radio' },
 { value: 'checkbox', label: 'Checkbox' },
 { value: 'textarea', label: 'Text Area' },
];

const OptionsPanel = ({
 serviceOptions = [],
 selectedOptions = {},
 setSelectedOptions,
 platforms = [],
 selectedPlatform,
 setSelectedPlatform,
 regions = [],
 selectedRegion,
 setSelectedRegion,
 boostTypeAllowed = "both",
 selectedBoostType,
 setSelectedBoostType,
 rankRangeData = null,
 rankRangeValue = { from: '', to: '' },
 setRankRangeValue,
 // New props for dual form builder
 leftFormData = null,
 setLeftFormData,
 rightFormData = null,
 setRightFormData
}) => {
 // Initialize left form state if not provided
 const [localLeftFields, setLocalLeftFields] = useState(leftFormData?.fields || []);
 // Initialize right form state if not provided
 const [localRightFields, setLocalRightFields] = useState(rightFormData?.fields || []);

 // Editing state for fields
 const [editingFieldId, setEditingFieldId] = useState(null);
 const [newField, setNewField] = useState({ label: '', type: 'text', options: [] });
 const [newOption, setNewOption] = useState({ label: '', value: '' });

 const handleOptionChange = (optionName, choiceId, type) => {
 if (type === 'checkbox') {
 const currentSelected = selectedOptions[optionName] || [];
 if (currentSelected.includes(choiceId)) {
 setSelectedOptions(prev => ({
 ...prev,
 [optionName]: currentSelected.filter(id => id !== choiceId)
 }));
 } else {
 setSelectedOptions(prev => ({
 ...prev,
 [optionName]: [...currentSelected, choiceId]
 }));
 }
 } else {
 setSelectedOptions(prev => ({
 ...prev,
 [optionName]: choiceId
 }));
 }
 };

 // Form builder handlers...
 const handleUpdateLeftField = (id, updates) => {
 const updated = localLeftFields.map(f => f.id === id ? { ...f, ...updates } : f);
 setLocalLeftFields(updated);
 if (setLeftFormData) setLeftFormData({ fields: updated });
 };

 const handleUpdateRightField = (id, updates) => {
 const updated = localRightFields.map(f => f.id === id ? { ...f, ...updates } : f);
 setLocalRightFields(updated);
 if (setRightFormData) setRightFormData({ fields: updated });
 };

 const renderFieldInput = (field, side) => {
 const handleChange = (value) => {
 if (side === 'left') handleUpdateLeftField(field.id, { value });
 else handleUpdateRightField(field.id, { value });
 };

 const commonClass = "w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-white text-[14px] font-semibold focus:border-sky-purple focus:outline-none transition-all";

 if (field.type === 'select') {
 return (
 <select value={field.value || ''} onChange={(e) => handleChange(e.target.value)} className={commonClass}>
 <option value="" disabled>Select...</option>
 {field.options?.map((opt, idx) => (
 <option key={idx} value={opt.value} className="bg-black">{opt.label}</option>
 ))}
 </select>
 );
 }
 // ... (simplified for now to restore sanity, will expand once stable)
 return <input type="text" value={field.value || ''} onChange={(e) => handleChange(e.target.value)} className={commonClass} placeholder={field.label} />;
 };

 const isDualMode = leftFormData !== undefined || rightFormData !== undefined;

 return (
 <div className="space-y-8 animate-fade-in">
 {/* Boost Type Toggle */}
 {boostTypeAllowed !== "none" && (
 <div className="space-y-4">
 <label className="block text-sky-text-secondary text-[10px] font-black uppercase tracking-widest px-1">Boost Method</label>
 <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-[20px] backdrop-blur-md">
 {["piloted", "self-play"].map((type) => (
 (boostTypeAllowed === "both" || boostTypeAllowed === type) && (
 <button
 key={type}
 onClick={() => setSelectedBoostType(type)}
 className={`flex-1 py-3 px-4 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${selectedBoostType === type ? "bg-primary text-black shadow-lg scale-[1.02]" : "text-white/20 hover:text-white/40 hover:bg-white/5"
 }`}
 >
 {type}
 </button>
 )
 ))}
 </div>
 </div>
 )}

 {/* DEFAULT MODE: Strict SkyCoach Selection Cards */}
 {!isDualMode && (
 <div className="space-y-8">
 {serviceOptions.map((option, idx) => (
 <div key={idx} className="space-y-4">
 <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">{option.name}</label>

 {option.type === 'rank-range' ? (
 <RankSlider
 ranks={option.ranks || []}
 fromRank={rankRangeValue.from}
 setFromRank={(val) => setRankRangeValue(prev => ({ ...prev, from: val }))}
 toRank={rankRangeValue.to}
 setToRank={(val) => setRankRangeValue(prev => ({ ...prev, to: val }))}
 />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {option.choices && option.choices.map((choice, cIdx) => {
 const isSelected = option.type === 'checkbox'
 ? (selectedOptions[option.name] || []).includes(choice._id || choice.label)
 : selectedOptions[option.name] === (choice._id || choice.label);

 return (
 <div
 key={cIdx}
 onClick={() => handleOptionChange(option.name, choice._id || choice.label, option.type)}
 className={`
 relative p-6 rounded-[28.44px] border transition-all duration-300 cursor-pointer group/choice
 ${isSelected
 ? "bg-white/10 border-sky-purple shadow-[0_0_30px_rgba(90,48,255,0.1)] opacity-100"
 : "bg-white/[0.03] border-white/5 opacity-50 hover:opacity-80 hover:bg-white/[0.06]"}
 `}
 >
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className={`
 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
 ${isSelected ? "border-sky-purple bg-sky-purple/20" : "border-white/10 group-hover/choice:border-white/30"}
 `}>
 <div className={`
 w-2.5 h-2.5 rounded-full transition-all duration-300
 ${isSelected ? "bg-sky-purple scale-100 shadow-[0_0_10px_rgba(90,48,255,0.5)]" : "scale-0"}
 `} />
 </div>
 <div>
 <p className="text-[15px] font-bold text-white transition-colors">
 {choice.label}
 </p>
 {choice.description && (
 <p className="text-[10px] text-white/40 mt-1 font-stolzl">{choice.description}</p>
 )}
 </div>
 </div>
 {choice.addPrice > 0 && (
 <div className="flex flex-col items-end">
 <span className={`text-[11px] font-black tracking-tighter transition-colors ${isSelected ? "text-primary" : "text-white/20"}`}>
 + {choice.addPrice} €
 </span>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 ))}

 {serviceOptions.length === 0 && (
 <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-[28px] p-12 text-center">
 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] ">No additional options available</p>
 </div>
 )}
 </div>
 )}
 </div>
 );
};

export default OptionsPanel;

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Trash2, ChevronDown, ChevronUp, Info, X } from "lucide-react";
// Removed type imports

/* ═══════════════════════════════ SORTABLE OPTION ROW ────────────────────────────────────────────────── */

function SortableOptionRow({ option, fieldType, onUpdate, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center gap-3 p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg mb-2 shadow-sm hover:border-[#333] transition-all"
        >
            <div {...attributes} {...listeners} className="cursor-grab hover:text-purple-500 transition-colors text-gray-600">
                <GripVertical size={18} />
            </div>

            <div className="flex-1 grid grid-cols-12 gap-3 items-center min-w-0">
                <div className="col-span-4 min-w-0">
                    <input
                        type="text"
                        value={option.label}
                        onChange={(e) => onUpdate(option.id, { label: e.target.value })}
                        placeholder="Option Label"
                        className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:border-purple-500 outline-none transition-all min-w-0"
                    />
                </div>
                <div className="col-span-2 min-w-0">
                    <div className="relative">
                        <span className="absolute left-2.5 top-2 text-gray-500 text-xs font-bold">$</span>
                        <input
                            type="number"
                            value={option.priceModifier}
                            onChange={(e) => onUpdate(option.id, { priceModifier: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-[#111] border border-[#333] rounded-lg pl-6 pr-2 py-1.5 text-sm text-white focus:border-purple-500 outline-none"
                        />
                    </div>
                </div>

                {fieldType === "radio" && (
                    <div className="col-span-4 min-w-0">
                        <input
                            type="text"
                            value={option.priceLabel || ""}
                            onChange={(e) => onUpdate(option.id, { priceLabel: e.target.value })}
                            placeholder="Price Label (Free)"
                            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:border-purple-500 outline-none min-w-0"
                        />
                    </div>
                )}

                {fieldType === "checkbox" && (
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <button
                            onClick={() => onUpdate(option.id, { showInfo: !option.showInfo })}
                            className={`p-1.5 rounded-lg transition-all ${option.showInfo ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "text-gray-500 hover:text-gray-300 bg-[#1a1a1a]"}`}
                            title="Show info icon"
                        >
                            <Info size={16} />
                        </button>
                        {option.showInfo && (
                            <input
                                type="text"
                                value={option.tooltip || ""}
                                onChange={(e) => onUpdate(option.id, { tooltip: e.target.value })}
                                placeholder="Tooltip text"
                                className="flex-1 w-full min-w-0 bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white focus:border-purple-500 outline-none transition-all"
                            />
                        )}
                    </div>
                )}

                <div className={`${fieldType === 'checkbox' || fieldType === 'radio' ? 'col-span-2' : 'col-span-6'} flex items-center justify-end gap-3 min-w-0`}>
                    <label className="flex items-center gap-2 cursor-pointer group/label">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${option.isDefault ? 'bg-purple-600 border-purple-500 scale-110 shadow-[0_0_10px_rgba(147,51,234,0.3)]' : 'border-[#444] group-hover/label:border-gray-500'}`}>
                            {option.isDefault && <Check size={10} strokeWidth={4} className="text-white" />}
                            <input
                                type="checkbox"
                                checked={option.isDefault}
                                onChange={() => onUpdate(option.id, { isDefault: !option.isDefault })}
                                className="hidden"
                            />
                        </div>
                        <span className={`text-[10px] uppercase font-black tracking-widest transition-colors ${option.isDefault ? 'text-purple-400' : 'text-gray-600'}`}>Default</span>
                    </label>
                    <button
                        onClick={() => onDelete(option.id)}
                        className="p-1.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

const Check = ({ size, className, strokeWidth }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5" /></svg>
);

/* ═══════════════════════════════ SECTION CARD ──────────────────────────────────────────────── */

export function SectionCard({
    section,
    onUpdate,
    onDelete,
    onUpdateOption,
    onAddOption,
    onDeleteOption,
    onReorderOptions
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = section.options?.findIndex(o => o.id === active.id) ?? -1;
            const newIndex = section.options?.findIndex(o => o.id === over.id) ?? -1;
            onReorderOptions(section.id, oldIndex, newIndex);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-[#141414] border border-[#222] rounded-2xl mb-6 overflow-hidden transition-all shadow-xl hover:shadow-2xl hover:border-[#333] ${isDragging ? "opacity-30 scale-95" : "opacity-100"}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-[#1a1a1a] border-b border-[#222]">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div {...attributes} {...listeners} className="cursor-grab text-gray-600 hover:text-purple-500 transition-all p-1 hover:bg-purple-500/10 rounded flex-shrink-0">
                        <GripVertical size={20} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <input
                            type="text"
                            value={section.heading}
                            onChange={(e) => onUpdate(section.id, { heading: e.target.value })}
                            placeholder="Section Heading (e.g. Difficulty)"
                            className="bg-transparent border-none text-white font-black text-xl italic uppercase tracking-tighter outline-none focus:ring-0 placeholder:text-gray-700 w-full"
                        />
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-[0.2em] bg-purple-600/20 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(147,51,234,0.1)]">
                                {section.fieldType.replace("_", " ")}
                            </span>
                            {section.required && (
                                <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-[0.2em] bg-red-600/10 text-red-500 border border-red-500/20">
                                    Required
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-3 bg-[#0d0d0d] px-4 py-2 rounded-xl border border-[#222]">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">Mark Required</span>
                        <button
                            onClick={() => onUpdate(section.id, { required: !section.required })}
                            className={`w-9 h-5 rounded-full transition-all relative ${section.required ? 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.4)]' : 'bg-[#222]'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${section.required ? 'left-5' : 'left-1'}`} />
                        </button>
                    </div>

                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-500 hover:text-white hover:bg-[#252525] rounded-xl transition-all" title="Collapse/Expand">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <button onClick={() => onDelete(section.id)} className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Delete Section">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-6 bg-[#111] space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Field Type Selector */}
                    <div>
                        <label className="block text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mb-3 ml-1 opacity-50">Component Type</label>
                        <div className="flex flex-wrap gap-2">
                            {["radio", "checkbox", "dropdown", "stepper", "text_input"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => onUpdate(section.id, { fieldType: type })}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${section.fieldType === type
                                        ? "bg-gradient-to-br from-purple-600 to-purple-800 border-purple-500 text-white shadow-[0_10px_20px_rgba(147,51,234,0.3)] scale-105"
                                        : "bg-[#181818] border-[#222] text-gray-500 hover:border-gray-600 hover:text-gray-300"
                                        }`}
                                >
                                    {type.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Options List (Radio, Checkbox, Dropdown) */}
                    {["radio", "checkbox", "dropdown"].includes(section.fieldType) && (
                        <div>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <label className="block text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] opacity-50">Configuration Options</label>
                                <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded">{section.options?.length || 0} Items</span>
                            </div>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={section.options?.map(o => o.id) || []}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {section.options?.map((option) => (
                                        <SortableOptionRow
                                            key={option.id}
                                            option={option}
                                            fieldType={section.fieldType}
                                            onUpdate={(optId, updates) => onUpdateOption(section.id, optId, updates)}
                                            onDelete={(optId) => onDeleteOption(section.id, optId)}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                            <button
                                onClick={() => onAddOption(section.id)}
                                className="w-full mt-4 py-4 border-2 border-dashed border-[#222] rounded-2xl flex items-center justify-center gap-3 text-gray-500 hover:border-purple-600 hover:text-purple-400 transition-all bg-[#0d0d0d] group"
                            >
                                <div className="p-1.5 rounded-lg bg-purple-600/10 group-hover:bg-purple-600/20 transition-all">
                                    <Plus size={18} className="text-purple-500" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.15em]">Insert New Option</span>
                            </button>
                        </div>
                    )}

                    {/* Stepper Config */}
                    {section.fieldType === "stepper" && (
                        <div className="grid grid-cols-2 gap-6 bg-[#0d0d0d] p-6 rounded-2xl border border-[#222] shadow-inner">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2 opacity-70">Unit Label (e.g. Days)</label>
                                    <input
                                        type="text"
                                        value={section.stepperConfig?.unitLabel || ""}
                                        onChange={(e) => onUpdate(section.id, {
                                            stepperConfig: { ...section.stepperConfig, unitLabel: e.target.value }
                                        })}
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none transition-all"
                                        placeholder="Quantity"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2 opacity-70">Price per Unit</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-2.5 text-gray-500 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={section.stepperConfig?.pricePerUnit || 0}
                                            onChange={(e) => onUpdate(section.id, {
                                                stepperConfig: { ...section.stepperConfig, pricePerUnit: parseFloat(e.target.value) || 0 }
                                            })}
                                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-8 pr-4 py-2.5 text-sm font-black text-white focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2 opacity-70">Minimum</label>
                                        <input
                                            type="number"
                                            value={section.stepperConfig?.min || 1}
                                            onChange={(e) => onUpdate(section.id, {
                                                stepperConfig: { ...section.stepperConfig, min: parseInt(e.target.value) || 1 }
                                            })}
                                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2 opacity-70">Default</label>
                                        <input
                                            type="number"
                                            value={section.stepperConfig?.default || 1}
                                            onChange={(e) => onUpdate(section.id, {
                                                stepperConfig: { ...section.stepperConfig, default: parseInt(e.target.value) || 1 }
                                            })}
                                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2 opacity-70">Max (Optional)</label>
                                    <input
                                        type="number"
                                        placeholder="Unlimited"
                                        value={section.stepperConfig?.max || ""}
                                        onChange={(e) => onUpdate(section.id, {
                                            stepperConfig: { ...section.stepperConfig, max: parseInt(e.target.value) || null }
                                        })}
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Text Input Config */}
                    {section.fieldType === "text_input" && (
                        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-[#222]">
                            <label className="block text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2 opacity-70">Helper Placeholder</label>
                            <input
                                type="text"
                                value={section.placeholder || ""}
                                onChange={(e) => onUpdate(section.id, { placeholder: e.target.value })}
                                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all italic"
                                placeholder="e.g. Your Bungie Name #1234"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

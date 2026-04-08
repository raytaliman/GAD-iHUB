import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ModernSelect({ label, value, options, onChange, icon: Icon, placeholder = 'Select option', disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative mb-4">
            {label && <label className="text-sm font-semibold text-slate-700 mb-1.5 block px-1">{label}</label>}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${isOpen ? 'border-[#7030a0] ring-4 ring-violet-100' : 'border-slate-200 hover:border-violet-300'
                    } ${disabled ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'bg-white shadow-sm'}`}
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} className={value ? 'text-[#7030a0]' : 'text-slate-400'} />}
                    <span className={`text-sm ${value ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                        {value || placeholder}
                    </span>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-slate-400 text-sm">No options available</div>
                        ) : options.map((opt, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`w-full px-4 py-3 text-left text-sm transition-colors ${value === opt ? 'bg-violet-50 text-[#7030a0] font-bold' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

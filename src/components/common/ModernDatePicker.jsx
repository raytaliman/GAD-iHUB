import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ModernDatePicker({ label, value, onChange, placeholder = 'Select date' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const daysArr = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };
    const handleNextMonth = (e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day) => {
        const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Correct for timezone offset to ensure we get the right YYYY-MM-DD
        const offset = selectedDate.getTimezoneOffset();
        const correctedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
        onChange(correctedDate.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
    };

    const isSelected = (day) => {
        if (!value) return false;
        const sel = new Date(value);
        return day === sel.getDate() && viewDate.getMonth() === sel.getMonth() && viewDate.getFullYear() === sel.getFullYear();
    };

    const calendarDays = [];
    const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());

    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

    return (
        <div className="relative mb-4">
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block px-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${isOpen ? 'border-[#7030a0] ring-4 ring-violet-100' : 'border-slate-200 hover:border-violet-300'
                    } bg-white shadow-sm`}
            >
                <div className="flex items-center gap-3">
                    <Calendar size={18} className={value ? 'text-[#7030a0]' : 'text-slate-400'} />
                    <span className={`text-sm ${value ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                        {value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : placeholder}
                    </span>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="font-bold text-slate-800">
                                {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </div>
                            <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {daysArr.map(d => (
                                <div key={d} className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, i) => (
                                <div key={i} className="aspect-square flex items-center justify-center">
                                    {day && (
                                        <button
                                            type="button"
                                            onClick={() => handleDateSelect(day)}
                                            className={`w-full h-full text-sm rounded-xl transition-all flex items-center justify-center ${isSelected(day)
                                                ? 'bg-[#7030a0] text-white font-bold shadow-md shadow-violet-200'
                                                : isToday(day)
                                                    ? 'bg-violet-50 text-[#7030a0] font-bold border border-violet-100'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

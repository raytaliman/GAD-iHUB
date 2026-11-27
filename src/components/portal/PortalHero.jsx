import React from 'react';

export default function PortalHero() {
    return (
        <div className="pt-2 sm:pt-3 pb-2 px-4 text-center max-w-3xl mx-auto flex flex-col items-center animate-in fade-in duration-500">
            <span className="text-[11px] sm:text-xs font-black tracking-widest text-slate-900 uppercase mb-1">
                WELCOME TO
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-none mb-2">
                iHub<span className="text-[#7030a0]">GAD</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed">
                A safe, nurturing, and gender-responsive space dedicated to child-care, maternal support, and family development at DOST Region 1.
            </p>
        </div>
    );
}

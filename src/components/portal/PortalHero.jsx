import React from 'react';

export default function PortalHero() {
    return (
        <div className="text-center max-w-xl mx-auto flex flex-col items-center mb-4 sm:mb-5 animate-in fade-in duration-500">
            <span className="text-[11px] sm:text-xs font-black tracking-widest text-violet-200 uppercase mb-1">
                WELCOME TO
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none mb-2.5">
                iHubGAD
            </h1>
            <p className="text-violet-100/90 text-xs sm:text-sm font-medium max-w-lg mx-auto leading-relaxed">
                A safe, nurturing, and gender-responsive space dedicated to child-care, maternal support, and family development at DOST Region 1.
            </p>
        </div>
    );
}

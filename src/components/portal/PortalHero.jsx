import React from 'react';
import dostLogo from '../../assets/dost_logo.png';
import ihubLogo from '../../assets/ihub_logo.png';

export default function PortalHero({ revealed = true }) {
    return (
        <div className="text-center max-w-xl mx-auto flex flex-col items-center mb-2 sm:mb-3">
            {/* Dual Logos: starts bigger & centered, shrinks and slides up first matching Login.jsx */}
            <div
                className={`flex items-center justify-center gap-3 sm:gap-4 transition-all duration-500 ease-out select-none ${revealed
                    ? 'translate-y-0 scale-100 mb-2 sm:mb-3'
                    : 'translate-y-36 sm:translate-y-48 md:translate-y-52 scale-125 sm:scale-150 md:scale-[1.75] mb-0'
                    }`}
            >
                <img
                    src={ihubLogo}
                    alt="iHub GAD Emblem"
                    className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full object-cover drop-shadow-md"
                />
            </div>

            {/* Text below logo: fade in only AFTER logo finishes sliding up */}
            <div
                className={`flex flex-col items-center transition-all duration-500 ease-out ${revealed
                    ? 'delay-500 opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
            >
                <span className="text-[11px] sm:text-xs font-black tracking-widest text-violet-200 uppercase mb-1">
                    WELCOME TO
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2 drop-shadow-md">
                    iHubGAD
                </h1>
                <p className="text-violet-100/90 text-xs sm:text-sm font-medium max-w-lg mx-auto leading-relaxed drop-shadow-xs">
                    A safe, nurturing, and gender-responsive space dedicated to child-care, maternal support, and family development at DOST Region 1.
                </p>
            </div>
        </div>
    );
}

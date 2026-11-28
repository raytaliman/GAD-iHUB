import React from 'react';
import { UserPlus, ChevronDown, Sparkles } from 'lucide-react';
import ihubLogo from '../../assets/ihub_logo.png';

export default function PortalHero({ onRegisterClick }) {
    return (
        <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left select-none">
            {/* 1. BRANDING LOGO: Sits in place naturally without sliding or scaling */}
            <div className="flex items-center justify-center lg:justify-start gap-3.5 sm:gap-4 mb-4 sm:mb-6">
                <img
                    src={ihubLogo}
                    alt="iHub GAD Emblem"
                    className="h-16 w-16 sm:h-20 sm:w-20 lg:h-22 lg:w-22 xl:h-24 xl:w-24 rounded-full object-cover drop-shadow-lg border-2 border-white/20"
                />
                <div className="flex flex-col text-left pl-3 sm:pl-4 border-l-2 border-white/20">
                    <span className="text-xs sm:text-sm lg:text-base font-black text-white tracking-wider">
                        DOST Ilocos Region
                    </span>
                    <span className="text-[10px] sm:text-xs lg:text-sm font-semibold text-violet-200">
                        Innovation Hub for Gender and Development
                    </span>
                </div>
            </div>

            {/* 2. TEXT CONTENT & ACTION BUTTONS */}
            <div className="w-full flex flex-col items-center lg:items-start">
                {/* Big Bold Headline on Desktop */}
                <h1 className="text-4xl sm:text-6xl lg:text-6xl xl:text-7xl 2xl:text-[5.25rem] font-black text-white tracking-tight leading-[1.04] mb-4 sm:mb-6 drop-shadow-md">
                    Nurturing Families.{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-pink-300">
                        Empowering Women.
                    </span>
                </h1>

                {/* Engaging Subtitle on Desktop */}
                <p className="text-violet-100/90 text-sm sm:text-base lg:text-lg xl:text-xl font-medium max-w-2xl leading-relaxed mb-8 sm:mb-10 drop-shadow-xs">
                    DOST Ilocos Region’s dedicated innovation hub for child-care, maternal lactation support, and family development, providing modern welfare and resources for employees and community visitors.
                </p>

                {/* Action CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 sm:gap-4 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={onRegisterClick}
                        className="w-full sm:w-auto px-8 sm:px-9 py-4 sm:py-4.5 bg-white text-[#7030a0] hover:bg-violet-50 font-black text-xs sm:text-sm lg:text-base uppercase tracking-wider rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5 group"
                    >
                        <UserPlus size={18} className="text-[#7030a0]" />
                        <span>Register →</span>
                    </button>
                    <a
                        href="#services"
                        className="w-full sm:w-auto px-7 sm:px-8 py-4 sm:py-4.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm lg:text-base rounded-full border border-white/25 backdrop-blur-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                        <span>Explore Services</span>
                        <ChevronDown size={17} />
                    </a>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { Clock } from 'lucide-react';
import dostLogo from '../../assets/dost_logo.png';
import ihubLogo from '../../assets/ihub_logo.png';

export default function PortalNavbar({
    onRegister,
    onTimeInOutShortcut,
}) {
    return (
        <header className="sticky top-0 z-50 bg-[#7030a0] shadow-md px-4 sm:px-8 py-3 flex items-center justify-between text-white transition-all">
            {/* Left: Dual Logo Branding */}
            <div className="flex items-center gap-3">
                <img
                    src={dostLogo}
                    alt="DOST Logo"
                    className="h-10 sm:h-12 w-auto object-contain drop-shadow-md"
                />
                <div className="bg-white px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-sm flex items-center gap-2">
                    <img
                        src={ihubLogo}
                        alt="iHub GAD Emblem"
                        className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover"
                    />
                    <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        iHub<span className="text-[#7030a0]">GAD</span>
                    </span>
                </div>
            </div>

            {/* Right: Nav Links + Actions + REGISTER Button */}
            <div className="flex items-center gap-3 sm:gap-6">
                <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold text-violet-100">
                    <a href="/#services" className="hover:text-white transition-colors cursor-pointer">
                        Services
                    </a>
                    <a href="/#about" className="hover:text-white transition-colors cursor-pointer">
                        About
                    </a>
                    <a href="/#contact" className="hover:text-white transition-colors cursor-pointer">
                        Contact us
                    </a>
                </nav>

                {/* Quick Shortcut Buttons */}
                {onTimeInOutShortcut && (
                    <div className="hidden lg:flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onTimeInOutShortcut}
                            className="text-violet-100 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Time In or Out with your Code"
                        >
                            <Clock size={13} />
                            <span>Time In / Out</span>
                        </button>
                    </div>
                )}

                {/* Prominent REGISTER button */}
                <button
                    type="button"
                    onClick={onRegister}
                    className="bg-white hover:bg-violet-50 text-[#7030a0] px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                    REGISTER
                </button>
            </div>
        </header>
    );
}

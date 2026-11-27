import React from 'react';
import { Clock } from 'lucide-react';
import dostLogo from '../../assets/dost_logo.png';
import ihubLogo from '../../assets/ihublong.jpeg';

export default function PortalNavbar({
    onRegister,
    onTimeInOutShortcut,
    onLogoClick,
}) {
    const handleLogoClick = (e) => {
        if (onLogoClick) {
            e.preventDefault();
            onLogoClick();
        } else {
            const el = document.getElementById('hero');
            if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-[#7030a0] shadow-md px-4 sm:px-8 py-3 flex items-center justify-between text-white transition-all">
            {/* Left: Dual Logo Branding - Clicking redirects to hero section */}
            <a
                href="#hero"
                onClick={handleLogoClick}
                className="flex items-center gap-3 cursor-pointer group"
                title="Go to iHubGAD Portal Hero"
            >
                <img
                    src={dostLogo}
                    alt="DOST Logo"
                    className="h-10 sm:h-12 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="bg-white px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-full shadow-sm flex items-center gap-2 group-hover:scale-105 transition-transform">
                    <img
                        src={ihubLogo}
                        alt="iHub GAD Emblem"
                        className="h-8 w-auto sm:h-12 sm:w-auto rounded-full object-cover"
                    />
                </div>
            </a>

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

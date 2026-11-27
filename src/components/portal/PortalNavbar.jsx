import React, { useState, useEffect } from 'react';
import dostLogo from '../../assets/dost_logo.png';
import ihubLogo from '../../assets/ihublong.jpeg';

export default function PortalNavbar({
    onRegister,
    onTimeInOutShortcut,
    onLogoClick,
    variant = 'auto', // 'auto' | 'light' | 'dark'
}) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isLightMode = variant === 'light' || (variant === 'auto' && scrolled);

    const handleLogoClick = (e) => {
        if (onLogoClick) {
            e.preventDefault();
            onLogoClick();
        } else {
            const el = document.getElementById('hero');
            if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    return (
        <header className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 w-full px-3 sm:px-6 flex justify-center pointer-events-none transition-all duration-300">
            {/* Glassmorphism Floating Pill Container */}
            <div
                className={`w-full max-w-6xl pointer-events-auto rounded-2xl sm:rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between transition-all duration-300 ${
                    isLightMode
                        ? 'bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.08)] text-slate-800'
                        : 'bg-white/15 backdrop-blur-xl border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] text-white'
                }`}
            >
                {/* Left: Dual Logo Branding - Clicking redirects to hero section */}
                <a
                    href="#hero"
                    onClick={handleLogoClick}
                    className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
                    title="Go to iHubGAD Portal Hero"
                >
                    <img
                        src={dostLogo}
                        alt="DOST Logo"
                        className="h-8 sm:h-10 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <div className="bg-white/95 px-1.5 py-1 rounded-full shadow-xs flex items-center group-hover:scale-105 transition-transform">
                        <img
                            src={ihubLogo}
                            alt="iHub GAD Emblem"
                            className="h-6 sm:h-8 w-auto rounded-full object-cover"
                        />
                    </div>
                </a>

                {/* Center: Glassmorphism Nav Links with Active Underline Accent */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-semibold select-none">
                    <a
                        href="#hero"
                        onClick={handleLogoClick}
                        className={`transition-all duration-200 pb-0.5 ${
                            isLightMode
                                ? 'text-[#7030a0] font-bold border-b-2 border-[#7030a0]'
                                : 'text-white font-bold border-b-2 border-pink-300'
                        }`}
                    >
                        Home
                    </a>
                    <a
                        href="/#services"
                        className={`transition-all duration-200 pb-0.5 hover:border-b-2 ${
                            isLightMode
                                ? 'text-slate-600 hover:text-[#7030a0] hover:border-violet-300'
                                : 'text-violet-100/90 hover:text-white hover:border-white/50'
                        }`}
                    >
                        Services
                    </a>
                    <a
                        href="/#about"
                        className={`transition-all duration-200 pb-0.5 hover:border-b-2 ${
                            isLightMode
                                ? 'text-slate-600 hover:text-[#7030a0] hover:border-violet-300'
                                : 'text-violet-100/90 hover:text-white hover:border-white/50'
                        }`}
                    >
                        About
                    </a>
                    <a
                        href="/#contact"
                        className={`transition-all duration-200 pb-0.5 hover:border-b-2 ${
                            isLightMode
                                ? 'text-slate-600 hover:text-[#7030a0] hover:border-violet-300'
                                : 'text-violet-100/90 hover:text-white hover:border-white/50'
                        }`}
                    >
                        Contact us
                    </a>
                </nav>

                {/* Right: Prominent Glass Action Button */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={onRegister}
                        className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer ${
                            isLightMode
                                ? 'bg-[#7030a0] hover:bg-[#5b2582] text-white'
                                : 'bg-white hover:bg-violet-50 text-[#7030a0]'
                        }`}
                    >
                        REGISTER
                    </button>
                </div>
            </div>
        </header>
    );
}

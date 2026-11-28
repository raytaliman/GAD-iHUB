import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Layers, Info, Phone, UserPlus } from 'lucide-react';
import dostLogo from '../../assets/dost_logo.png';
import ihubLogo from '../../assets/ihublong.jpeg';

export default function PortalNavbar({
    onRegister,
    onTimeInOutShortcut,
    onLogoClick,
    variant = 'auto', // 'auto' | 'light' | 'dark'
}) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isLightMode = variant === 'light' || (variant === 'auto' && scrolled);

    const handleLogoClick = (e) => {
        setMobileMenuOpen(false);
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
        <>
            {/* Backdrop to close mobile menu when clicking outside */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] md:hidden pointer-events-auto transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <header className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 w-full px-3 sm:px-6 flex flex-col items-center pointer-events-none transition-all duration-300">
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

                    {/* Center: Desktop Glassmorphism Nav Links with Active Underline Accent */}
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

                    {/* Right: Desktop Action Button */}
                    <div className="hidden md:flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={onRegister}
                            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                                isLightMode
                                    ? 'bg-[#7030a0] hover:bg-[#5b2582] text-white'
                                    : 'bg-white hover:bg-violet-50 text-[#7030a0]'
                            }`}
                        >
                            <UserPlus size={16} />
                            <span>REGISTER</span>
                        </button>
                    </div>

                    {/* Mobile Hamburger Toggle Button */}
                    <div className="flex md:hidden items-center">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(prev => !prev)}
                            className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center ${
                                isLightMode
                                    ? 'bg-slate-100/80 border-slate-200/80 text-slate-700 hover:bg-slate-200'
                                    : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                            }`}
                            aria-label="Toggle navigation menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Expandable Glassmorphism Menu Drawer */}
                {mobileMenuOpen && (
                    <div
                        className={`mt-2 w-full max-w-6xl pointer-events-auto rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl border transition-all animate-in slide-in-from-top-2 fade-in duration-200 md:hidden ${
                            isLightMode
                                ? 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
                                : 'bg-[#5b2484]/95 border-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)]'
                        }`}
                    >
                        <nav className="flex flex-col gap-1 text-sm font-semibold mb-3">
                            <a
                                href="#hero"
                                onClick={(e) => {
                                    setMobileMenuOpen(false);
                                    handleLogoClick(e);
                                }}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                    isLightMode
                                        ? 'hover:bg-violet-50 text-slate-700 hover:text-[#7030a0]'
                                        : 'hover:bg-white/10 text-white'
                                }`}
                            >
                                <Home size={18} className={isLightMode ? 'text-[#7030a0]' : 'text-pink-300'} />
                                <span>Home</span>
                            </a>

                            <a
                                href="/#services"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                    isLightMode
                                        ? 'hover:bg-violet-50 text-slate-700 hover:text-[#7030a0]'
                                        : 'hover:bg-white/10 text-white'
                                }`}
                            >
                                <Layers size={18} className={isLightMode ? 'text-[#7030a0]' : 'text-pink-300'} />
                                <span>Services</span>
                            </a>

                            <a
                                href="/#about"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                    isLightMode
                                        ? 'hover:bg-violet-50 text-slate-700 hover:text-[#7030a0]'
                                        : 'hover:bg-white/10 text-white'
                                }`}
                            >
                                <Info size={18} className={isLightMode ? 'text-[#7030a0]' : 'text-pink-300'} />
                                <span>About</span>
                            </a>

                            <a
                                href="/#contact"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                    isLightMode
                                        ? 'hover:bg-violet-50 text-slate-700 hover:text-[#7030a0]'
                                        : 'hover:bg-white/10 text-white'
                                }`}
                            >
                                <Phone size={18} className={isLightMode ? 'text-[#7030a0]' : 'text-pink-300'} />
                                <span>Contact us</span>
                            </a>
                        </nav>

                        {/* Mobile Registration Button */}
                        <div className={`pt-3 border-t ${isLightMode ? 'border-slate-100' : 'border-white/15'}`}>
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    if (onRegister) onRegister();
                                }}
                                className={`w-full py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                                    isLightMode
                                        ? 'bg-[#7030a0] hover:bg-[#5b2582] text-white'
                                        : 'bg-white hover:bg-violet-50 text-[#7030a0]'
                                }`}
                            >
                                <UserPlus size={16} />
                                <span>REGISTER</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}

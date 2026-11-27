import React from 'react';
import dostLogo from '../../assets/dost_logo.png';

export default function PortalFooter() {
    return (
        <footer id="contact" className="bg-[#1e152a] text-slate-300 py-12 px-4 sm:px-8 border-t border-purple-950">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-purple-900/40 text-left">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <img src={dostLogo} alt="DOST" className="h-9 w-auto" />
                        <span className="font-black text-white text-base tracking-tight">
                            DOST Region 1 • iHub<span className="text-violet-400">GAD</span>
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Department of Science and Technology Regional Office No. 1, DMMMSU-MLUC Campus, City of San Fernando, La Union.
                    </p>
                </div>

                <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Operating Hours</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Monday to Friday: 8:00 AM – 5:00 PM<br />
                        Closed on Weekends and Official Public Holidays.
                    </p>
                </div>

                <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Facility Administration</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        For inquiries, feedback, or administrative support, contact the GAD Unit or ITSM Unit.
                    </p>
                    <a
                        href="/login"
                        className="text-[11px] font-bold text-violet-300 hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                        <span>Administrator Login →</span>
                    </a>
                </div>
            </div>

            <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium">
                <p>© {new Date().getFullYear()} DOST Ilocos Region • Developed by ITSM Unit</p>
                <p className="font-mono mt-1 sm:mt-0">v1.2.0 • Unified GAD Innovation Portal</p>
            </div>
        </footer>
    );
}

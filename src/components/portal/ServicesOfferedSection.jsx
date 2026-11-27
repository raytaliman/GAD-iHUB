import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PORTAL_SERVICES } from '../../constants/portal';

export default function ServicesOfferedSection({ onSelectService }) {
    return (
        <section id="services" className="px-4 sm:px-8 py-12 max-w-6xl mx-auto w-full border-t border-slate-100">
            <div className="flex flex-col items-center sm:items-start mb-8 text-center sm:text-left">
                <span className="text-xs font-black text-[#7030a0] uppercase tracking-wider">Facility Stations</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Services Offered
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    Explore our dedicated stations designed to cater to mothers, toddlers, and GAD learners.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PORTAL_SERVICES.map((service) => (
                    <div
                        key={service.id}
                        onClick={() => onSelectService(service.label)}
                        className="group bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 hover:border-[#7030a0] shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[380px]"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${service.badgeBg}`}>
                                    {service.badge}
                                </span>
                                <span className="text-4xl group-hover:scale-125 transition-transform duration-300">
                                    {service.emoji}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 group-hover:text-[#7030a0] transition-colors mb-1.5">
                                {service.label}
                            </h3>
                            <p className="text-xs font-bold text-[#7030a0]/90 mb-3">
                                {service.tagline}
                            </p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                                {service.desc}
                            </p>

                            <div className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                                {service.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#7030a0]" />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full py-3 bg-violet-50 group-hover:bg-[#7030a0] text-[#7030a0] group-hover:text-white rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                            <span>Time In For This Service</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

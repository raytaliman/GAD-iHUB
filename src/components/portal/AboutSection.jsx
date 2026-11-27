import React from 'react';
import { Baby, ShieldCheck, BookOpen } from 'lucide-react';

export default function AboutSection() {
    return (
        <section id="about" className="bg-[#FAF9FC] py-14 px-4 sm:px-8 border-y border-slate-200/70">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <span className="text-xs font-black text-[#7030a0] uppercase tracking-wider block mb-1">
                        About iHubGAD
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Creating an Inclusive & Safe Workplace
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2 max-w-xl mx-auto">
                        The DOST Region 1 Innovation Hub for Gender and Development provides institutional care, child supervision, and maternal accommodations.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-4">
                            <Baby size={24} />
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-base mb-2">Child-Safe Standards</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">
                            Equipped with non-toxic play gear, sanitized bedding, and secure entrance monitoring for every child.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-violet-50 text-[#7030a0] rounded-2xl flex items-center justify-center mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-base mb-2">Data Privacy Act (DPA)</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">
                            Strict compliance with Republic Act 10173 ensuring visitor records and children identities are securely encrypted.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                            <BookOpen size={24} />
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-base mb-2">Continuous Learning</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">
                            Access up-to-date gender sensitivity handbooks, Philippine laws for women, and research literature.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

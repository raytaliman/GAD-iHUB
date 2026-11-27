import React, { useState } from 'react';
import { Sparkles, FileText, Heart, CheckCircle2, ChevronLeft } from 'lucide-react';
import PortalNavbar from './PortalNavbar';
import { EVAL_OPTIONS, OVERALL_SATISFACTION_OPTIONS } from '../../constants/feedback';

export default function EvaluationFormView({
    formParts,
    formData,
    handleInputChange,
    currentPart,
    setCurrentPart,
    totalParts,
    submitting,
    submitEvaluation,
    showThankYou,
    onCompleteReturnHome,
    verifiedEvalVisitor,
}) {
    const [showBackConfirm, setShowBackConfirm] = useState(false);

    const goNext = () => {
        if (currentPart === totalParts - 1) { 
            submitEvaluation(); 
        } else { 
            setCurrentPart(p => Math.min(p + 1, totalParts - 1)); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9FC] flex flex-col font-sans select-none text-slate-800">
            {/* Top Sticky Header - Stays identical to landing page */}
            <PortalNavbar
                onRegister={onCompleteReturnHome}
                onTimeInOutShortcut={() => setShowBackConfirm(true)}
            />

            <main className="flex-1 flex flex-col items-center px-4 py-6 sm:py-10 max-w-4xl mx-auto w-full">
                {/* Back to Portal Bar directly inside the form */}
                {!showThankYou && (
                    <div className="w-full max-w-2xl mb-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setShowBackConfirm(true)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#7030a0] bg-white border border-slate-200 hover:border-violet-300 px-3.5 py-1.5 rounded-full transition-all shadow-sm cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                            <span>Back to Portal</span>
                        </button>
                        <span className="text-[11px] font-black text-violet-700 bg-violet-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            CSM Evaluation Survey
                        </span>
                    </div>
                )}
                {/* Thank You Screen for Evaluation */}
                {showThankYou ? (
                    <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-emerald-200 shadow-2xl shadow-emerald-50 text-center animate-in zoom-in-95 duration-400">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-inner">
                            <CheckCircle2 size={36} />
                        </div>
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                            ✓ Feedback Submitted
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            Thank You for Your Feedback!
                        </h3>
                        <p className="text-slate-600 text-xs sm:text-sm font-medium mb-6 leading-relaxed">
                            Your departure has been recorded and your valuable insights will directly help us improve our services for women and children at DOST Region 1.
                        </p>

                        <button
                            type="button"
                            onClick={onCompleteReturnHome}
                            className="w-full py-4 bg-[#7030a0] hover:bg-[#5b2484] text-white rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                            Return to Portal Home
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Survey Header Banner */}
                        <div className="text-center mb-8 max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-violet-100 text-[#7030a0] rounded-full text-xs font-black tracking-wider uppercase mb-3">
                                <Sparkles size={13} />
                                <span>Client Satisfaction Measurement (CSM)</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                                Service Evaluation Survey
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                                Your honest feedback helps DOST Region 1 maintain a safe, welcoming, and empowering environment for all women and children.
                            </p>
                        </div>

                        {/* Progress Bar & Parts Stepper */}
                        <div className="w-full max-w-2xl mb-8">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                                <span>Step {currentPart} of {totalParts}</span>
                                <span className="text-[#7030a0] font-extrabold">
                                    {currentPart === totalParts ? 'Comments & Suggestions' : formParts[currentPart - 1]?.label || 'Evaluation'}
                                </span>
                            </div>
                            <div className="flex gap-1.5 w-full">
                                {Array.from({ length: totalParts }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-2 rounded-full flex-1 transition-all duration-300 ${
                                            idx + 1 === currentPart
                                                ? 'bg-[#7030a0]'
                                                : idx + 1 < currentPart
                                                ? 'bg-violet-300'
                                                : 'bg-slate-200'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Active Visit Info Card */}
                        {formData.serviceAvailed && (
                            <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-2xl px-5 py-3.5 mb-6 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-violet-50 text-[#7030a0] flex items-center justify-center text-lg">
                                        {formData.serviceAvailed.includes('Child') ? '👶' : formData.serviceAvailed.includes('Mother') ? '🤱' : '📚'}
                                    </div>
                                    <div className="text-left">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Evaluating Service</span>
                                        <span className="text-xs font-black text-slate-800">{formData.serviceAvailed}</span>
                                    </div>
                                </div>
                                {verifiedEvalVisitor && (
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Visitor</span>
                                        <span className="text-xs font-extrabold text-[#7030a0]">{verifiedEvalVisitor.parent_name}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Form Questions Card (Parts 1 to formParts.length) */}
                        {currentPart >= 1 && currentPart <= formParts.length && (() => {
                            const partIndex = currentPart - 1;
                            const part = formParts[partIndex];
                            if (!part) return null;

                            return (
                                <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-xl shadow-slate-100 text-left animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="pb-4 mb-6 border-b border-slate-100">
                                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                            <FileText className="text-[#7030a0]" size={22} />
                                            <span>{part.label}</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 font-semibold mt-1">
                                            Please select the rating that best reflects your experience:
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {part.questions.map((q, qIdx) => (
                                            <div key={q.key} className="space-y-3 pb-5 border-b border-slate-100 last:border-b-0">
                                                <label className="text-xs sm:text-sm font-extrabold text-slate-800 block">
                                                    {qIdx + 1}. {q.label}
                                                </label>

                                                {/* Emoji Satisfaction Scale (5 ratings) */}
                                                {q.answerType === 'emoji' ? (
                                                    <div className="grid grid-cols-5 gap-2 sm:gap-3 bg-slate-50 p-2 sm:p-3 rounded-2xl border border-slate-100">
                                                        {EVAL_OPTIONS.map(opt => {
                                                            const isSelected = formData[q.key] === opt.value;
                                                            return (
                                                                <button
                                                                    key={opt.value}
                                                                    type="button"
                                                                    onClick={() => handleInputChange(q.key, opt.value)}
                                                                    className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer ${
                                                                        isSelected
                                                                            ? 'bg-white shadow-md ring-2 ring-[#7030a0] scale-105'
                                                                            : 'hover:bg-white hover:shadow-sm'
                                                                    }`}
                                                                >
                                                                    <div className="relative">
                                                                        <span className="text-2xl sm:text-3xl block group-hover:scale-110 transition-transform">
                                                                            {opt.emoji}
                                                                        </span>
                                                                        {isSelected && (
                                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#7030a0] text-white rounded-full flex items-center justify-center text-[10px]">
                                                                                ✓
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span className={`text-[9px] sm:text-[10px] font-bold text-center leading-tight ${
                                                                        isSelected ? 'text-[#7030a0] font-black' : 'text-slate-500'
                                                                    }`}>
                                                                        {opt.label}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : q.answerType === 'satisfaction' ? (
                                                    <div className="space-y-2">
                                                        {OVERALL_SATISFACTION_OPTIONS.map(opt => {
                                                            const isSelected = formData[q.key] === opt.label;
                                                            return (
                                                                <button
                                                                    key={opt.label}
                                                                    type="button"
                                                                    onClick={() => handleInputChange(q.key, opt.label)}
                                                                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                                                        isSelected
                                                                            ? `${opt.activeBg} border-[#7030a0] ring-2 ring-[#7030a0] shadow-sm font-bold`
                                                                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                                                    }`}
                                                                >
                                                                    <span className="text-2xl">{opt.emoji}</span>
                                                                    <span className="text-xs sm:text-sm font-bold text-slate-800">{opt.label}</span>
                                                                    {isSelected && (
                                                                        <span className="ml-auto w-5 h-5 bg-[#7030a0] text-white rounded-full flex items-center justify-center text-xs">
                                                                            ✓
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <textarea
                                                        className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all text-xs resize-none h-28 bg-slate-50 focus:bg-white"
                                                        placeholder="Type your answer here..."
                                                        value={formData[q.key] || ''}
                                                        onChange={e => handleInputChange(q.key, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Wizard Navigation */}
                                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (currentPart === 1) {
                                                    setShowBackConfirm(true);
                                                } else {
                                                    setCurrentPart(p => p - 1);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }
                                            }}
                                            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={goNext}
                                            className="px-7 py-3.5 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2484] text-white rounded-xl font-bold text-xs shadow-md shadow-violet-200 hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                                        >
                                            <span>Continue to Next Step →</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Final Step: Suggestions for Improvement */}
                        {currentPart === totalParts && (
                            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-xl shadow-slate-100 text-left animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="pb-4 mb-6 border-b border-slate-100">
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <Heart className="text-[#7030a0]" size={22} />
                                        <span>Suggestions for Improvement</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 font-semibold mt-1">
                                        Please share your feedback or recommendations to help us enhance our facilities and services:
                                    </p>
                                </div>

                                <textarea
                                    className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all text-xs sm:text-sm resize-none h-40 bg-slate-50 focus:bg-white text-slate-800 leading-relaxed mb-6"
                                    placeholder="Write your comments and suggestions here (optional)..."
                                    value={formData.comments}
                                    onChange={e => handleInputChange('comments', e.target.value)}
                                />

                                <div className="pt-6 border-t border-slate-100 flex justify-between items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentPart(p => p - 1);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submitEvaluation}
                                        disabled={submitting}
                                        className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2484] text-white rounded-xl font-bold text-sm shadow-md shadow-violet-200 hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Submitting Evaluation...</span>
                                            </>
                                        ) : (
                                            <span>Submit Evaluation ✨</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Back Confirmation Dialog */}
            {showBackConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setShowBackConfirm(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-slate-900 mb-2">Exit Evaluation?</h3>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                            If you exit now, any answers you have selected so far will not be saved. Are you sure you want to return to the portal home?
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowBackConfirm(false)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Continue Survey
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowBackConfirm(false);
                                    onCompleteReturnHome();
                                }}
                                className="flex-1 py-3 rounded-xl bg-[#7030a0] hover:bg-[#5b2783] text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                                Exit to Portal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

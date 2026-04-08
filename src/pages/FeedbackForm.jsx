import React, { useState } from 'react';
import { Share, Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, Smile, Meh, Frown, UserCircle, Building2, FileText, Heart, Sparkles, Baby, Palette, PartyPopper, Shapes } from 'lucide-react';
import logo from '../assets/logo.png';
import ModernSelect from '../components/common/ModernSelect';
import ModernDatePicker from '../components/common/ModernDatePicker';
import { useFeedbackForm } from '../hooks/useFeedbackForm';
import {
    OFFICE_UNIT_OPTIONS,
    ILOCOS_REGION_DATA,
    EVAL_OPTIONS,
    OVERALL_SATISFACTION_OPTIONS
} from '../constants/feedback';

/**
 * The main public-facing Feedback Form component for the Innovation Hub for GAD.
 * This component handles the multi-step flow for guest registration and subsequent service evaluation.
 * 
 * Flow Summary:
 * 1. Cover Page: Introduction and choice between 'Start Registration' or 'Submit Evaluation'.
 * 2. Registration: Collects parent and child information, generates a unique code.
 * 3. Evaluation: Requires a unique code, provides a dynamic survey based on form parts defined in the database.
 * 4. Thank You: Final confirmation screen with code display (for registration).
 * 
 * Uses the `useFeedbackForm` hook for state management and API interactions.
 */
export default function FeedbackForm() {
    const {
        formParts,
        formData,
        flowType,
        setFlowType,
        userCode,
        setUserCode,
        codeValidated,
        generatedCode,
        currentPart,
        setCurrentPart,
        showCoverPage,
        setShowCoverPage,
        showThankYou,
        submitting,
        handleInputChange,
        handleChildChange,
        addChild,
        removeChild,
        submitRegistration,
        validateUserCode,
        submitEvaluation,
        resetForm,
        totalParts,
    } = useFeedbackForm();

    const [showStationModal, setShowStationModal] = useState(false);
    const [showBackConfirm, setShowBackConfirm] = useState(false);

    /**
     * Navigation handler for the multi-step survey.
     * Transitions between registration steps and evaluation parts.
     */
    const goNext = () => {
        if (flowType === 'register') { submitRegistration(); return; }
        if (currentPart === totalParts - 1) { submitEvaluation(); }
        else { setCurrentPart(p => Math.min(p + 1, totalParts - 1)); window.scrollTo(0, 0); }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Navbar */}
            {showCoverPage && flowType === null && !showThankYou && (
                <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Logo" className="h-14 w-auto" />
                    </div>
                    <a href="/login" className="px-4 py-1.5 rounded-full text-sm font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors">
                        Login as Admin
                    </a>
                </nav>
            )}

            <main className="flex-1 flex justify-center bg-white border-x border-slate-100 max-w-md mx-auto w-full">
                <div className="w-full flex flex-col relative h-[calc(100vh-57px)] overflow-y-auto pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                    {/* Header Banner - Child Friendly */}
                    <div className="bg-[#7030a0] px-6 py-12 text-center relative overflow-hidden shrink-0">
                        {/* Floating Shapes */}
                        <div className="absolute top-4 left-4 text-white/20 animate-float">
                            <Shapes size={48} />
                        </div>
                        <div className="absolute top-20 right-10 text-white/20 animate-float-delayed">
                            <Heart size={32} />
                        </div>
                        <div className="absolute bottom-4 left-1/4 text-white/10 animate-float">
                            <Sparkles size={24} />
                        </div>
                        <div className="absolute top-1/2 right-4 text-white/15 animate-bounce-subtle">
                            <Baby size={40} />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-bold text-white tracking-widest mb-4 backdrop-blur-md border border-white/20 shadow-xl animate-pulse-soft">
                                <PartyPopper size={12} className="inline mr-2 -mt-0.5" />
                                WELCOME TO INNOVATION HUB
                            </div>
                            <h1 className="text-3xl font-black text-white mb-2 drop-shadow-md">Innovation Hub for GAD</h1>
                            <div className="flex flex-col items-center text-center leading-tight text-violet-100 font-medium">
                                <div className="flex items-center gap-2">
                                    <Heart size={16} className="fill-current text-pink-400 shrink-0" />
                                    <span>A Safe & Joyful Space for</span>
                                    <Heart size={16} className="fill-current text-pink-400 shrink-0" />
                                </div>
                                <span>Women and Children</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6">

                        {showCoverPage && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="flex justify-center items-center gap-6 mb-8 mt-2 animate-bounce-subtle">
                                    <img src="/DOST_seal.png" alt="DOST Seal" className="h-20 w-auto drop-shadow-md" />
                                    <img src="/Bagong_Pilipinas_Logo.svg" alt="Bagong Pilipinas" className="h-20 w-auto drop-shadow-md" />
                                </div>

                                <div className="flex justify-center mb-8">
                                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-700">
                                        <img src={logo} alt="iHub GAD Logo" className="h-20 w-auto" />
                                    </div>
                                </div>


                                <div className="bg-gradient-to-br from-violet-50 to-white rounded-3xl p-5 border border-violet-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 mb-8">
                                    <div className="absolute top-0 right-0 p-3 text-violet-200 group-hover:text-violet-300 transition-colors">
                                        <Sparkles size={40} />
                                    </div>
                                    <h4 className="font-bold text-violet-900 mb-1 flex items-center gap-2">
                                        <Baby size={18} className="text-violet-500" />
                                        Nurturing Progress
                                    </h4>
                                    <p className="text-xs text-violet-700/70 leading-relaxed">
                                        Your feedback helps us improve the safe, caring environment for our Women and children.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <button
                                        onClick={() => setShowStationModal(true)}
                                        className="group bg-[#7030a0] hover:bg-[#5b2783] text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-violet-100 flex flex-col items-center justify-center gap-1 active:scale-95 text-center"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">Start Registration</span>
                                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { setFlowType('evaluate'); setShowCoverPage(false); }}
                                        className="bg-white border-2 border-slate-100 hover:border-violet-200 hover:bg-violet-50 text-slate-600 hover:text-[#7030a0] py-4 rounded-2xl font-bold transition-all active:scale-95 text-center flex flex-col items-center justify-center"
                                    >
                                        <span className="text-sm">Submit Evaluation</span>
                                    </button>
                                </div>

                                <div className="bg-amber-50/50 rounded-3xl p-5 border border-amber-100/50">
                                    <span className="font-bold text-amber-800 text-xs uppercase tracking-widest block mb-2 opacity-60">Privacy Policy</span>
                                    <p className="text-[11px] text-amber-900/60 leading-relaxed italic">
                                        "All information is safe with us, handled privately following the Data Privacy Act of 2012."
                                    </p>
                                </div>
                            </div>
                        )}

                        {showThankYou && (
                            <div className="text-center animate-in zoom-in-95 duration-500 py-8">
                                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                    {flowType === 'register' ? 'Registration Complete!' : 'Thank You!'}
                                </h3>
                                {flowType === 'register' ? (
                                    <>
                                        <p className="text-slate-600 mb-6">Your registration is complete. Please save your code below to submit your evaluation later.</p>
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
                                            <span className="text-sm font-medium text-slate-500 mb-2 block">Your Unique Code</span>
                                            <span className="text-4xl font-black text-[#7030a0] tracking-widest">{generatedCode}</span>
                                            <p className="mt-4 text-xs text-red-500 font-medium">⚠️ Save this code! You cannot retrieve it later.</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                                        Your response will help us maintain a safe, nurturing, and supportive environment for children and parents alike.
                                    </p>
                                )}
                                <button onClick={resetForm} className="bg-[#7030a0] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#5b2783] transition">
                                    {flowType === 'register' ? 'Done' : 'Submit Another'}
                                </button>
                            </div>
                        )}

                        {flowType === 'evaluate' && !codeValidated && !showThankYou && !showCoverPage && (
                            <div className="animate-in fade-in duration-300">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Enter Your Code</h3>
                                <p className="text-slate-600 mb-6 text-sm">Please enter the 5-digit code you received during registration.</p>
                                <input
                                    type="text" maxLength={5} value={userCode} onChange={(e) => setUserCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="00000"
                                    className="w-full text-center text-3xl tracking-widest font-bold py-4 rounded-xl border border-slate-300 focus:border-[#7030a0] focus:ring-2 focus:ring-violet-200 outline-none mb-6 transition"
                                />
                                <button onClick={validateUserCode} disabled={userCode.length !== 5 || submitting} className="w-full bg-[#7030a0] disabled:bg-slate-300 text-white py-3.5 rounded-xl font-semibold transition mb-3">
                                    {submitting ? 'Verifying...' : 'Continue'}
                                </button>
                                <button onClick={resetForm} className="w-full text-slate-500 py-3.5 font-medium hover:bg-slate-50 rounded-xl transition">Back to Home</button>
                            </div>
                        )}

                        {/* Registration Flow Part I */}
                        {flowType === 'register' && !showThankYou && !showCoverPage && (
                            <div className="animate-in slide-in-from-right-8 duration-300">
                                <div className="mb-6 flex items-center justify-between text-sm text-slate-500 font-medium">
                                    <span>Part 1 of {totalParts}</span>
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalParts }).map((_, i) => (
                                            <div key={i} className={`w-8 h-1.5 rounded-full ${i === 0 ? 'bg-[#7030a0]' : 'bg-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Part I. Basic Information</h3>

                                <div className="space-y-5 mb-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">First Name <span className="text-red-500">*</span></label>
                                            <input type="text" className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm" placeholder="e.g. Maria" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Last Name <span className="text-red-500">*</span></label>
                                            <input type="text" className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm" placeholder="e.g. Santos" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} />
                                        </div>
                                    </div>
                                    {formData.serviceAvailed !== 'Mother and Child Care' && (
                                        <ModernSelect
                                            label="Sex"
                                            value={formData.sex}
                                            options={['Male', 'Female']}
                                            onChange={val => handleInputChange('sex', val)}
                                            placeholder="Select sex"
                                            icon={UserCircle}
                                        />
                                    )}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Contact Number <span className="text-red-500">*</span></label>
                                        <div className="flex shadow-sm rounded-2xl overflow-hidden border border-slate-200 focus-within:border-[#7030a0] focus-within:ring-4 focus-within:ring-violet-100 transition-all">
                                            <div className="bg-slate-50 border-r border-slate-200 px-5 py-4 text-slate-600 font-semibold">+63</div>
                                            <input type="tel" maxLength={10} placeholder="912 345 6789" className="w-full p-4 outline-none" value={formData.contactNumber} onChange={e => handleInputChange('contactNumber', e.target.value.replace(/\D/g, ''))} />
                                        </div>
                                    </div>
                                    <ModernSelect
                                        label="Client"
                                        value={formData.clientType}
                                        options={['Internal', 'External']}
                                        onChange={val => {
                                            handleInputChange('clientType', val);
                                            handleInputChange('officeUnitAddress', '');
                                            handleInputChange('officeUnitOther', '');
                                        }}
                                        placeholder="Select client type"
                                        icon={UserCircle}
                                    />

                                    {formData.clientType === 'Internal' ? (
                                        <ModernSelect
                                            label="Office/Unit/Address"
                                            value={formData.officeUnitAddress}
                                            options={OFFICE_UNIT_OPTIONS}
                                            onChange={val => {
                                                handleInputChange('officeUnitAddress', val);
                                                if (val !== 'Others') handleInputChange('officeUnitOther', '');
                                            }}
                                            placeholder="Select office or unit"
                                            icon={Building2}
                                        />
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Office/Unit/Address <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                placeholder="Enter your office/unit/address"
                                                className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm"
                                                value={formData.officeUnitOther}
                                                onChange={e => handleInputChange('officeUnitOther', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {formData.officeUnitAddress === 'Others' && formData.clientType === 'Internal' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Please specify address</label>
                                            <input type="text" placeholder="Type your office/unit/address" className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm" value={formData.officeUnitOther} onChange={e => handleInputChange('officeUnitOther', e.target.value)} />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-5 pt-2">
                                        <ModernSelect
                                            label="Province"
                                            value={formData.province}
                                            options={Object.keys(ILOCOS_REGION_DATA)}
                                            onChange={val => {
                                                handleInputChange('province', val);
                                                handleInputChange('city', '');
                                                handleInputChange('barangay', '');
                                            }}
                                            placeholder="Select Province"
                                            icon={FileText}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <ModernSelect
                                                label="City/Municipality"
                                                value={formData.city}
                                                options={formData.province ? Object.keys(ILOCOS_REGION_DATA[formData.province]) : []}
                                                onChange={val => {
                                                    handleInputChange('city', val);
                                                    handleInputChange('barangay', '');
                                                }}
                                                placeholder="Select City"
                                                disabled={!formData.province}
                                            />
                                            <ModernSelect
                                                label="Barangay"
                                                value={formData.barangay}
                                                options={(formData.province && formData.city) ? ILOCOS_REGION_DATA[formData.province][formData.city] : []}
                                                onChange={val => handleInputChange('barangay', val)}
                                                placeholder="Select Barangay"
                                                disabled={!formData.city}
                                            />
                                        </div>
                                    </div>
                                    <ModernDatePicker
                                        label="Date of Use"
                                        value={formData.dateOfUse}
                                        onChange={val => handleInputChange('dateOfUse', val)}
                                        placeholder="Select Date"
                                    />
                                </div>

                                <h4 className="font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 text-lg">Children Information</h4>
                                {formData.children.map((child, i) => (
                                    <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm mb-5 relative">
                                        <div className="flex justify-between items-center mb-5 md:pl-2">
                                            <span className="font-bold text-slate-800 text-base">Child {i + 1}</span>
                                            {formData.children.length > 1 && (
                                                <button onClick={() => removeChild(i)} className="text-red-500 text-sm font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                                                    Discard
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-5 md:pl-2">
                                            <input
                                                type="text"
                                                placeholder="Name of Child *"
                                                className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm"
                                                value={child.name}
                                                onChange={e => handleChildChange(i, 'name', e.target.value)}
                                            />
                                            <div className="flex gap-4 items-start">
                                                <div className="w-1/3">
                                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block px-1">
                                                        {formData.serviceAvailed === 'Mother and Child Care' ? 'Age (months) *' : 'Age *'}
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        maxLength={2}
                                                        placeholder={formData.serviceAvailed === 'Mother and Child Care' ? 'Months *' : 'Age *'}
                                                        className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm text-center font-medium"
                                                        value={child.age}
                                                        onChange={e => handleChildChange(i, 'age', e.target.value.replace(/\D/g, ''))}
                                                    />
                                                </div>
                                                <div className="w-2/3">
                                                    <ModernSelect
                                                        label="Sex *"
                                                        value={child.sex}
                                                        options={['Male', 'Female']}
                                                        onChange={val => handleChildChange(i, 'sex', val)}
                                                        placeholder="Select Sex"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {formData.serviceAvailed === 'Mother and Child Care' && (
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Activities <span className="text-red-500">*</span></label>
                                        <textarea
                                            placeholder="Describe the activities (e.g. Breastfeeding, diaper change, checkunp, etc.)"
                                            className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm resize-none h-24"
                                            value={formData.activities}
                                            onChange={e => handleInputChange('activities', e.target.value)}
                                        />
                                    </div>
                                )}
                                <button onClick={addChild} className="w-full py-4 mt-2 mb-6 rounded-2xl border-2 border-dashed border-violet-200 text-[#7030a0] font-semibold hover:bg-violet-50 transition-all flex items-center justify-center gap-2">
                                    <span className="text-xl leading-none mb-0.5">+</span> Add Another Child
                                </button>

                                <div className="mt-8 mb-4 w-full flex gap-4">
                                    <button onClick={() => { setFlowType(null); setShowCoverPage(true); }} className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm bg-white font-medium flex-shrink-0">
                                        Cancel
                                    </button>
                                    <button onClick={goNext} disabled={submitting} className="flex-1 bg-[#7030a0] text-white py-4 rounded-2xl font-bold hover:bg-[#5b2783] hover:shadow-xl hover:shadow-violet-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200/50 text-lg">
                                        {submitting ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Evaluation Flow - Form Parts */}
                        {flowType === 'evaluate' && codeValidated && !showThankYou && currentPart >= 1 && currentPart <= formParts.length && (() => {
                            const partIndex = currentPart - 1;
                            const part = formParts[partIndex];
                            const hasEmoji = part.questions.some(q => q.answerType === 'emoji');
                            return (
                                <div key={part.key} className="animate-in slide-in-from-right-8 duration-300">
                                    <div className="mb-6 flex items-center justify-between text-sm text-slate-500 font-medium">
                                        <span>Part {currentPart + 1} of {totalParts}</span>
                                        <div className="flex gap-1">
                                            {Array.from({ length: totalParts }).map((_, i) => (
                                                <div key={i} className={`w-8 h-1.5 rounded-full ${i === currentPart ? 'bg-[#7030a0]' : i < currentPart ? 'bg-violet-300' : 'bg-slate-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">{part.label}</h3>
                                    <p className="text-slate-600 text-sm mb-6 pb-4 border-b border-slate-200">{hasEmoji ? 'Please check the box that best reflects your experience:' : 'Please answer each question.'}</p>

                                    <div className="space-y-8">
                                        {part.questions.map(q => (
                                            <div key={q.key} className="space-y-4">
                                                <label className="text-[15px] font-semibold text-slate-700 block ml-1">{q.label}</label>
                                                {q.answerType === 'text' ? (
                                                    <textarea className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm resize-none h-28" placeholder="Type your answer..." value={formData[q.key] || ''} onChange={e => handleInputChange(q.key, e.target.value)}></textarea>
                                                ) : q.answerType === 'satisfaction' ? (
                                                    <div className="space-y-3">
                                                        {OVERALL_SATISFACTION_OPTIONS.map(opt => {
                                                            const isSelected = formData[q.key] === opt.label;
                                                            return (
                                                                <button
                                                                    key={opt.label}
                                                                    onClick={() => handleInputChange(q.key, opt.label)}
                                                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${isSelected ? `${opt.activeBg} border-transparent ring-2 ring-offset-1 ring-${opt.color.split('-')[1]}-400 shadow-md transform scale-[1.02]` : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                                                >
                                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm ring-1 ring-slate-100`}>
                                                                        <span className="text-2xl">{opt.emoji}</span>
                                                                    </div>
                                                                    <span className={`font-semibold text-lg ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{opt.label}</span>
                                                                    {isSelected && <div className={`ml-auto w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm ${opt.color}`}><Check size={16} strokeWidth={3} /></div>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : q.answerType === 'radio' ? (
                                                    <div className="space-y-3">
                                                        {(q.options || []).map(optLabel => {
                                                            const isSelected = formData[q.key] === optLabel;
                                                            return (
                                                                <button
                                                                    key={optLabel}
                                                                    onClick={() => handleInputChange(q.key, optLabel)}
                                                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-[#7030a0] bg-violet-50' : 'border-slate-100 hover:border-violet-200 hover:bg-slate-50 text-slate-700'}`}
                                                                >
                                                                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'border-[#7030a0] bg-[#7030a0]' : 'border-slate-300'}`}>
                                                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                                                                    </div>
                                                                    <span className={`font-semibold text-lg transition-colors ${isSelected ? 'text-[#7030a0]' : 'text-slate-700'}`}>
                                                                        {optLabel}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-center gap-1 sm:gap-2">
                                                        {EVAL_OPTIONS.map(opt => {
                                                            const isSelected = formData[q.key] === opt.value;
                                                            return (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => handleInputChange(q.key, opt.value)}
                                                                    className="group flex flex-col items-center gap-2 flex-1 focus:outline-none"
                                                                >
                                                                    <div className="relative">
                                                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isSelected ? `${opt.bg} ${opt.activeBorder} scale-110 shadow-sm` : 'bg-transparent border-violet-100 group-hover:border-violet-300 group-hover:bg-violet-50/50'}`}>
                                                                            <span className="text-2xl sm:text-3xl">{opt.emoji}</span>
                                                                        </div>
                                                                        {isSelected && (
                                                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#7030a0] rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in duration-200">
                                                                                <Check size={12} strokeWidth={3} className="text-white" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span className={`text-[10px] sm:text-[11px] font-medium text-center ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                                                                        {opt.label}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 w-full flex gap-4">
                                        {currentPart === 1 ? (
                                            <button onClick={() => setShowBackConfirm(true)} className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm bg-white font-medium flex-shrink-0">
                                                <ChevronLeft size={22} />
                                            </button>
                                        ) : currentPart > 1 && (
                                            <button onClick={() => setCurrentPart(p => p - 1)} className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm bg-white font-medium flex-shrink-0">
                                                <ChevronLeft size={22} />
                                            </button>
                                        )}
                                        <button onClick={goNext} disabled={submitting} className="flex-1 bg-[#7030a0] text-white py-4 rounded-2xl font-bold hover:bg-[#5b2783] hover:shadow-xl hover:shadow-violet-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200/50 text-lg">
                                            {submitting ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'Continue'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Comments Part */}
                        {flowType === 'evaluate' && codeValidated && !showThankYou && currentPart === totalParts - 1 && (
                            <div className="animate-in slide-in-from-right-8 duration-300">
                                <div className="mb-6 flex items-center justify-between text-sm text-slate-500 font-medium">
                                    <span>Part {currentPart + 1} of {totalParts}</span>
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalParts }).map((_, i) => (
                                            <div key={i} className={`w-8 h-1.5 rounded-full ${i === currentPart ? 'bg-[#7030a0]' : i < currentPart ? 'bg-violet-300' : 'bg-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Suggestions for Improvement</h3>
                                <p className="text-slate-600 text-sm mb-6">Please share your comments and recommendations to help us enhance the facility and services:</p>
                                <textarea className="w-full p-5 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm resize-none h-40" placeholder="Type your comments and recommendations here..." value={formData.comments} onChange={e => handleInputChange('comments', e.target.value)}></textarea>

                                <div className="mt-8 mb-4 w-full flex gap-4">
                                    <button onClick={() => setCurrentPart(p => p - 1)} className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm bg-white font-medium flex-shrink-0">
                                        <ChevronLeft size={22} />
                                    </button>
                                    <button onClick={goNext} disabled={submitting} className="flex-1 bg-[#7030a0] text-white py-4 rounded-2xl font-bold hover:bg-[#5b2783] hover:shadow-xl hover:shadow-violet-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200/50 text-lg">
                                        {submitting ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Station Selection Modal */}
                    {showStationModal && (() => {
                        const stations = [
                            { id: 'child-minding', label: 'Child Minding Station', emoji: '🧒', desc: 'Child-minding services for employees' },
                            { id: 'mother-child', label: 'Mother and Child Care', emoji: '🤱', desc: 'Care services for mothers and children' },
                            { id: 'gad-learning', label: 'GAD Learning Resource Center', emoji: '📚', desc: 'Gender and development learning resources' },
                        ];
                        return (
                            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm" onClick={() => setShowStationModal(false)}>
                                <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                                    <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">Services Available</h3>
                                    <p className="text-slate-500 text-sm mb-5">Which service are you registering for?</p>
                                    <div className="flex flex-col gap-3 mb-5">
                                        {stations.map(station => {
                                            const isSelected = formData.serviceAvailed === station.label;
                                            return (
                                                <button
                                                    key={station.id}
                                                    onClick={() => handleInputChange('serviceAvailed', station.label)}
                                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-[#7030a0] bg-violet-50' : 'border-slate-100 hover:border-violet-200 hover:bg-slate-50'}`}
                                                >
                                                    <span className="text-3xl">{station.emoji}</span>
                                                    <div className="flex-1">
                                                        <div className={`font-semibold transition-colors ${isSelected ? 'text-[#7030a0]' : 'text-slate-800'}`}>{station.label}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{station.desc}</div>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'border-[#7030a0] bg-[#7030a0]' : 'border-slate-300'}`}>
                                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        disabled={!formData.serviceAvailed}
                                        onClick={() => { setShowStationModal(false); setFlowType('register'); setShowCoverPage(false); }}
                                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${formData.serviceAvailed ? 'bg-[#7030a0] text-white hover:bg-[#5b2783] shadow-lg shadow-violet-200/50' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                    >
                                        Continue
                                    </button>
                                    <button onClick={() => { setShowStationModal(false); handleInputChange('serviceAvailed', ''); }} className="mt-3 w-full py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Back Confirmation Modal */}
                    {showBackConfirm && (
                        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setShowBackConfirm(false)}>
                            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Go back to cover page?</h3>
                                <p className="text-slate-500 text-sm mb-6">Your code entry will be cleared and you'll need to re-enter it. Your answers will be lost.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowBackConfirm(false)} className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
                                        Stay
                                    </button>
                                    <button onClick={() => { setShowBackConfirm(false); setShowCoverPage(true); setCodeValidated(false); setFlowType(null); setCurrentPart(0); setUserCode(''); }} className="flex-1 py-3.5 rounded-2xl bg-[#7030a0] text-white font-semibold hover:bg-[#5b2783] transition-colors">
                                        Yes, go back
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main >
        </div >
    );
}

import React from 'react';
import {
    Clock, Camera, AlertCircle, ChevronLeft, Baby, Check, CheckCircle2, ChevronDown
} from 'lucide-react';
import { PORTAL_SERVICES } from '../../constants/portal';

export default function VisitorVerificationCard({
    portalFlowState,
    portalCodeInput,
    setPortalCodeInput,
    codeInputRef,
    isVerifyingCode,
    verificationWarning,
    showScanner,
    startScanner,
    stopScanner,
    scannerLoading,
    videoRef,
    canvasRef,
    onVerifyCode,
    onRegisterClick,
    onResetPortal,
    // Select Service state
    activeVisitorProfile,
    selectedServiceForTimeIn,
    setSelectedServiceForTimeIn,
    selectedChildren,
    setSelectedChildren,
    isRecordingTimeIn,
    onConfirmTimeIn,
    // Confirm Time Out state
    activeVisitRecord,
    isRecordingTimeOut,
    onConfirmTimeoutAndProceedToEval,
    formatDuration,
    // Success state
    timeInSuccessData,
}) {
    return (
        <div className="w-full flex-1 flex flex-col justify-between items-center my-auto">
            {/* MODE A: VERIFY VISITOR (CODE ID / QR ONLY - NO EMAIL) */}
            {portalFlowState === 'verify' && (
                <div className="animate-in fade-in zoom-in-95 duration-400 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xl shadow-violet-100/60 max-w-xl mx-auto w-full my-auto">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5">
                            Time In & Departure
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                            Enter your Visitor Code ID or scan your Access Pass QR code to continue.
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-slate-700 text-xs font-bold mb-2 text-left">
                                Visitor Code ID <span className="text-red-500">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    ref={codeInputRef}
                                    type="text"
                                    maxLength={5}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={portalCodeInput}
                                    onChange={(e) => setPortalCodeInput(e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            onVerifyCode();
                                        }
                                    }}
                                    placeholder="e.g. 54321"
                                    className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold tracking-widest outline-none focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 focus:bg-white transition-all text-slate-800 placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={showScanner ? stopScanner : startScanner}
                                    className={`absolute right-2.5 p-2 rounded-xl transition-all cursor-pointer ${showScanner
                                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                        : 'bg-violet-50 text-[#7030a0] hover:bg-violet-100'
                                        }`}
                                    title={showScanner ? 'Close Scanner' : 'Scan Access Pass QR Code'}
                                >
                                    <Camera size={19} />
                                </button>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1.5 block text-left font-medium">
                                * Use your registered 5-digit number or click the camera icon to scan your QR pass.
                            </span>
                        </div>
                    </div>

                    {/* Camera QR Scanner Viewport */}
                    {showScanner && (
                        <div className="mb-6 overflow-hidden rounded-2xl border border-violet-200 relative aspect-video bg-black flex items-center justify-center shadow-inner">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                            {scannerLoading ? (
                                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white text-xs font-semibold gap-2 z-10">
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Starting camera...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="absolute inset-0 border-[20px] sm:border-[30px] border-black/40 flex items-center justify-center pointer-events-none">
                                        <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-[#7030a0] rounded-xl relative">
                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-pink-500 animate-scan shadow-[0_0_8px_#ec4899]" />
                                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-500 -mt-0.5 -ml-0.5" />
                                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-500 -mt-0.5 -mr-0.5" />
                                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-500 -mb-0.5 -ml-0.5" />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-500 -mb-0.5 -mr-0.5" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-[9px] text-white px-2.5 py-1 rounded-full font-bold tracking-wider uppercase pointer-events-none">
                                        Align Access Pass QR within box
                                    </div>
                                </>
                            )}
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    )}

                    {/* Verify Button */}
                    <button
                        type="button"
                        onClick={() => onVerifyCode()}
                        disabled={isVerifyingCode || !portalCodeInput.trim()}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2484] text-white rounded-2xl font-bold hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-violet-200"
                    >
                        {isVerifyingCode ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Verifying Code...</span>
                            </>
                        ) : (
                            <span>Verify Visitor →</span>
                        )}
                    </button>

                    {/* Warning Prompt */}
                    {verificationWarning && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col items-start gap-2.5 text-left text-amber-900 animate-in fade-in duration-200">
                            <div className="flex items-start gap-2.5">
                                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <span className="text-xs font-semibold leading-relaxed">{verificationWarning}</span>
                            </div>
                            <button
                                type="button"
                                onClick={onRegisterClick}
                                className="mt-1 px-4 py-2 bg-[#7030a0] hover:bg-[#5b2783] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                Register Now (First Entry) →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* MODE B: VISITOR VERIFIED -> SELECT SERVICE TO TIME IN (NO ACTIVE VISIT TODAY) */}
            {portalFlowState === 'select_service' && activeVisitorProfile && (
                <div className="animate-in fade-in zoom-in-95 duration-400 bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-2xl shadow-violet-100/60 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                        <button
                            type="button"
                            onClick={onResetPortal}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#7030a0] py-1.5 px-3 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                            <span>Change Visitor Code</span>
                        </button>
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                            ✓ Verified: {activeVisitorProfile.parent_name}
                        </span>
                    </div>

                    <div className="text-left mb-6">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                            Select Service to Time In
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">
                            Welcome, <span className="font-extrabold text-[#7030a0]">{activeVisitorProfile.parent_name}</span>! Which facility or service will you be availing today?
                        </p>
                    </div>

                    {/* 3 Service Cards for Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6 text-left">
                        {PORTAL_SERVICES.map((s) => {
                            const isSelected = selectedServiceForTimeIn === s.label;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setSelectedServiceForTimeIn(s.label)}
                                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${isSelected
                                        ? 'border-[#7030a0] bg-violet-50/70 ring-2 ring-[#7030a0] shadow-md scale-[1.02]'
                                        : 'border-slate-200 hover:border-violet-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">{s.emoji}</span>
                                            {isSelected && (
                                                <span className="w-5 h-5 rounded-full bg-[#7030a0] text-white flex items-center justify-center text-xs">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-black text-slate-900 text-sm leading-tight mb-1">
                                            {s.label}
                                        </h4>
                                        <span className="text-[10px] font-bold text-[#7030a0] block leading-tight">
                                            {s.badge}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-medium mt-3 block">
                                        {s.tagline}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Accompanying Children Checklist (if registered) */}
                    {Array.isArray(activeVisitorProfile.children) && activeVisitorProfile.children.length > 0 && (
                        <div className="mb-6 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">
                                Accompanying Children (Select all that apply)
                            </span>
                            <div className="flex flex-col gap-2">
                                {activeVisitorProfile.children.map((child, idx) => {
                                    const isSelected = selectedChildren.some(c => c.name === child.name);
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedChildren(selectedChildren.filter(c => c.name !== child.name));
                                                } else {
                                                    setSelectedChildren([...selectedChildren, child]);
                                                }
                                            }}
                                            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${isSelected ? 'border-[#7030a0] bg-white shadow-sm' : 'border-slate-200 bg-white/70 hover:bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Baby className={`w-4 h-4 ${isSelected ? 'text-[#7030a0]' : 'text-slate-400'}`} />
                                                <span className={`text-xs font-bold ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>{child.name}</span>
                                                <span className="text-[11px] text-slate-400 font-medium">({child.age} yrs, {child.sex})</span>
                                            </div>
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'border-[#7030a0] bg-[#7030a0] text-white' : 'border-slate-300'
                                                }`}>
                                                {isSelected && <Check size={12} className="stroke-[3]" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Confirm Time In Button */}
                    <button
                        type="button"
                        onClick={() => onConfirmTimeIn()}
                        disabled={isRecordingTimeIn || !selectedServiceForTimeIn}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2484] text-white rounded-2xl font-bold hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-violet-200"
                    >
                        {isRecordingTimeIn ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Recording Time In...</span>
                            </>
                        ) : (
                            <span>
                                Confirm Time In {selectedServiceForTimeIn ? `for ${selectedServiceForTimeIn}` : ''} →
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* MODE C: ACTIVE VISIT FOUND -> "TIME OUT TO THIS SERVICE? -> EVALUATION FORM" */}
            {portalFlowState === 'confirm_timeout' && activeVisitRecord && activeVisitorProfile && (
                <div className="animate-in fade-in zoom-in-95 duration-400 bg-white rounded-3xl p-6 sm:p-9 border border-violet-200 shadow-2xl shadow-violet-100 max-w-xl mx-auto text-left">
                    <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                        <button
                            type="button"
                            onClick={onResetPortal}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#7030a0] py-1.5 px-3 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                            <span>Back</span>
                        </button>
                        <span className="text-[11px] font-black text-violet-700 bg-violet-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Active Check-In Found
                        </span>
                    </div>

                    <div className="text-left mb-6">
                        <span className="text-xs font-extrabold text-[#7030a0] uppercase tracking-wider block mb-1">
                            Welcome back, {activeVisitorProfile.parent_name}!
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            Time out to this service?
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                            You are currently checked in for the service below. Confirming departure will record your Time Out and proceed directly to the service evaluation survey.
                        </p>
                    </div>

                    {/* Active Service Card Summary */}
                    <div className="bg-violet-50/60 border border-violet-200/80 rounded-2xl p-5 mb-6 space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-violet-100">
                            <span className="text-xs font-bold text-slate-500">Service Availed</span>
                            <span className="text-sm font-black text-[#7030a0] flex items-center gap-1.5">
                                {activeVisitRecord.service_availed?.includes('Child') ? '👶' : activeVisitRecord.service_availed?.includes('Mother') ? '🤱' : '📚'}{' '}
                                {activeVisitRecord.service_availed}
                            </span>
                        </div>
                        <div className="flex items-center justify-between pb-3 border-b border-violet-100">
                            <span className="text-xs font-bold text-slate-500">Time In Today</span>
                            <span className="text-xs font-extrabold text-slate-800">
                                {new Date(activeVisitRecord.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Current Elapsed Time</span>
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                {formatDuration(activeVisitRecord.created_at, new Date().toISOString())}
                            </span>
                        </div>
                    </div>

                    {/* Confirm Action Button */}
                    <div className="flex flex-col gap-2.5">
                        <button
                            type="button"
                            onClick={onConfirmTimeoutAndProceedToEval}
                            disabled={isRecordingTimeOut}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2484] text-white rounded-2xl font-bold hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-violet-200 cursor-pointer"
                        >
                            {isRecordingTimeOut ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Recording Time Out...</span>
                                </>
                            ) : (
                                <span>Confirm Time Out & Proceed to Evaluation →</span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onResetPortal}
                            className="w-full py-3 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                            Stay Checked In (Cancel)
                        </button>
                    </div>
                </div>
            )}

            {/* MODE D: CHECK-IN SUCCESS CONFIRMATION */}
            {portalFlowState === 'checkin_success' && timeInSuccessData && (
                <div className="animate-in zoom-in-95 duration-400 bg-white rounded-3xl p-6 sm:p-9 border border-emerald-200 shadow-2xl shadow-emerald-50 max-w-xl mx-auto text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-inner">
                        <CheckCircle2 size={36} />
                    </div>
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                        ✓ Time In Recorded
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                        Welcome to {timeInSuccessData.service}!
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium mb-6">
                        Hello <span className="font-extrabold text-slate-800">{timeInSuccessData.visitor.parent_name}</span>, your check-in has been successfully registered. Have a safe and wonderful visit!
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 mb-6">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-bold">Service:</span>
                            <span className="font-extrabold text-[#7030a0]">{timeInSuccessData.service}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-bold">Time In:</span>
                            <span className="font-bold text-slate-800">
                                {new Date(timeInSuccessData.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        {timeInSuccessData.children && timeInSuccessData.children.length > 0 && (
                            <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2">
                                <span className="text-slate-500 font-bold">Children with you:</span>
                                <span className="font-bold text-slate-800">{timeInSuccessData.children.map(c => c.name).join(', ')}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
                        When you are ready to depart, simply enter your code again to record your Time Out and evaluate our service.
                    </p>

                    <button
                        type="button"
                        onClick={onResetPortal}
                        className="w-full py-3.5 bg-[#7030a0] hover:bg-[#5b2484] text-white rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                        Done / Return to Home
                    </button>
                </div>
            )}

            {/* BOTTOM HELPER PROMPT matching mockup */}
            <div className="mt-6 sm:mt-8 text-center space-y-2.5">
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Click{' '}
                    <button
                        type="button"
                        onClick={onRegisterClick}
                        className="font-extrabold text-[#7030a0] hover:underline cursor-pointer"
                    >
                        here
                    </button>{' '}
                    or the register button at the top if this is your first time
                </p>

                <a
                    href="#services"
                    className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-[#7030a0] transition-colors py-1 cursor-pointer"
                >
                    <span>Don't know the system? Know more by scrolling</span>
                    <ChevronDown size={14} className="animate-bounce" />
                </a>
            </div>
        </div>
    );
}

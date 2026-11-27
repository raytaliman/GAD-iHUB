import React from 'react';
import { UserCircle, Baby, CheckCircle2, Download, Building2, ChevronLeft } from 'lucide-react';
import PortalNavbar from './PortalNavbar';
import ModernSelect from '../common/ModernSelect';
import { OFFICE_UNIT_OPTIONS } from '../../constants/feedback';

export default function RegistrationFormView({
    formData,
    handleInputChange,
    handleChildChange,
    addChild,
    removeChild,
    currentPart,
    setCurrentPart,
    submitting,
    submitRegistration,
    validateBasicInfo,
    showThankYou,
    generatedCode,
    generatedIdCardUrl,
    onCompleteReturnHome,
    onBackToPortal,
}) {
    const handleNextToChildren = () => {
        if (validateBasicInfo()) {
            setCurrentPart(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9FC] flex flex-col font-sans select-none text-slate-800">
            {/* Top Sticky Header - Stays identical to landing page */}
            <PortalNavbar
                onRegister={() => {}}
                onTimeInOutShortcut={onBackToPortal}
            />

            <main className="flex-1 flex flex-col items-center px-4 py-6 sm:py-10 max-w-4xl mx-auto w-full">
                {/* Back to Portal Bar directly inside the form */}
                {!showThankYou && (
                    <div className="w-full max-w-2xl mb-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onBackToPortal}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#7030a0] bg-white border border-slate-200 hover:border-violet-300 px-3.5 py-1.5 rounded-full transition-all shadow-sm cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                            <span>Back to Portal</span>
                        </button>
                        <span className="text-[11px] font-black text-violet-700 bg-violet-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Visitor Registration
                        </span>
                    </div>
                )}
                {/* Registration Thank You / Completed Pass Screen */}
                {showThankYou ? (
                    <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl shadow-slate-100 text-center animate-in zoom-in-95 duration-400">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-inner">
                            <CheckCircle2 size={36} />
                        </div>
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                            ✓ Registration Complete
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            Welcome to iHubGAD!
                        </h3>
                        <p className="text-slate-600 text-xs sm:text-sm font-medium mb-6">
                            Your profile has been registered. Please save your unique 5-digit code below for all your visits and evaluations:
                        </p>

                        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 mb-6">
                            <span className="text-xs font-bold text-slate-500 mb-1 block">Your Visitor Code ID</span>
                            <span className="text-5xl font-black text-[#7030a0] tracking-widest">{generatedCode}</span>
                            {formData.email && (
                                <p className="mt-3 text-xs text-[#7030a0] font-bold">
                                    📧 An Access Pass with your QR Code was also emailed to {formData.email}
                                </p>
                            )}
                        </div>

                        {generatedIdCardUrl && (
                            <div className="mb-6">
                                <a
                                    href={generatedIdCardUrl}
                                    download={`AccessPass-${generatedCode}.png`}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-100 hover:bg-violet-200 text-[#7030a0] rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-sm"
                                >
                                    <Download size={16} />
                                    Download Access Pass ID (Image)
                                </a>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={onCompleteReturnHome}
                            className="w-full py-4 bg-[#7030a0] hover:bg-[#5b2484] text-white rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                            Return to Portal Home & Time In
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Step Header */}
                        <div className="text-center mb-8 max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-violet-100 text-[#7030a0] rounded-full text-xs font-black tracking-wider uppercase mb-3">
                                <Baby size={13} />
                                <span>Visitor Registration</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                                Register Your Visit
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                                Complete this one-time profile registration to receive your 5-digit Access Pass for all future Hub visits.
                            </p>
                        </div>

                        {/* Progress Tracker */}
                        <div className="w-full max-w-2xl mb-8">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                                <span>Step {currentPart + 1} of 2</span>
                                <span className="text-[#7030a0] font-extrabold">
                                    {currentPart === 0 ? 'Part I: Basic Information' : 'Part II: Children Information'}
                                </span>
                            </div>
                            <div className="flex gap-2 w-full">
                                <div className={`h-2 rounded-full flex-1 transition-all ${currentPart >= 0 ? 'bg-[#7030a0]' : 'bg-slate-200'}`} />
                                <div className={`h-2 rounded-full flex-1 transition-all ${currentPart >= 1 ? 'bg-[#7030a0]' : 'bg-slate-200'}`} />
                            </div>
                        </div>

                        {/* Part 0: Basic Info */}
                        {currentPart === 0 && (
                            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-xl shadow-slate-100 text-left animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl font-black text-slate-800 pb-4 mb-6 border-b border-slate-100 flex items-center gap-2">
                                    <UserCircle className="text-[#7030a0]" size={22} />
                                    <span>Part I. Visitor Details</span>
                                </h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">First Name <span className="text-red-500">*</span></label>
                                            <input type="text" className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50 focus:bg-white" placeholder="e.g. Maria" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Middle Name</label>
                                            <input type="text" className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50 focus:bg-white" placeholder="e.g. Cruz" value={formData.middleName} onChange={e => handleInputChange('middleName', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Last Name <span className="text-red-500">*</span></label>
                                            <input type="text" className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50 focus:bg-white" placeholder="e.g. Santos" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Sex</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Male', 'Female'].map(option => {
                                                    const isSelected = formData.sex === option;
                                                    return (
                                                        <button
                                                            key={option}
                                                            type="button"
                                                            onClick={() => handleInputChange('sex', option)}
                                                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 transition-all font-bold text-xs cursor-pointer ${isSelected ? 'border-[#7030a0] bg-violet-50 text-[#7030a0]' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                                        >
                                                            <span>{option}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Birthdate <span className="text-red-500">*</span></label>
                                            <input
                                                type="date"
                                                max={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50 focus:bg-white"
                                                value={formData.birthdate}
                                                onChange={e => handleInputChange('birthdate', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Contact Number <span className="text-red-500">*</span></label>
                                            <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#7030a0] focus-within:ring-4 focus-within:ring-violet-100 transition-all bg-slate-50 focus-within:bg-white">
                                                <div className="bg-slate-100 border-r border-slate-200 px-3 py-2.5 text-xs text-slate-600 font-bold">+63</div>
                                                <input type="tel" maxLength={10} placeholder="912 345 6789" className="w-full px-3 py-2.5 text-xs outline-none bg-transparent" value={formData.contactNumber} onChange={e => handleInputChange('contactNumber', e.target.value.replace(/\D/g, ''))} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Email Address</label>
                                            <input type="email" placeholder="name@region1.dost.gov.ph" className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50 focus:bg-white" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Client Type</label>
                                        <div className="grid grid-cols-2 gap-3 max-w-xs">
                                            {['Internal', 'External'].map(option => {
                                                const isSelected = formData.clientType === option;
                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => {
                                                            handleInputChange('clientType', option);
                                                            handleInputChange('officeUnitAddress', '');
                                                            handleInputChange('officeUnitOther', '');
                                                        }}
                                                        className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border-2 transition-all font-bold text-xs cursor-pointer ${isSelected ? 'border-[#7030a0] bg-violet-50 text-[#7030a0]' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                                    >
                                                        <span>{option}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

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
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Agency/Organization/Address <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                placeholder="Enter your office, school, or residential address"
                                                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50 focus:bg-white"
                                                value={formData.officeUnitOther}
                                                onChange={e => handleInputChange('officeUnitOther', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {formData.officeUnitAddress === 'Others' && formData.clientType === 'Internal' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Please specify address</label>
                                            <input type="text" placeholder="Type your office/unit/address" className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50 focus:bg-white" value={formData.officeUnitOther} onChange={e => handleInputChange('officeUnitOther', e.target.value)} />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleNextToChildren}
                                        className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2484] text-white rounded-xl font-bold text-sm shadow-md shadow-violet-200 transition-all active:scale-95 cursor-pointer"
                                    >
                                        Next: Children Information →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Part 1: Children Information */}
                        {currentPart === 1 && (
                            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-xl shadow-slate-100 text-left animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <Baby className="text-[#7030a0]" size={22} />
                                        <span>Part II. Children Profile (Optional)</span>
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addChild}
                                        className="text-xs font-bold text-[#7030a0] hover:underline bg-violet-50 px-3 py-1.5 rounded-xl cursor-pointer"
                                    >
                                        + Add Child
                                    </button>
                                </div>

                                <p className="text-xs text-slate-500 font-medium mb-5">
                                    If you have children who will accompany you to the Child Minding or Care stations, register their details below:
                                </p>

                                <div className="space-y-4 mb-6">
                                    {formData.children.map((child, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 relative">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700">Child #{idx + 1}</span>
                                                {formData.children.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChild(idx)}
                                                        className="text-xs text-red-500 hover:underline font-bold cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Child's full name"
                                                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white"
                                                        value={child.name}
                                                        onChange={e => handleChildChange(idx, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Age</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Age"
                                                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white"
                                                        value={child.age}
                                                        onChange={e => handleChildChange(idx, 'age', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Sex</label>
                                                    <select
                                                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white"
                                                        value={child.sex}
                                                        onChange={e => handleChildChange(idx, 'sex', e.target.value)}
                                                    >
                                                        <option value="">Select Sex</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPart(0)}
                                        className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submitRegistration}
                                        disabled={submitting}
                                        className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2484] text-white rounded-xl font-bold text-sm shadow-md shadow-violet-200 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Registering Profile...</span>
                                            </>
                                        ) : (
                                            <span>Complete Registration & Get Code →</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Baby, Shapes, ChevronDown, Sun, BookOpen, Smile, Star } from 'lucide-react';
import { useFeedbackForm } from '../hooks/useFeedbackForm';
import { supabase } from '../lib/supabase';

// Modular Portal Components
import PortalNavbar from '../components/portal/PortalNavbar';
import PortalHero from '../components/portal/PortalHero';
import VisitorVerificationCard from '../components/portal/VisitorVerificationCard';
import ServicesOfferedSection from '../components/portal/ServicesOfferedSection';
import AboutSection from '../components/portal/AboutSection';
import PortalFooter from '../components/portal/PortalFooter';
import EvaluationFormView from '../components/portal/EvaluationFormView';
import RegistrationFormView from '../components/portal/RegistrationFormView';

/**
 * Public-Facing Portal Orchestrator Component.
 * Coordinates views between:
 * 1. Landing Page Portal (Verification, Time In, Time Out, Services & About)
 * 2. Client Satisfaction Measurement (CSM) Evaluation Survey
 * 3. Visitor Registration Flow
 */
export default function LandingPage() {
    const {
        formParts,
        formData,
        flowType,
        setFlowType,
        userCode,
        setUserCode,
        codeValidated,
        generatedCode,
        generatedIdCardUrl,
        currentPart,
        setCurrentPart,
        showCoverPage,
        setShowCoverPage,
        showThankYou,
        setShowThankYou,
        submitting,
        handleInputChange,
        handleChildChange,
        addChild,
        removeChild,
        submitRegistration,
        validateUserCode,
        submitEvaluation,
        resetForm,
        validateBasicInfo,
        validateChildrenInfo,
        totalParts,
        triggerSnackbar,
        setGeneratedCode,
        setCodeValidated,
        setRegistrationId,
    } = useFeedbackForm();

    // ==========================================
    // UNIFIED PORTAL WORKSPACE STATES
    // portalFlowState: 'verify' | 'select_service' | 'confirm_timeout' | 'checkin_success'
    // ==========================================
    const [portalFlowState, setPortalFlowState] = useState('verify');
    const [portalCodeInput, setPortalCodeInput] = useState('');
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [verificationWarning, setVerificationWarning] = useState('');

    // Visitor profile and active visit records
    const [activeVisitorProfile, setActiveVisitorProfile] = useState(null);
    const [activeVisitRecord, setActiveVisitRecord] = useState(null);
    const [selectedServiceForTimeIn, setSelectedServiceForTimeIn] = useState(null);
    const [selectedChildren, setSelectedChildren] = useState([]);
    const [isRecordingTimeIn, setIsRecordingTimeIn] = useState(false);
    const [isRecordingTimeOut, setIsRecordingTimeOut] = useState(false);
    const [timeInSuccessData, setTimeInSuccessData] = useState(null);
    const [timeoutSuccessData, setTimeoutSuccessData] = useState(null);

    // Evaluation specific state
    const [verifiedEvalVisitor, setVerifiedEvalVisitor] = useState(null);

    // QR Code Scanner States and Refs
    const [showScanner, setShowScanner] = useState(false);
    const [scannerLoading, setScannerLoading] = useState(false);
    const [jsQRLoaded, setJsQRLoaded] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const codeInputRef = useRef(null);

    // Fade-in animation on mount / reload
    const [heroMounted, setHeroMounted] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            setHeroMounted(true);
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    // Clear verification warning when user types
    useEffect(() => {
        setVerificationWarning('');
    }, [portalCodeInput]);

    // Format duration helper
    const formatDuration = (startIso, endIso) => {
        if (!startIso || !endIso) return '–';
        try {
            const start = new Date(startIso);
            const end = new Date(endIso);
            const diffMs = end - start;
            if (diffMs < 0) return '–';
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
            const hrs = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return mins > 0 ? `${hrs} hr${hrs !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}` : `${hrs} hr${hrs !== 1 ? 's' : ''}`;
        } catch (e) {
            return '–';
        }
    };

    // Inject jsQR library dynamically for camera QR scanning
    useEffect(() => {
        if (window.jsQR) {
            setJsQRLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
        script.async = true;
        script.onload = () => setJsQRLoaded(true);
        document.body.appendChild(script);

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Scanner lifecycle effect
    useEffect(() => {
        let isMounted = true;
        if (showScanner) {
            setScannerLoading(true);
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    if (!isMounted) {
                        stream.getTracks().forEach(t => t.stop());
                        return;
                    }
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.setAttribute('playsinline', true);
                        videoRef.current.play().then(() => {
                            setScannerLoading(false);
                            requestAnimationFrame(tick);
                        }).catch(e => {
                            console.error('Video play error:', e);
                            setScannerLoading(false);
                        });
                    }
                })
                .catch((err) => {
                    console.error('Camera access error:', err);
                    triggerSnackbar('Unable to access camera for QR scan. Please check permissions.');
                    setShowScanner(false);
                    setScannerLoading(false);
                });
        } else {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }

        return () => {
            isMounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [showScanner]);

    const stopScanner = () => {
        setShowScanner(false);
    };

    const startScanner = () => {
        setShowScanner(true);
    };

    const tick = () => {
        if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
            if (streamRef.current && streamRef.current.active) {
                requestAnimationFrame(tick);
            }
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (window.jsQR) {
            const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
                const scannedRaw = code.data.trim();
                stopScanner();
                triggerSnackbar(`QR Pass Scanned: ${scannedRaw}`, 'info');
                setPortalCodeInput(scannedRaw);
                handleVerifyPortalVisitor(scannedRaw);
                return;
            }
        }

        if (streamRef.current && streamRef.current.active) {
            requestAnimationFrame(tick);
        }
    };

    // ==========================================
    // CORE HANDLER: VERIFY VISITOR (CODE ID / QR ONLY - NO EMAIL)
    // ==========================================
    const handleVerifyPortalVisitor = async (scannedCode) => {
        setVerificationWarning('');
        const codeQuery = (typeof scannedCode === 'string' ? scannedCode : portalCodeInput).trim();

        if (!codeQuery) {
            setVerificationWarning('Please enter your 5-digit Visitor Code ID or scan your QR code.');
            return;
        }

        setIsVerifyingCode(true);
        try {
            // STRICT VERIFICATION: ONLY BY CODE ID (NO EMAIL)
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .eq('code', codeQuery)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                setVerificationWarning(`No registered visitor found with Code ID "${codeQuery}". If this is your first time visiting the Hub, please click Register.`);
                return;
            }

            const visitor = data[0];
            setActiveVisitorProfile(visitor);

            // Fetch visitor's recent visits to check for an active check-in today
            let visitsQuery = supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (visitor.email && visitor.email.trim()) {
                visitsQuery = visitsQuery.eq('email', visitor.email.trim());
            } else {
                visitsQuery = visitsQuery.eq('parent_name', visitor.parent_name).eq('contact_number', visitor.contact_number);
            }

            const { data: visitsData, error: visitsError } = await visitsQuery;
            if (visitsError) throw visitsError;

            // Check if there is an active visit from today (no time_out yet)
            const todayStr = new Date().toISOString().split('T')[0];
            const activeVisit = (visitsData || []).find(v => {
                const vDate = v.created_at ? v.created_at.split('T')[0] : v.date_of_use;
                return vDate === todayStr && !v.time_out && v.service_availed;
            });

            if (activeVisit) {
                // SCENARIO 2: Visitor already has an active visit -> Time Out to this service?
                setActiveVisitRecord(activeVisit);
                setPortalFlowState('confirm_timeout');
            } else {
                // SCENARIO 1: Visitor has no active visit -> Select Service to Time In
                setActiveVisitRecord(null);
                if (Array.isArray(visitor.children)) {
                    setSelectedChildren(visitor.children);
                } else {
                    setSelectedChildren([]);
                }
                setPortalFlowState('select_service');
            }
        } catch (err) {
            console.error('Visitor verification error:', err);
            triggerSnackbar('An error occurred during verification.');
        } finally {
            setIsVerifyingCode(false);
        }
    };

    // ==========================================
    // CORE HANDLER: CONFIRM TIME IN
    // ==========================================
    const handleConfirmTimeIn = async (chosenService) => {
        if (!activeVisitorProfile) return;
        const serviceToSave = chosenService || selectedServiceForTimeIn;
        if (!serviceToSave) {
            triggerSnackbar('Please choose a service to Time In.');
            return;
        }

        setIsRecordingTimeIn(true);
        try {
            // Generate a fresh unique 5-digit code for this check-in visit
            let newCode;
            let isUnique = false;
            while (!isUnique) {
                newCode = Math.floor(10000 + Math.random() * 90000).toString();
                const { data } = await supabase.from('registrations').select('code').eq('code', newCode).single();
                if (!data) isUnique = true;
            }

            const nowIso = new Date().toISOString();
            const row = {
                code: newCode,
                first_name: activeVisitorProfile.first_name,
                middle_name: activeVisitorProfile.middle_name,
                last_name: activeVisitorProfile.last_name,
                parent_name: activeVisitorProfile.parent_name,
                sex: activeVisitorProfile.sex,
                email: activeVisitorProfile.email,
                birthdate: activeVisitorProfile.birthdate,
                country_code: activeVisitorProfile.country_code,
                contact_number: activeVisitorProfile.contact_number,
                client_type: activeVisitorProfile.client_type,
                office_unit_address: activeVisitorProfile.office_unit_address,
                office_unit_other: activeVisitorProfile.office_unit_other,
                province: activeVisitorProfile.province,
                city: activeVisitorProfile.city,
                barangay: activeVisitorProfile.barangay,
                children: selectedChildren,
                date_of_use: nowIso.split('T')[0],
                service_availed: serviceToSave,
                created_at: nowIso,
                time_out: null,
            };

            const { error } = await supabase.from('registrations').insert([row]);
            if (error) throw error;

            setTimeInSuccessData({
                code: newCode,
                visitor: activeVisitorProfile,
                service: serviceToSave,
                children: selectedChildren,
                timeIn: nowIso,
            });
            setPortalFlowState('checkin_success');
        } catch (err) {
            console.error('Time In recording error:', err);
            triggerSnackbar('Could not complete Time In: ' + err.message);
        } finally {
            setIsRecordingTimeIn(false);
        }
    };

    // ==========================================
    // CORE HANDLER: CONFIRM TIME OUT & PROCEED TO EVALUATION
    // ==========================================
    const handleConfirmTimeoutAndProceedToEval = async () => {
        if (!activeVisitRecord || !activeVisitorProfile) return;
        setIsRecordingTimeOut(true);
        try {
            const nowIso = new Date().toISOString();
            const { error } = await supabase
                .from('registrations')
                .update({ time_out: nowIso })
                .eq('id', activeVisitRecord.id);

            if (error) throw error;

            const durationStr = formatDuration(activeVisitRecord.created_at, nowIso);
            setTimeoutSuccessData({
                visitor: activeVisitorProfile,
                service: activeVisitRecord.service_availed,
                timeIn: activeVisitRecord.created_at,
                timeOut: nowIso,
                duration: durationStr,
            });

            // Automatically configure evaluation session
            setRegistrationId(activeVisitRecord.id);
            setVerifiedEvalVisitor(activeVisitorProfile);
            handleInputChange('serviceAvailed', activeVisitRecord.service_availed);
            setCodeValidated(true);
            setFlowType('evaluate');
            setCurrentPart(1);
            setShowCoverPage(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Time Out recording error:', err);
            triggerSnackbar('Could not record Time Out: ' + err.message);
        } finally {
            setIsRecordingTimeOut(false);
        }
    };

    // Reset portal state back to default verify view
    const handleResetPortal = () => {
        setPortalFlowState('verify');
        setPortalCodeInput('');
        setVerificationWarning('');
        setActiveVisitorProfile(null);
        setActiveVisitRecord(null);
        setSelectedServiceForTimeIn(null);
        setSelectedChildren([]);
        setTimeInSuccessData(null);
        setTimeoutSuccessData(null);
        stopScanner();
    };

    // Shortcut: Go to Registration view
    const handleGoToRegister = () => {
        handleInputChange('serviceAvailed', '');
        setFlowType('register');
        setCurrentPart(0);
        setShowCoverPage(false);
        window.history.pushState({}, '', '/registration');
    };

    // Shortcut: Focus verification input from navbar or services
    const handleFocusVerification = (preselectedService = null) => {
        handleResetPortal();
        if (preselectedService) {
            setSelectedServiceForTimeIn(preselectedService);
        }
        codeInputRef.current?.focus();
        window.scrollTo({ top: 280, behavior: 'smooth' });
    };

    // Callback when wizard completes and user returns to portal
    const handleReturnToPortalHome = () => {
        resetForm();
        handleResetPortal();
        setShowCoverPage(true);
        setFlowType(null);
        window.history.pushState({}, '', '/');
    };

    // =========================================================================
    // VIEW 1: REDESIGNED EVALUATION FORM (flowType = 'evaluate' && !showCoverPage)
    // =========================================================================
    if (flowType === 'evaluate') {
        return (
            <EvaluationFormView
                formParts={formParts}
                formData={formData}
                handleInputChange={handleInputChange}
                currentPart={currentPart}
                setCurrentPart={setCurrentPart}
                totalParts={totalParts}
                submitting={submitting}
                submitEvaluation={submitEvaluation}
                showThankYou={showThankYou}
                onCompleteReturnHome={handleReturnToPortalHome}
                verifiedEvalVisitor={verifiedEvalVisitor}
            />
        );
    }

    // =========================================================================
    // VIEW 2: REGISTRATION FORM (flowType = 'register' && !showCoverPage)
    // =========================================================================
    if (flowType === 'register') {
        return (
            <RegistrationFormView
                formData={formData}
                handleInputChange={handleInputChange}
                handleChildChange={handleChildChange}
                addChild={addChild}
                removeChild={removeChild}
                currentPart={currentPart}
                setCurrentPart={setCurrentPart}
                submitting={submitting}
                submitRegistration={submitRegistration}
                validateBasicInfo={validateBasicInfo}
                showThankYou={showThankYou}
                generatedCode={generatedCode}
                generatedIdCardUrl={generatedIdCardUrl}
                onCompleteReturnHome={handleReturnToPortalHome}
                onBackToPortal={handleReturnToPortalHome}
            />
        );
    }

    // =========================================================================
    // VIEW 3: REDESIGNED LANDING PAGE PORTAL (showCoverPage = true)
    // =========================================================================
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans select-none text-slate-800 scroll-smooth">
            {/* 1. TOP NAVBAR */}
            <PortalNavbar
                onRegister={handleGoToRegister}
                onTimeInOutShortcut={() => handleFocusVerification()}
                onLogoClick={() => {
                    handleResetPortal();
                    const heroEl = document.getElementById('hero');
                    if (heroEl) {
                        heroEl.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }}
            />

            {/* SCREEN 1: HERO & VISITOR VERIFICATION WITH SOLID PURPLE BACKGROUND & FLOATING DECORATIONS */}
            <section id="hero" className="min-h-screen w-full flex flex-col justify-center items-center pt-24 sm:pt-28 pb-8 sm:pb-12 px-4 relative bg-[#7030a0] overflow-hidden select-none">
                {/* Dynamic Ambient Floating Decorative Elements (Lighter & Brighter Constellation) */}
                {/* Top Left Quadrant */}
                <div className="absolute top-6 left-8 text-white/40 pointer-events-none animate-float hidden xs:block">
                    <Sparkles size={44} />
                </div>
                <div className="absolute top-20 left-[14%] text-pink-100/40 pointer-events-none animate-float-delayed">
                    <Heart size={26} />
                </div>
                <div className="absolute top-10 left-[26%] text-purple-100/40 pointer-events-none animate-bounce-subtle hidden sm:block">
                    <Baby size={32} />
                </div>
                <div className="absolute top-28 left-[6%] text-white/35 pointer-events-none animate-pulse-soft hidden md:block">
                    <Star size={22} />
                </div>
                <div className="absolute top-16 left-[20%] w-2.5 h-2.5 rounded-full bg-white/40 blur-[0.5px] pointer-events-none animate-float" />
                <div className="absolute top-36 left-[18%] text-amber-100/35 pointer-events-none animate-float hidden lg:block">
                    <Sun size={28} />
                </div>

                {/* Top Center & Mid-Top */}
                <div className="absolute top-8 left-[45%] text-white/30 pointer-events-none animate-float hidden sm:block">
                    <Star size={20} />
                </div>
                <div className="absolute top-14 left-[52%] w-3 h-3 rounded-full bg-pink-100/40 blur-[0.5px] pointer-events-none animate-pulse-soft hidden md:block" />

                {/* Top Right Quadrant */}
                <div className="absolute top-8 right-10 text-pink-100/40 pointer-events-none animate-float-delayed hidden xs:block">
                    <Heart size={48} />
                </div>
                <div className="absolute top-22 right-[16%] text-white/40 pointer-events-none animate-float">
                    <Sparkles size={28} />
                </div>
                <div className="absolute top-12 right-[28%] text-purple-100/40 pointer-events-none animate-bounce-subtle hidden sm:block">
                    <Baby size={28} />
                </div>
                <div className="absolute top-32 right-[8%] text-amber-100/35 pointer-events-none animate-float-delayed hidden md:block">
                    <Star size={24} />
                </div>
                <div className="absolute top-16 right-[22%] w-2.5 h-2.5 rounded-full bg-white/40 blur-[0.5px] pointer-events-none animate-float-delayed" />
                <div className="absolute top-36 right-[20%] text-white/35 pointer-events-none animate-bounce-subtle hidden lg:block">
                    <Smile size={26} />
                </div>

                {/* Middle Sides */}
                <div className="absolute top-[48%] left-3 sm:left-10 text-white/35 pointer-events-none animate-bounce-subtle">
                    <Baby size={38} />
                </div>
                <div className="absolute top-[44%] left-[2%] text-pink-100/35 pointer-events-none animate-float-delayed hidden lg:block">
                    <Heart size={20} />
                </div>
                <div className="absolute top-[46%] right-3 sm:right-10 text-white/40 pointer-events-none animate-float">
                    <Sparkles size={36} />
                </div>
                <div className="absolute top-[52%] right-[3%] text-purple-100/35 pointer-events-none animate-bounce-subtle hidden lg:block">
                    <Star size={22} />
                </div>
                <div className="absolute top-[62%] left-[10%] text-purple-100/35 pointer-events-none animate-float-delayed hidden sm:block">
                    <Shapes size={34} />
                </div>
                <div className="absolute top-[64%] right-[12%] text-pink-100/40 pointer-events-none animate-float-delayed hidden sm:block">
                    <Heart size={28} />
                </div>
                <div className="absolute top-[58%] left-[22%] w-3 h-3 rounded-full bg-white/35 blur-[0.5px] pointer-events-none animate-pulse-soft hidden lg:block" />
                <div className="absolute top-[56%] right-[22%] w-2 h-2 rounded-full bg-pink-200/40 blur-[0.5px] pointer-events-none animate-float hidden lg:block" />

                {/* Bottom Left Quadrant */}
                <div className="absolute bottom-8 left-8 text-pink-100/40 pointer-events-none animate-bounce-subtle hidden xs:block">
                    <Heart size={38} />
                </div>
                <div className="absolute bottom-16 left-[14%] text-white/40 pointer-events-none animate-float-delayed hidden sm:block">
                    <Baby size={46} />
                </div>
                <div className="absolute bottom-8 left-[24%] text-white/35 pointer-events-none animate-float">
                    <Sparkles size={24} />
                </div>
                <div className="absolute bottom-28 left-[6%] text-purple-100/35 pointer-events-none animate-float hidden md:block">
                    <BookOpen size={26} />
                </div>
                <div className="absolute bottom-24 left-[20%] text-amber-100/35 pointer-events-none animate-bounce-subtle hidden lg:block">
                    <Sun size={24} />
                </div>
                <div className="absolute bottom-14 left-[28%] w-2 h-2 rounded-full bg-white/40 pointer-events-none animate-pulse-soft" />

                {/* Bottom Center */}
                <div className="absolute bottom-10 left-[48%] text-white/30 pointer-events-none animate-float hidden sm:block">
                    <Sparkles size={18} />
                </div>

                {/* Bottom Right Quadrant */}
                <div className="absolute bottom-8 right-10 text-white/40 pointer-events-none animate-float-delayed hidden xs:block">
                    <Baby size={36} />
                </div>
                <div className="absolute bottom-16 right-[14%] text-white/40 pointer-events-none animate-float hidden sm:block">
                    <Sparkles size={46} />
                </div>
                <div className="absolute bottom-6 right-[24%] text-pink-100/40 pointer-events-none animate-bounce-subtle">
                    <Heart size={26} />
                </div>
                <div className="absolute bottom-28 right-[6%] text-purple-100/35 pointer-events-none animate-float-delayed hidden md:block">
                    <Smile size={28} />
                </div>
                <div className="absolute bottom-22 right-[20%] text-amber-100/35 pointer-events-none animate-float hidden lg:block">
                    <Star size={24} />
                </div>
                <div className="absolute bottom-14 right-[28%] w-2.5 h-2.5 rounded-full bg-pink-100/40 blur-[0.5px] pointer-events-none animate-pulse-soft" />

                {/* 2-COLUMN SPLIT HERO CONTAINER (FILLS SPACE ON DESKTOP & FLUID ON MOBILE) */}
                <div
                    className={`relative z-10 w-full max-w-[1560px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 2xl:gap-20 items-center my-auto transition-all duration-700 ease-out ${heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}
                >
                    {/* LEFT COLUMN: HERO HEADLINE, VALUE PROPOSITION, CTA BUTTONS */}
                    <div className="lg:col-span-7 xl:col-span-7 w-full flex flex-col items-center lg:items-start">
                        <PortalHero
                            onRegisterClick={handleGoToRegister}
                        />
                    </div>

                    {/* RIGHT COLUMN: VERIFICATION CARD */}
                    <div className="lg:col-span-5 xl:col-span-5 w-full flex flex-col items-center lg:items-end justify-center">
                        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
                            <VisitorVerificationCard
                                portalFlowState={portalFlowState}
                                portalCodeInput={portalCodeInput}
                                setPortalCodeInput={setPortalCodeInput}
                                codeInputRef={codeInputRef}
                                isVerifyingCode={isVerifyingCode}
                                verificationWarning={verificationWarning}
                                showScanner={showScanner}
                                startScanner={startScanner}
                                stopScanner={stopScanner}
                                scannerLoading={scannerLoading}
                                videoRef={videoRef}
                                canvasRef={canvasRef}
                                onVerifyCode={handleVerifyPortalVisitor}
                                onRegisterClick={handleGoToRegister}
                                onResetPortal={handleResetPortal}
                                activeVisitorProfile={activeVisitorProfile}
                                selectedServiceForTimeIn={selectedServiceForTimeIn}
                                setSelectedServiceForTimeIn={setSelectedServiceForTimeIn}
                                selectedChildren={selectedChildren}
                                setSelectedChildren={setSelectedChildren}
                                isRecordingTimeIn={isRecordingTimeIn}
                                onConfirmTimeIn={handleConfirmTimeIn}
                                activeVisitRecord={activeVisitRecord}
                                isRecordingTimeOut={isRecordingTimeOut}
                                onConfirmTimeoutAndProceedToEval={handleConfirmTimeoutAndProceedToEval}
                                formatDuration={formatDuration}
                                timeInSuccessData={timeInSuccessData}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. SERVICES OFFERED OVERVIEW CARDS */}
            <ServicesOfferedSection
                onSelectService={(serviceLabel) => handleFocusVerification(serviceLabel)}
            />

            {/* 5. ABOUT SECTION */}
            <AboutSection />

            {/* 6. CONTACT & FOOTER */}
            <PortalFooter />
        </div>
    );
}

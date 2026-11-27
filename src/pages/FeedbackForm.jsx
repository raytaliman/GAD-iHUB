import React, { useState } from 'react';
import { Share, Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, Smile, Meh, Frown, UserCircle, Building2, FileText, Heart, Sparkles, Baby, Palette, PartyPopper, Shapes, Star, Gift, Sun, Music, AlertCircle, X, Camera, Download, LogOut, Clock, ArrowRight, ShieldCheck, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import logo from '../assets/logo.png';
import dostLogo from '../assets/dost_logo.png';
import ihubLogo from '../assets/ihub_logo.png';
import ModernSelect from '../components/common/ModernSelect';
import ModernDatePicker from '../components/common/ModernDatePicker';
import { useFeedbackForm } from '../hooks/useFeedbackForm';
import { supabase } from '../lib/supabase';
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
        snackbar,
        setSnackbar,
        triggerSnackbar,
        setGeneratedCode,
        setCodeValidated,
        setRegistrationId,
    } = useFeedbackForm();

    const [showStationModal, setShowStationModal] = useState(false);
    const [showBackConfirm, setShowBackConfirm] = useState(false);
    const [showServicesModal, setShowServicesModal] = useState(false);
    const [selectedLandingService, setSelectedLandingService] = useState(null);

    const PORTAL_SERVICES = [
        {
            id: 'child-minding',
            label: 'Child Minding Station',
            badge: 'Hub Station 1',
            emoji: '👶',
            tagline: 'Child Play & Supervised Nursery Space',
            desc: 'A secure, supervised, and fun play area equipped with child-friendly educational toys, books, and nursery amenities for infants and toddlers.',
            features: ['Supervised Play Area', 'Educational Toys & Books', 'Nursery & Resting Amenities'],
            accentColor: 'text-pink-600',
            badgeBg: 'bg-pink-50 text-pink-700 border-pink-200/60',
            cardHoverBorder: 'hover:border-pink-300',
            iconBg: 'bg-pink-100 text-pink-600',
        },
        {
            id: 'mother-child',
            label: 'Mother and Child Care',
            badge: 'Hub Station 2',
            emoji: '🤱',
            tagline: 'Lactation & Maternal Support Station',
            desc: 'A quiet, private lactation room and care space designed for nursing mothers, diaper changes, and maternal support services.',
            features: ['Private Lactation Room', 'Diaper Changing Station', 'Ergonomic Nursing Lounge'],
            accentColor: 'text-[#7030a0]',
            badgeBg: 'bg-violet-50 text-[#7030a0] border-violet-200/60',
            cardHoverBorder: 'hover:border-violet-300',
            iconBg: 'bg-violet-100 text-[#7030a0]',
        },
        {
            id: 'gad-learning',
            label: 'GAD Learning Resource Center',
            badge: 'Hub Station 3',
            emoji: '📚',
            tagline: 'Knowledge & Gender Equality Library',
            desc: 'A comprehensive library offering specialized Gender and Development literature, policy guidelines, and interactive resources promoting gender-responsive education.',
            features: ['National GAD Policy Library', 'Gender Sensitivity Guides', 'Interactive Learning Modules'],
            accentColor: 'text-blue-600',
            badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
            cardHoverBorder: 'hover:border-blue-300',
            iconBg: 'bg-blue-100 text-blue-600',
        }
    ];

    const handleSelectLandingService = (serviceLabel) => {
        setSelectedLandingService(serviceLabel);
        handleInputChange('serviceAvailed', serviceLabel);
        setFlowType('checkin');
        setCheckinStep(0);
        setVerifiedVisitor(null);
        setCheckinInput('');
        setSelectedChildren([]);
        setCheckinWarning('');
    };

    const handleBackToServices = () => {
        setSelectedLandingService(null);
        handleInputChange('serviceAvailed', '');
        setCheckinInput('');
        setCheckinWarning('');
        setCheckinStep(0);
        setVerifiedVisitor(null);
        setSelectedChildren([]);
        stopScanner();
    };
    
    // Check-in Flow States
    const [checkinInput, setCheckinInput] = useState('');
    const [verifiedVisitor, setVerifiedVisitor] = useState(null);
    const [selectedChildren, setSelectedChildren] = useState([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [checkinStep, setCheckinStep] = useState(0);
    const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);
    const [checkinWarning, setCheckinWarning] = useState('');
    const [checkinActiveVisit, setCheckinActiveVisit] = useState(null);

    // Time-out Flow States
    const [timeoutInput, setTimeoutInput] = useState('');
    const [verifiedTimeoutVisitor, setVerifiedTimeoutVisitor] = useState(null);
    const [isVerifyingTimeout, setIsVerifyingTimeout] = useState(false);
    const [isSubmittingTimeout, setIsSubmittingTimeout] = useState(false);
    const [timeoutStep, setTimeoutStep] = useState(0); // 0: Enter/Scan Code, 1: Confirm Departure
    const [timeoutWarning, setTimeoutWarning] = useState('');
    const [timeoutResult, setTimeoutResult] = useState(null);

    // Service Evaluation Verification States
    const [evalVerifyInput, setEvalVerifyInput] = useState('');
    const [verifiedEvalVisitor, setVerifiedEvalVisitor] = useState(null);
    const [evalVisits, setEvalVisits] = useState([]);
    const [isVerifyingEval, setIsVerifyingEval] = useState(false);
    const [evalStep, setEvalStep] = useState(0); // 0: Enter Code/Email, 1: Select Visit
    const [evalWarning, setEvalWarning] = useState('');
    const scannerTargetRef = React.useRef(null);

    React.useEffect(() => {
        setEvalWarning('');
    }, [evalVerifyInput]);

    // QR Code Scanner States and Refs
    const [showScanner, setShowScanner] = useState(false);
    const [scannerLoading, setScannerLoading] = useState(false);
    const [jsQRLoaded, setJsQRLoaded] = useState(false);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const streamRef = React.useRef(null);

    React.useEffect(() => {
        setCheckinWarning('');
        setCheckinActiveVisit(null);
    }, [checkinInput]);

    React.useEffect(() => {
        setTimeoutWarning('');
    }, [timeoutInput]);

    const formatDuration = (startIso, endIso) => {
        if (!startIso || !endIso) return '–';
        try {
            const start = new Date(startIso);
            const end = new Date(endIso);
            const diffMs = end - start;
            if (diffMs < 0) return '–';
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 60) return `${diffMins}m`;
            const hrs = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
        } catch (e) {
            return '–';
        }
    };

    // Inject jsQR library dynamically
    React.useEffect(() => {
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
    React.useEffect(() => {
        let active = true;
        let activeStream = null;

        const initCamera = async () => {
            if (!showScanner) return;
            setScannerLoading(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (!active) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                activeStream = stream;
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    try {
                        await videoRef.current.play();
                    } catch (e) {
                        console.log("Play interrupted or blocked:", e);
                    }
                    requestAnimationFrame(tick);
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                triggerSnackbar('Could not access camera. Please ensure permissions are granted.');
                setShowScanner(false);
            } finally {
                setScannerLoading(false);
            }
        };

        initCamera();

        return () => {
            active = false;
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [showScanner]);

    const stopScanner = () => {
        setShowScanner(false);
    };

    const startScanner = (target = 'checkin') => {
        scannerTargetRef.current = typeof target === 'string' ? target : 'checkin';
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
                const scannedCode = code.data.trim();
                stopScanner();
                triggerSnackbar(`QR Code successfully scanned: ${scannedCode}`);
                if (scannerTargetRef.current === 'evaluate') {
                    setEvalVerifyInput(scannedCode);
                    handleVerifyEvalVisitor(scannedCode);
                } else if (scannerTargetRef.current === 'timeout') {
                    setTimeoutInput(scannedCode);
                    handleVerifyTimeoutVisitor(scannedCode);
                } else {
                    setCheckinInput(scannedCode);
                    handleVerifyVisitor(scannedCode);
                }
                return;
            }
        }
        
        if (streamRef.current && streamRef.current.active) {
            requestAnimationFrame(tick);
        }
    };

    const handleVerifyVisitor = async (scannedCode) => {
        setCheckinWarning('');
        const query = (typeof scannedCode === 'string' ? scannedCode : checkinInput).trim();
        if (!query) {
            const msg = 'Please enter your Visitor Code or Email address.';
            setCheckinWarning(msg);
            return;
        }
        setIsVerifying(true);
        try {
            // Check by code or email
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .or(`code.eq.${query},email.eq.${query}`)
                .order('created_at', { ascending: false });
                
            if (error || !data || data.length === 0) {
                const msg = 'No registered visitor found with that Code or Email. Please register first if this is your first entry.';
                setCheckinWarning(msg);
                return;
            }
            
            // Get the latest registration record
            const visitor = data[0];

            // Fetch the absolute latest registration row for this visitor to check for today's check-in
            let latestVisit = visitor;
            if (visitor.email && visitor.email.trim()) {
                const { data: latestData } = await supabase
                    .from('registrations')
                    .select('id, code, parent_name, email, contact_number, service_availed, created_at, time_out')
                    .eq('email', visitor.email.trim())
                    .order('created_at', { ascending: false })
                    .limit(1);
                if (latestData && latestData.length > 0) {
                    latestVisit = latestData[0];
                }
            } else {
                const { data: latestData } = await supabase
                    .from('registrations')
                    .select('id, code, parent_name, email, contact_number, service_availed, created_at, time_out')
                    .eq('parent_name', visitor.parent_name)
                    .eq('contact_number', visitor.contact_number)
                    .order('created_at', { ascending: false })
                    .limit(1);
                if (latestData && latestData.length > 0) {
                    latestVisit = latestData[0];
                }
            }

            // Verify if visitor has already checked in today
            if (latestVisit && latestVisit.created_at) {
                const latestVisitDate = new Date(latestVisit.created_at);
                const today = new Date();
                const isSameDay = latestVisitDate.getDate() === today.getDate() &&
                                  latestVisitDate.getMonth() === today.getMonth() &&
                                  latestVisitDate.getFullYear() === today.getFullYear();
                if (isSameDay) {
                    const timeString = latestVisitDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    if (!latestVisit.time_out) {
                        setCheckinActiveVisit(latestVisit);
                        const msg = `You are currently checked in (since ${timeString}). Did you mean to record your departure (Time Out)?`;
                        setCheckinWarning(msg);
                        return;
                    }
                    const msg = `Your check-in entry has already been recorded today at ${timeString}.`;
                    setCheckinWarning(msg);
                    return;
                }
            }

            setVerifiedVisitor(visitor);
            
            // Set children list. By default, select all children that were in their last registration.
            if (Array.isArray(visitor.children)) {
                setSelectedChildren(visitor.children);
            } else {
                setSelectedChildren([]);
            }
            setCheckinStep(1);
        } catch (err) {
            console.error('Checkin verification error:', err);
            triggerSnackbar('An error occurred during verification.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerifyTimeoutVisitor = async (scannedCode) => {
        setTimeoutWarning('');
        const query = (typeof scannedCode === 'string' ? scannedCode : timeoutInput).trim();
        if (!query) {
            setTimeoutWarning('Please enter your Visitor Code or Email address.');
            return;
        }
        setIsVerifyingTimeout(true);
        try {
            // Find registration by code or email
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .or(`code.eq.${query},email.eq.${query}`)
                .order('created_at', { ascending: false });

            if (error || !data || data.length === 0) {
                setTimeoutWarning('No registered visitor found with that Code or Email.');
                return;
            }

            const visitor = data[0];

            // Fetch recent visits for this visitor
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

            // Find an active visit (no time_out yet)
            const activeVisit = (visitsData || []).find(v => !v.time_out);

            if (!activeVisit) {
                // If the most recent visit already has time_out, inform user
                const latest = visitsData?.[0];
                if (latest && latest.time_out) {
                    const outTime = new Date(latest.time_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    setTimeoutWarning(`Your departure (Time Out) was already recorded today at ${outTime}.`);
                } else {
                    setTimeoutWarning('No active check-in visit found for this visitor. Please check in first.');
                }
                return;
            }

            setVerifiedTimeoutVisitor(activeVisit);
            setTimeoutStep(1);
        } catch (err) {
            console.error('Time out verification error:', err);
            triggerSnackbar('An error occurred during verification.');
        } finally {
            setIsVerifyingTimeout(false);
        }
    };

    const handleConfirmTimeout = async () => {
        if (!verifiedTimeoutVisitor) return;
        setIsSubmittingTimeout(true);
        try {
            const nowIso = new Date().toISOString();
            const { error } = await supabase
                .from('registrations')
                .update({ time_out: nowIso })
                .eq('id', verifiedTimeoutVisitor.id);

            if (error) throw error;

            const durationStr = formatDuration(verifiedTimeoutVisitor.created_at, nowIso);
            setTimeoutResult({
                visitor: verifiedTimeoutVisitor,
                timeIn: verifiedTimeoutVisitor.created_at,
                timeOut: nowIso,
                duration: durationStr
            });
            setShowThankYou(true);
        } catch (err) {
            console.error('Time out recording error:', err);
            triggerSnackbar('Could not record Time Out: ' + err.message);
        } finally {
            setIsSubmittingTimeout(false);
        }
    };

    const handleVerifyEvalVisitor = async (scannedCode) => {
        setEvalWarning('');
        const query = (typeof scannedCode === 'string' ? scannedCode : evalVerifyInput).trim();
        if (!query) {
            const msg = 'Please enter your Visitor Code or Email address.';
            setEvalWarning(msg);
            return;
        }
        setIsVerifyingEval(true);
        try {
            // Check by code or email
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .or(`code.eq.${query},email.eq.${query}`)
                .order('created_at', { ascending: false });
                
            if (error || !data || data.length === 0) {
                const msg = 'No registered visitor found with that Code or Email. Please register first if this is your first entry.';
                setEvalWarning(msg);
                return;
            }
            
            // Get the matched profile
            const visitor = data[0];

            // Fetch all registrations (visits) for this visitor
            let visitsQuery = supabase.from('registrations').select('id, code, date_of_use, service_availed, created_at').order('created_at', { ascending: false });
            if (visitor.email && visitor.email.trim()) {
                visitsQuery = visitsQuery.eq('email', visitor.email.trim());
            } else {
                visitsQuery = visitsQuery.eq('first_name', visitor.first_name).eq('last_name', visitor.last_name).eq('contact_number', visitor.contact_number);
            }
            const { data: allVisits, error: visitsError } = await visitsQuery;

            if (visitsError) {
                throw visitsError;
            }

            if (!allVisits || allVisits.length === 0) {
                setEvalWarning('No visits found for this visitor.');
                return;
            }

            // Get registration ids
            const regIds = allVisits.map(v => v.id);

            // Fetch existing evaluations
            const { data: existingEvals, error: evalsError } = await supabase
                .from('evaluations')
                .select('registration_id')
                .in('registration_id', regIds);

            if (evalsError) {
                throw evalsError;
            }

            const evaluatedIds = new Set(existingEvals ? existingEvals.map(e => e.registration_id) : []);

            // Filter out already evaluated visits
            const pendingVisits = allVisits.filter(v => !evaluatedIds.has(v.id));

            if (pendingVisits.length === 0) {
                setEvalWarning('You have no pending evaluations. All your visits have been evaluated. Thank you!');
                return;
            }

            setEvalVisits(pendingVisits);
            setVerifiedEvalVisitor(visitor);
            setEvalStep(1);
        } catch (err) {
            console.error('Service evaluation verification error:', err);
            triggerSnackbar('An error occurred during verification.');
        } finally {
            setIsVerifyingEval(false);
        }
    };

    const handleSubmitCheckin = async () => {
        setIsSubmittingCheckin(true);
        try {
            // Generate a new unique 5-digit code for this check-in visit
            let newCode;
            let isUnique = false;
            while (!isUnique) {
                newCode = Math.floor(10000 + Math.random() * 90000).toString();
                const { data } = await supabase.from('registrations').select('code').eq('code', newCode).single();
                if (!data) isUnique = true;
            }

            // Create a new registration entry representing this visit
            const row = {
                code: newCode,
                first_name: verifiedVisitor.first_name,
                middle_name: verifiedVisitor.middle_name,
                last_name: verifiedVisitor.last_name,
                parent_name: verifiedVisitor.parent_name,
                sex: verifiedVisitor.sex,
                email: verifiedVisitor.email,
                birthdate: verifiedVisitor.birthdate,
                country_code: verifiedVisitor.country_code,
                contact_number: verifiedVisitor.contact_number,
                client_type: verifiedVisitor.client_type,
                office_unit_address: verifiedVisitor.office_unit_address,
                office_unit_other: verifiedVisitor.office_unit_other,
                province: verifiedVisitor.province,
                city: verifiedVisitor.city,
                barangay: verifiedVisitor.barangay,
                // Only save the selected children for this visit
                children: selectedChildren,
                date_of_use: new Date().toISOString().split('T')[0],
                service_availed: formData.serviceAvailed,
                activities: verifiedVisitor.activities,
            };
            
            const { error } = await supabase.from('registrations').insert([row]);
            if (error) throw error;
            
            setGeneratedCode(newCode);
            setShowThankYou(true);
        } catch (err) {
            console.error('Checkin submission error:', err);
            triggerSnackbar('Could not complete check-in: ' + err.message);
        } finally {
            setIsSubmittingCheckin(false);
        }
    };

    /**
     * Navigation handler for the multi-step survey.
     * Transitions between registration steps and evaluation parts.
     */
    const goNext = () => {
        if (flowType === 'register') {
            if (currentPart === 0) {
                if (validateBasicInfo()) {
                    setCurrentPart(1);
                    window.scrollTo(0, 0);
                }
            } else if (currentPart === 1) {
                if (validateChildrenInfo()) {
                    submitRegistration();
                }
            }
            return;
        }
        if (currentPart === totalParts - 1) { submitEvaluation(); }
        else { setCurrentPart(p => Math.min(p + 1, totalParts - 1)); window.scrollTo(0, 0); }
    };

    // ==========================================
    // REDESIGNED FULL-WIDTH LANDING PAGE PORTAL
    // ==========================================
    if (showCoverPage) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-sans select-none text-slate-800 scroll-smooth">
                {/* 1. TOP NAVBAR */}
                <header className="sticky top-0 z-50 bg-[#7030a0] shadow-md px-4 sm:px-8 py-3 flex items-center justify-between text-white transition-all">
                    {/* Left: Dual Logo Branding matching mockup */}
                    <div className="flex items-center gap-3">
                        <img 
                            src={dostLogo} 
                            alt="DOST Logo" 
                            className="h-10 sm:h-12 w-auto object-contain drop-shadow-md" 
                        />
                        <div className="bg-white px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-sm flex items-center gap-2">
                            <img 
                                src={ihubLogo} 
                                alt="iHub GAD Emblem" 
                                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover" 
                            />
                            <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                                iHub<span className="text-[#7030a0]">GAD</span>
                            </span>
                        </div>
                    </div>

                    {/* Right: Nav Links + Actions + REGISTER Button */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold text-violet-100">
                            <a 
                                href="#services" 
                                onClick={() => {
                                    if (selectedLandingService) {
                                        handleBackToServices();
                                    }
                                }}
                                className="hover:text-white transition-colors cursor-pointer"
                            >
                                Services
                            </a>
                            <a href="#about" className="hover:text-white transition-colors cursor-pointer">
                                About
                            </a>
                            <a href="#contact" className="hover:text-white transition-colors cursor-pointer">
                                Contact us
                            </a>
                        </nav>

                        {/* Quick Departure / Evaluation Buttons */}
                        <div className="hidden lg:flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setFlowType('timeout');
                                    setShowCoverPage(false);
                                    setTimeoutStep(0);
                                    setTimeoutInput('');
                                    setVerifiedTimeoutVisitor(null);
                                    setTimeoutWarning('');
                                }}
                                className="text-violet-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Record Visitor Departure"
                            >
                                <LogOut size={13} />
                                <span>Time Out</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFlowType('evaluate');
                                    setShowCoverPage(false);
                                    setEvalStep(0);
                                    setEvalVerifyInput('');
                                    setVerifiedEvalVisitor(null);
                                    setEvalVisits([]);
                                    setEvalWarning('');
                                    setCodeValidated(false);
                                }}
                                className="text-violet-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Evaluate Services & Staff"
                            >
                                <Sparkles size={13} />
                                <span>Evaluate</span>
                            </button>
                        </div>

                        {/* Prominent REGISTER button matching mockup */}
                        <button
                            type="button"
                            onClick={() => {
                                handleInputChange('serviceAvailed', '');
                                setFlowType('register');
                                setShowCoverPage(false);
                                window.history.pushState({}, '', '/registration');
                            }}
                            className="bg-white hover:bg-violet-50 text-[#7030a0] px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                        >
                            REGISTER
                        </button>
                    </div>
                </header>

                {/* 2. HERO HEADER SECTION */}
                <section className="pt-10 sm:pt-16 pb-6 sm:pb-10 px-4 text-center max-w-4xl mx-auto flex flex-col items-center animate-in fade-in duration-500">
                    <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#7030a0] uppercase mb-1">
                        Welcome to
                    </span>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-none mb-3.5">
                        iHub<span className="text-[#7030a0]">GAD</span> Portal
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
                        A safe, nurturing, and gender-responsive space dedicated to child-care, maternal support, and family development at DOST Region 1.
                    </p>
                </section>

                {/* 3. SERVICES OFFERED / CODE INPUT INTERACTIVE SECTION */}
                <section id="services" className="px-4 sm:px-8 pb-12 max-w-6xl mx-auto w-full">
                    <div className="flex flex-col items-center sm:items-start mb-6">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Services Offered
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            {selectedLandingService 
                                ? `Time In for ${selectedLandingService}` 
                                : 'Select any service below to record your Time In for today\'s visit'}
                        </p>
                    </div>

                    {/* WHEN NO SERVICE IS SELECTED: Display 3 Cards side-by-side */}
                    {!selectedLandingService && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {PORTAL_SERVICES.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => handleSelectLandingService(service.label)}
                                    className="group bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 hover:border-[#7030a0] shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[380px] sm:min-h-[420px]"
                                >
                                    <div>
                                        {/* Station Badge + Emoji */}
                                        <div className="flex items-center justify-between mb-5">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${service.badgeBg}`}>
                                                {service.badge}
                                            </span>
                                            <span className="text-4xl group-hover:scale-125 transition-transform duration-300">
                                                {service.emoji}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-[#7030a0] transition-colors mb-1.5">
                                            {service.label}
                                        </h3>
                                        <p className="text-xs font-bold text-[#7030a0]/90 mb-3">
                                            {service.tagline}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                                            {service.desc}
                                        </p>

                                        {/* Features bullet list */}
                                        <div className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                                            {service.features.map((feat, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#7030a0]" />
                                                    <span>{feat}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="w-full py-3 bg-violet-50 group-hover:bg-[#7030a0] text-[#7030a0] group-hover:text-white rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                                        <span>Time In Here</span>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* WHEN A SERVICE IS SELECTED: Cards are removed, and Code Input is the ONLY one to appear */}
                    {selectedLandingService && (
                        <div className="animate-in fade-in zoom-in-95 duration-400 max-w-xl mx-auto w-full bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-2xl shadow-violet-100">
                            {/* Step 0: Enter Code ID or Email */}
                            {checkinStep === 0 && (
                                <>
                                    <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                                        <button
                                            type="button"
                                            onClick={handleBackToServices}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#7030a0] py-1.5 px-3 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer"
                                        >
                                            <ChevronLeft size={16} />
                                            <span>Choose another service</span>
                                        </button>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 text-[#7030a0] rounded-full text-xs font-extrabold tracking-wide">
                                            {PORTAL_SERVICES.find(s => s.label === selectedLandingService)?.emoji} {selectedLandingService}
                                        </span>
                                    </div>

                                    <div className="text-center sm:text-left mb-6">
                                        <h3 className="text-2xl font-black text-slate-850 tracking-tight mb-1.5">
                                            Time In Verification
                                        </h3>
                                        <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                                            Enter your 5-digit Visitor Code ID or registered Email Address to record your Time In for <span className="font-extrabold text-[#7030a0]">{selectedLandingService}</span>.
                                        </p>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-slate-700 text-xs font-bold mb-2">
                                                Visitor Code ID or Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type="text"
                                                    value={checkinInput}
                                                    onChange={(e) => setCheckinInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleVerifyVisitor();
                                                        }
                                                    }}
                                                    autoFocus
                                                    placeholder="e.g. 54321 or name@region1.dost.gov.ph"
                                                    className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 focus:bg-white transition-all text-slate-700"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={showScanner ? stopScanner : () => startScanner('checkin')}
                                                    className={`absolute right-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                                                        showScanner
                                                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                                            : 'bg-violet-50 text-[#7030a0] hover:bg-violet-100'
                                                    }`}
                                                    title={showScanner ? 'Close Scanner' : 'Scan Access Pass QR Code'}
                                                >
                                                    <Camera size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

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
                                                        Align QR code within box
                                                    </div>
                                                </>
                                            )}
                                            <canvas ref={canvasRef} className="hidden" />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleVerifyVisitor()}
                                        disabled={isVerifying || !checkinInput.trim()}
                                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2484] text-white rounded-2xl font-bold hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-violet-200"
                                    >
                                        {isVerifying ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <span>Verify Visitor & Continue</span>
                                        )}
                                    </button>

                                    {checkinWarning && (
                                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col items-start gap-2.5 text-left text-amber-900 animate-in fade-in duration-200">
                                            <div className="flex items-start gap-2.5">
                                                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                                <span className="text-xs font-semibold leading-relaxed">{checkinWarning}</span>
                                            </div>
                                            {checkinActiveVisit && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFlowType('timeout');
                                                        setShowCoverPage(false);
                                                        setVerifiedTimeoutVisitor(checkinActiveVisit);
                                                        setTimeoutStep(1);
                                                        setCheckinWarning('');
                                                        setCheckinActiveVisit(null);
                                                    }}
                                                    className="mt-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                                                >
                                                    <LogOut size={14} />
                                                    Record Time Out Now
                                                </button>
                                            )}
                                            {checkinWarning.includes('Please register first') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleInputChange('serviceAvailed', selectedLandingService || '');
                                                        setFlowType('register');
                                                        setCurrentPart(0);
                                                        setShowCoverPage(false);
                                                        setCheckinWarning('');
                                                        window.history.pushState({}, '', '/registration');
                                                    }}
                                                    className="mt-1 px-4 py-2 bg-[#7030a0] hover:bg-[#5b2783] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                                                >
                                                    Register First Entry Here →
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                                        <p className="text-xs text-slate-500 font-medium">
                                            First time visiting?{' '}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleInputChange('serviceAvailed', selectedLandingService || '');
                                                    setFlowType('register');
                                                    setShowCoverPage(false);
                                                    window.history.pushState({}, '', '/registration');
                                                }}
                                                className="font-bold text-[#7030a0] hover:underline cursor-pointer"
                                            >
                                                Register here to get your Access Pass
                                            </button>
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Step 1: Confirm Details & Select Accompanying Children */}
                            {checkinStep === 1 && verifiedVisitor && (
                                <>
                                    <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setCheckinStep(0)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#7030a0] py-1.5 px-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                            <ChevronLeft size={16} />
                                            <span>Back</span>
                                        </button>
                                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                                            ✓ Visitor Verified
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-extrabold text-slate-800 mb-1">Confirm Your Time In</h3>
                                    <p className="text-slate-500 text-xs font-semibold mb-5">
                                        Station: <span className="text-[#7030a0] font-black">{selectedLandingService || formData.serviceAvailed}</span>
                                    </p>

                                    {/* Visitor Profile Details */}
                                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5 text-left">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Visitor Profile</span>
                                        <div className="space-y-1.5 text-xs text-slate-700 font-semibold">
                                            <p><span className="text-slate-400 font-bold">Name:</span> {verifiedVisitor.parent_name}</p>
                                            {verifiedVisitor.email && <p><span className="text-slate-400 font-bold">Email:</span> {verifiedVisitor.email}</p>}
                                            <p><span className="text-slate-400 font-bold">Contact:</span> {verifiedVisitor.contact_number}</p>
                                            <p><span className="text-slate-400 font-bold">Agency/Address:</span> {verifiedVisitor.office_unit_address}</p>
                                        </div>
                                    </div>

                                    {/* Accompanying Children Selection */}
                                    <div className="mb-6 text-left">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">
                                            Accompanying Children (Select all that apply)
                                        </span>
                                        {Array.isArray(verifiedVisitor.children) && verifiedVisitor.children.length > 0 ? (
                                            <div className="flex flex-col gap-2.5">
                                                {verifiedVisitor.children.map((child, idx) => {
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
                                                            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                                isSelected ? 'border-[#7030a0] bg-violet-50/60 shadow-sm' : 'border-slate-200 hover:border-violet-200 bg-slate-50/50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <Baby className={`w-4 h-4 ${isSelected ? 'text-[#7030a0]' : 'text-slate-400'}`} />
                                                                <span className={`text-xs font-bold ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>{child.name}</span>
                                                                <span className="text-[11px] text-slate-400 font-medium">({child.age} yrs, {child.sex})</span>
                                                            </div>
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                                isSelected ? 'border-[#7030a0] bg-[#7030a0] text-white' : 'border-slate-300'
                                                            }`}>
                                                                {isSelected && <Check size={12} className="stroke-[3]" />}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-slate-400 text-xs italic py-2">
                                                No children registered under this profile. Proceeding with personal check-in.
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSubmitCheckin}
                                        disabled={isSubmittingCheckin}
                                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2484] text-white rounded-2xl font-bold hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-violet-200 cursor-pointer"
                                    >
                                        {isSubmittingCheckin ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Recording Time In...</span>
                                            </>
                                        ) : (
                                            <span>Complete Check-in</span>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* 4. BOTTOM HELPER PROMPT matching mockup */}
                    <div className="mt-10 sm:mt-12 text-center space-y-3">
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            Click{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    handleInputChange('serviceAvailed', '');
                                    setFlowType('register');
                                    setShowCoverPage(false);
                                    window.history.pushState({}, '', '/registration');
                                }}
                                className="font-extrabold text-[#7030a0] hover:underline cursor-pointer"
                            >
                                here
                            </button>{' '}
                            or the register button at the top if this is your first time
                        </p>

                        <a 
                            href="#about"
                            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-[#7030a0] transition-colors py-1 cursor-pointer"
                        >
                            <span>Don't know the system? Know more by scrolling</span>
                            <ChevronDown size={14} className="animate-bounce" />
                        </a>
                    </div>
                </section>

                {/* 5. QUICK DEPARTURE & FEEDBACK SECTION */}
                <section className="bg-slate-50 py-12 px-4 sm:px-8 border-y border-slate-200/70">
                    <div className="max-w-4xl mx-auto text-center mb-8">
                        <span className="text-[11px] font-black text-[#7030a0] uppercase tracking-wider block mb-1">
                            Visitor Actions
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Departing or Leaving Feedback?
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Use these quick actions before leaving the Innovation Hub
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setFlowType('timeout');
                                setShowCoverPage(false);
                                setTimeoutStep(0);
                                setTimeoutInput('');
                                setVerifiedTimeoutVisitor(null);
                                setTimeoutWarning('');
                            }}
                            className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-violet-300 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4 cursor-pointer hover:-translate-y-0.5"
                        >
                            <div className="p-3 bg-violet-50 text-[#7030a0] rounded-xl group-hover:bg-[#7030a0] group-hover:text-white transition-colors shrink-0">
                                <LogOut size={22} />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-[#7030a0] transition-colors">
                                    Record Departure (Time Out)
                                </h4>
                                <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
                                    Scan QR code or enter code ID to complete your visit duration.
                                </p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setFlowType('evaluate');
                                setShowCoverPage(false);
                                setEvalStep(0);
                                setEvalVerifyInput('');
                                setVerifiedEvalVisitor(null);
                                setEvalVisits([]);
                                setEvalWarning('');
                                setCodeValidated(false);
                            }}
                            className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-violet-300 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4 cursor-pointer hover:-translate-y-0.5"
                        >
                            <div className="p-3 bg-violet-50 text-[#7030a0] rounded-xl group-hover:bg-[#7030a0] group-hover:text-white transition-colors shrink-0">
                                <Sparkles size={22} />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-[#7030a0] transition-colors">
                                    Service Evaluation Survey
                                </h4>
                                <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
                                    Evaluate our staff, facilities, and child-care amenities in 1 minute.
                                </p>
                            </div>
                        </button>
                    </div>
                </section>

                {/* 6. ABOUT SECTION */}
                <section id="about" className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-[11px] font-black text-[#7030a0] uppercase tracking-wider block mb-1">
                            About The Hub
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Promoting Equality & Safe Spaces
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2 leading-relaxed">
                            The DOST Region 1 Innovation Hub for Gender and Development (iHub GAD) was established to champion family welfare, employee work-life integration, and women empowerment.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col">
                            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-lg mb-4">
                                <Heart size={20} />
                            </div>
                            <h3 className="font-extrabold text-slate-800 text-base mb-2">Child-Friendly Atmosphere</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Designed specifically for infants and toddlers with supervised toys, sanitizing protocols, and fun learning materials.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col">
                            <div className="w-10 h-10 rounded-2xl bg-violet-100 text-[#7030a0] flex items-center justify-center font-bold text-lg mb-4">
                                <ShieldCheck size={20} />
                            </div>
                            <h3 className="font-extrabold text-slate-800 text-base mb-2">Maternal Privacy & Health</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Fully equipped lactation station complying with national health policies, ensuring comfort and dignity for nursing mothers.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                                <BookOpen size={20} />
                            </div>
                            <h3 className="font-extrabold text-slate-800 text-base mb-2">Gender Literacy</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Comprehensive GAD repository featuring research, national guidelines, policy tools, and equality publications.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 7. CONTACT US & COMPLIANCE FOOTER */}
                <footer id="contact" className="bg-slate-900 text-white pt-12 pb-8 px-4 sm:px-8 mt-auto">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-800">
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="bg-white/10 p-1.5 rounded-lg">
                                    <img src={ihubLogo} alt="iHub GAD" className="h-6 w-6 rounded-full object-cover" />
                                </div>
                                <span className="font-black text-base tracking-tight text-white">
                                    DOST Region 1 <span className="text-violet-400">iHubGAD</span>
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-normal">
                                Department of Science and Technology - Regional Office No. 1<br />
                                Innovation Hub for Gender and Development (iHub GAD)
                            </p>
                        </div>

                        <div>
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 mb-3">
                                Location & Contact
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed font-normal space-y-1">
                                <span>📍 DMMMSU-MLUC Campus, City of San Fernando, La Union</span><br />
                                <span>📧 oord@region1.dost.gov.ph</span><br />
                                <span>☎️ (072) 888-3399 / 700-2372</span>
                            </p>
                        </div>

                        <div>
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 mb-3">
                                Data Privacy Compliance
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                "All visitor records are handled with strict confidentiality in full compliance with the Data Privacy Act of 2012 (Republic Act No. 10173)."
                            </p>
                            <div className="mt-3">
                                <a 
                                    href="/login" 
                                    className="text-[11px] font-bold text-violet-300 hover:text-white inline-flex items-center gap-1 transition-colors"
                                >
                                    <span>Administrator Login →</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium">
                        <p>© {new Date().getFullYear()} DOST Ilocos Region • Developed by ITSM Unit</p>
                        <p className="font-mono mt-1 sm:mt-0">v1.1.0 • GAD Innovation Portal</p>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Top Navigation Bar for Form Pages */}
            <header className="sticky top-0 z-50 bg-[#7030a0] shadow-md px-4 sm:px-8 py-3 flex items-center justify-between text-white">
                <button
                    type="button"
                    onClick={() => {
                        setShowBackConfirm(true);
                    }}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white hover:text-violet-200 transition-colors bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full cursor-pointer"
                >
                    <ChevronLeft size={16} />
                    <span>Back to Portal</span>
                </button>
                <div className="flex items-center gap-2.5">
                    <img src={dostLogo} alt="DOST Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
                    <span className="text-xs sm:text-sm font-black tracking-tight text-white hidden xs:inline">
                        iHub<span className="text-violet-200">GAD</span>
                    </span>
                </div>
            </header>
            <main className="flex-1 flex justify-center bg-white w-full">
                <div className="w-full bg-white flex flex-col lg:flex-row relative min-h-screen transition-all duration-300">

                    {/* Header Banner - Child Friendly */}
                    <div className="bg-[#7030a0] px-6 py-12 lg:py-24 text-center relative overflow-hidden shrink-0 lg:w-[35%] lg:flex lg:flex-col lg:justify-center lg:items-center lg:min-h-screen">
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
                        <div className="absolute top-[30%] left-[8%] text-white/15 animate-float-delayed">
                            <Palette size={28} />
                        </div>
                        <div className="absolute bottom-[30%] right-[10%] text-white/20 animate-float">
                            <Smile size={32} />
                        </div>
                        <div className="absolute top-[12%] left-[30%] text-white/10 animate-pulse-soft">
                            <Star size={24} />
                        </div>
                        <div className="absolute bottom-[10%] left-[8%] text-white/15 animate-bounce-subtle">
                            <Gift size={28} />
                        </div>
                        <div className="absolute top-[60%] left-[12%] text-white/15 animate-float">
                            <Sun size={36} />
                        </div>
                        <div className="absolute bottom-[20%] right-[30%] text-white/10 animate-float-delayed">
                            <Music size={26} />
                        </div>
                        <div className="absolute top-[45%] right-[25%] text-white/15 animate-pulse-soft">
                            <Star size={30} />
                        </div>
                        <div className="absolute bottom-[45%] left-[20%] text-white/10 animate-float-delayed">
                            <Shapes size={36} />
                        </div>

                        <div className="relative z-10">
                            {/* iHub GAD Logo in a white card with reduced top/bottom padding */}
                            <div className="flex justify-center mb-6 animate-in fade-in duration-700">
                                <div className="bg-white px-6 py-2.5 rounded-3xl shadow-2xl border border-violet-100/10 flex items-center justify-center hover:scale-[1.02] transition-transform duration-300">
                                    <img src={logo} alt="iHub GAD Logo" className="h-20 w-auto filter drop-shadow-sm" />
                                </div>
                            </div>

                            {/* GAD Info Card - Glassmorphism below the welcome title */}
                            <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-5 text-left max-w-sm mx-auto shadow-2xl mb-6 animate-in fade-in zoom-in-95 duration-700">
                                <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                                    <Baby size={16} className="text-pink-300" />
                                    Nurturing Progress & Equality
                                </h4>
                                <p className="text-[11px] text-violet-100/90 leading-relaxed">
                                    Your valuable feedback directly shapes the safe, supportive, and child-friendly GAD services we provide for women and children.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col h-full lg:max-h-screen overflow-hidden bg-[#FAF9FC]">
                        
                        {/* Static Top Header with Logos and Welcome Badge (Hidden on Cover Page) */}
                        {!showCoverPage && (
                            <div className="bg-[#FAF9FC] z-20 pt-8 lg:pt-14 pb-3 px-4 lg:px-6 border-b border-slate-100/40 flex flex-col items-center shrink-0">
                                {/* Logos at the top of the right pane (DOST Seal and Bagong Pilipinas only) */}
                                <div className="flex justify-center items-center gap-6 mb-3 animate-in fade-in duration-700">
                                    <img src="/DOST_seal.png" alt="DOST Seal" className="h-12 w-auto drop-shadow-sm" />
                                    <img src="/Bagong_Pilipinas_Logo.svg" alt="Bagong Pilipinas" className="h-12 w-auto drop-shadow-sm" />
                                </div>

                                {/* Welcome Badge on the Right */}
                                <div className="text-center animate-in fade-in duration-700">
                                    <div className="inline-block px-4 py-1.5 bg-violet-100 text-[#7030a0] rounded-full text-[10px] font-bold tracking-widest border border-violet-200/50 shadow-sm animate-pulse-soft">
                                        <PartyPopper size={12} className="inline mr-2 -mt-0.5" />
                                        WELCOME TO DOST ILOCOS REGION INNOVATION HUB
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scrollable Form Body */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-6 pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                        {showThankYou && (
                            <div className="text-center animate-in zoom-in-95 duration-500 py-8 max-w-md mx-auto my-6 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/30">
                                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-3">
                                    {flowType === 'register' ? 'Registration Complete!' : flowType === 'checkin' ? 'Check-in Complete!' : flowType === 'timeout' ? 'Departure Recorded!' : 'Thank You!'}
                                </h3>
                                {flowType === 'register' ? (
                                    <>
                                        <p className="text-slate-600 mb-6 text-sm">
                                            Your registration is complete. Please save your code below to submit your evaluation later.
                                        </p>
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
                                            <span className="text-sm font-medium text-slate-500 mb-2 block">Your Unique Code</span>
                                            <span className="text-4xl font-black text-[#7030a0] tracking-widest">{generatedCode}</span>
                                            {formData.email && (
                                                <p className="mt-3 text-xs text-violet-600 font-bold">
                                                    📧 A copy with your QR code & Access Pass was sent to {formData.email}
                                                </p>
                                            )}
                                        </div>
                                        {generatedIdCardUrl && (
                                            <div className="mb-8">
                                                <a
                                                    href={generatedIdCardUrl}
                                                    download={`AccessPass-${generatedCode}.png`}
                                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-50 hover:bg-violet-100 text-[#7030a0] border border-violet-200 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-sm"
                                                >
                                                    <Download size={16} />
                                                    Download Access Pass ID (Image)
                                                </a>
                                            </div>
                                        )}
                                    </>
                                ) : flowType === 'checkin' ? (
                                    <>
                                        <p className="text-slate-600 mb-4 text-sm">
                                            You have successfully recorded your Time In for <span className="font-extrabold text-[#7030a0]">{formData.serviceAvailed || 'this service'}</span>. Have a wonderful visit!
                                        </p>
                                        <div className="bg-violet-50 border border-violet-100/50 rounded-2xl p-4 mb-6 text-left">
                                            <p className="text-slate-700 text-xs leading-relaxed font-semibold">
                                                <span className="text-[#7030a0] font-extrabold">Notice:</span> Please do not forget to record your Time Out or submit your service evaluation before you leave today. Thank you!
                                            </p>
                                        </div>
                                    </>
                                ) : flowType === 'timeout' && timeoutResult ? (
                                    <>
                                        <p className="text-slate-600 mb-4 text-sm">
                                            Thank you for visiting the Innovation Hub for GAD! Your departure has been recorded.
                                        </p>
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 text-left space-y-2.5">
                                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                <span className="text-xs font-bold text-slate-500">Visitor</span>
                                                <span className="text-xs font-black text-slate-800">{timeoutResult.visitor?.parent_name}</span>
                                            </div>
                                            {timeoutResult.visitor?.service_availed && (
                                                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                    <span className="text-xs font-bold text-slate-500">Service Availed</span>
                                                    <span className="text-xs font-extrabold text-[#7030a0]">{timeoutResult.visitor?.service_availed}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                <span className="text-xs font-bold text-slate-500">Time In</span>
                                                <span className="text-xs font-extrabold text-slate-700">
                                                    {new Date(timeoutResult.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                <span className="text-xs font-bold text-slate-500">Time Out</span>
                                                <span className="text-xs font-extrabold text-slate-700">
                                                    {new Date(timeoutResult.timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-xs font-black text-[#7030a0] uppercase tracking-wider">Duration of Stay</span>
                                                <span className="inline-flex items-center px-2.5 py-1 bg-violet-100 text-[#7030a0] rounded-xl text-sm font-black shadow-sm">
                                                    <Clock size={14} className="mr-1.5" />
                                                    {timeoutResult.duration}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-violet-50 border border-violet-200/60 rounded-2xl p-4 mb-6 text-left">
                                            <p className="text-xs text-slate-700 font-semibold mb-3">
                                                Help us improve! Would you like to take a quick 1-minute survey about your visit today?
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const code = timeoutResult.visitor?.code;
                                                    setShowThankYou(false);
                                                    setFlowType('evaluate');
                                                    setEvalStep(0);
                                                    setEvalVerifyInput(code || '');
                                                    if (code) {
                                                        handleVerifyEvalVisitor(code);
                                                    }
                                                }}
                                                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-violet-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Sparkles size={14} />
                                                Take 1-Minute Service Evaluation
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-slate-600 mb-8 text-sm max-w-sm mx-auto">
                                        Your response will help us maintain a safe, nurturing, and supportive environment for children and parents alike.
                                    </p>
                                )}
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setTimeoutStep(0);
                                        setTimeoutInput('');
                                        setVerifiedTimeoutVisitor(null);
                                        setTimeoutWarning('');
                                        setTimeoutResult(null);
                                        setCheckinActiveVisit(null);
                                    }}
                                    className="bg-gradient-to-r from-violet-600 to-[#7030a0] text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        )}

                        {flowType === 'evaluate' && !codeValidated && !showThankYou && !showCoverPage && (
                            <div className="animate-in fade-in duration-300 max-w-lg mx-auto my-6 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-100/30">
                                {/* Step 0: Enter Code ID or Email */}
                                {evalStep === 0 && (
                                    <>
                                        <div className="flex items-center gap-2 mb-3">
                                            <button onClick={() => { setShowCoverPage(true); setFlowType(null); }} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <span className="text-[10px] font-black text-[#7030a0] uppercase tracking-wider">Service Evaluation</span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">Verify Visitor</h3>
                                        <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Enter your 5-digit Visitor Code ID or registered Email Address to verify your identity.</p>
                                        
                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <label className="block text-slate-700 text-xs font-bold mb-2">Code ID or Email Address</label>
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="text"
                                                        value={evalVerifyInput}
                                                        onChange={(e) => setEvalVerifyInput(e.target.value)}
                                                        placeholder="e.g. 54321 or name@region1.dost.gov.ph"
                                                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 focus:bg-white transition-all text-slate-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={showScanner ? stopScanner : () => startScanner('evaluate')}
                                                        className={`absolute right-2.5 p-2 rounded-lg transition-all ${showScanner && scannerTargetRef.current === 'evaluate' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-violet-50 text-[#7030a0] hover:bg-violet-100'}`}
                                                        title={showScanner ? 'Close Scanner' : 'Scan QR Code'}
                                                    >
                                                        <Camera size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {showScanner && scannerTargetRef.current === 'evaluate' && (
                                            <div className="mb-6 overflow-hidden rounded-2xl border border-violet-200 relative aspect-video bg-black flex items-center justify-center shadow-inner">
                                                <video
                                                    ref={videoRef}
                                                    className="w-full h-full object-cover"
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                />
                                                {scannerLoading ? (
                                                    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white text-xs font-semibold gap-2 z-10">
                                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Starting camera...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Scanning Target Box Overlay */}
                                                        <div className="absolute inset-0 border-[20px] sm:border-[30px] border-black/40 flex items-center justify-center pointer-events-none">
                                                            <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-[#7030a0] rounded-xl relative">
                                                                {/* Scanning animation line */}
                                                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-pink-500 animate-scan shadow-[0_0_8px_#ec4899]" />
                                                                
                                                                {/* Corner markers */}
                                                                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-500 -mt-0.5 -ml-0.5" />
                                                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-500 -mt-0.5 -mr-0.5" />
                                                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-500 -mb-0.5 -ml-0.5" />
                                                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-500 -mb-0.5 -mr-0.5" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-[9px] text-white px-2.5 py-1 rounded-full font-bold tracking-wider uppercase pointer-events-none">
                                                            Align QR code within box
                                                        </div>
                                                    </>
                                                )}
                                                <canvas ref={canvasRef} className="hidden" />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleVerifyEvalVisitor()}
                                            disabled={isVerifyingEval}
                                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            {isVerifyingEval ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                'Verify Visitor'
                                            )}
                                        </button>

                                        {evalWarning && (
                                            <div className="mt-4 p-4 bg-amber-50 border border-amber-250/60 rounded-2xl flex flex-col items-start gap-2.5 text-left text-amber-900 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-start gap-2.5">
                                                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                                    <span className="text-xs font-semibold leading-relaxed">{evalWarning}</span>
                                                </div>
                                                {evalWarning.includes('Please register first') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFlowType('register');
                                                            setCurrentPart(0);
                                                            setShowCoverPage(false);
                                                            setEvalWarning('');
                                                        }}
                                                        className="mt-1.5 px-4 py-1.5 bg-[#7030a0] hover:bg-[#5b2783] text-white text-[10px] font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                                                    >
                                                        Register Here
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Step 1: List Pending Evaluations */}
                                {evalStep === 1 && verifiedEvalVisitor && (
                                    <>
                                        <div className="flex items-center gap-2 mb-3">
                                            <button onClick={() => setEvalStep(0)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Visitor Verified</span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-1">Select Visit to Evaluate</h3>
                                        <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Choose from your visits below that have pending evaluations.</p>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 mb-6">
                                            {evalVisits.map((visit) => {
                                                const formattedDate = new Date(visit.date_of_use).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                                return (
                                                    <div
                                                        key={visit.id}
                                                        className="p-4 bg-slate-50 border border-slate-100 hover:border-violet-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all"
                                                    >
                                                        <div className="text-left">
                                                            <div className="font-extrabold text-slate-800 text-sm">{visit.service_availed || 'Visitor Center Service'}</div>
                                                            <div className="text-[11px] font-bold text-slate-400 mt-0.5">Date of Visit: {formattedDate}</div>
                                                            <div className="text-[10px] font-semibold text-[#7030a0] mt-0.5">Code ID: {visit.code}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                handleInputChange('serviceAvailed', visit.service_availed);
                                                                setUserCode(visit.code);
                                                                setRegistrationId(visit.id);
                                                                setCodeValidated(true);
                                                                setCurrentPart(1);
                                                            }}
                                                            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl text-xs font-bold hover:shadow-md active:scale-95 transition-all self-start sm:self-center"
                                                        >
                                                            Evaluate Visit
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => {
                                                setShowCoverPage(true);
                                                setFlowType(null);
                                            }}
                                            className="w-full text-slate-500 py-3.5 font-bold hover:bg-slate-50 rounded-2xl transition text-sm"
                                        >
                                            Back to Home
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Registration Flow Step 1: Basic Information */}
                        {flowType === 'register' && !showThankYou && !showCoverPage && currentPart === 0 && (
                            <div className="animate-in slide-in-from-right-8 duration-300 max-w-none mx-auto">
                                <div className="mb-6 flex justify-end text-sm text-slate-500 font-medium">
                                    <div className="flex gap-1">
                                        <div className="w-8 h-1.5 rounded-full bg-[#7030a0]" />
                                        <div className="w-8 h-1.5 rounded-full bg-slate-200" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-xl shadow-slate-100/30 mb-6">
                                    <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                                        <UserCircle className="text-[#7030a0]" size={22} />
                                        Part I. Basic Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">First Name <span className="text-red-500">*</span></label>
                                                <input type="text" className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50/50 focus:bg-white" placeholder="e.g. Maria" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Middle Name</label>
                                                <input type="text" className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50/50 focus:bg-white" placeholder="e.g. Cruz" value={formData.middleName} onChange={e => handleInputChange('middleName', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Last Name <span className="text-red-500">*</span></label>
                                                <input type="text" className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50/50 focus:bg-white" placeholder="e.g. Santos" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            {/* Sex Radio Buttons */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Sex</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['Male', 'Female'].map(option => {
                                                        const isSelected = formData.sex === option;
                                                        return (
                                                            <button
                                                                key={option}
                                                                type="button"
                                                                onClick={() => handleInputChange('sex', option)}
                                                                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border-2 transition-all font-semibold text-xs ${isSelected ? 'border-[#7030a0] bg-violet-50/50 text-[#7030a0] shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-600'}`}
                                                            >
                                                                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#7030a0]' : 'border-slate-300'}`}>
                                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#7030a0]" />}
                                                                </div>
                                                                <span>{option}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Birthdate */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Birthdate <span className="text-red-500">*</span></label>
                                                <input
                                                    type="date"
                                                    max={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50/50 focus:bg-white"
                                                    value={formData.birthdate}
                                                    onChange={e => handleInputChange('birthdate', e.target.value)}
                                                />
                                            </div>
                                            
                                            {/* Contact Number */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Contact Number <span className="text-red-500">*</span></label>
                                                <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#7030a0] focus-within:ring-4 focus-within:ring-violet-100 transition-all bg-slate-50/50 focus-within:bg-white">
                                                    <div className="bg-slate-50 border-r border-slate-200 px-3.5 py-2.5 text-xs text-slate-600 font-semibold">+63</div>
                                                    <input type="tel" maxLength={10} placeholder="912 345 6789" className="w-full px-3.5 py-2.5 text-xs outline-none bg-transparent" value={formData.contactNumber} onChange={e => handleInputChange('contactNumber', e.target.value.replace(/\D/g, ''))} />
                                                </div>
                                            </div>

                                            {/* Email Address */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Email Address</label>
                                                <input type="email" placeholder="e.g. youremail@region1.dost.gov.ph" className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50/50 focus:bg-white" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Client Type</label>
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
                                                            className={`flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl border-2 transition-all font-semibold text-xs ${isSelected ? 'border-[#7030a0] bg-violet-50/50 text-[#7030a0] shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-600'}`}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#7030a0]' : 'border-slate-300'}`}>
                                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#7030a0]" />}
                                                            </div>
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
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Office/Unit/Address <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter your office/unit/address"
                                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50/50 focus:bg-white"
                                                    value={formData.officeUnitOther}
                                                    onChange={e => handleInputChange('officeUnitOther', e.target.value)}
                                                />
                                            </div>
                                        )}

                                        {formData.officeUnitAddress === 'Others' && formData.clientType === 'Internal' && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Please specify address</label>
                                                <input type="text" placeholder="Type your office/unit/address" className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50/50 focus:bg-white" value={formData.officeUnitOther} onChange={e => handleInputChange('officeUnitOther', e.target.value)} />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4 pt-1">
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
                                                    options={(formData.province && ILOCOS_REGION_DATA[formData.province]) ? Object.keys(ILOCOS_REGION_DATA[formData.province]) : []}
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
                                                    options={(formData.province && formData.city && ILOCOS_REGION_DATA[formData.province]?.[formData.city]) ? ILOCOS_REGION_DATA[formData.province][formData.city] : []}
                                                    onChange={val => handleInputChange('barangay', val)}
                                                    placeholder="Select Barangay"
                                                    disabled={!formData.city}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 mb-4 w-full flex justify-end gap-3">
                                    <button onClick={() => { setFlowType(null); setShowCoverPage(true); window.history.pushState({}, '', '/'); }} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm bg-white font-semibold active:scale-95 transition-all text-sm">
                                        Cancel
                                    </button>
                                    <button onClick={goNext} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-violet-200 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200/50 text-base">
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Registration Flow Step 2: Children Information */}
                        {flowType === 'register' && !showThankYou && !showCoverPage && currentPart === 1 && (
                            <div className="animate-in slide-in-from-right-8 duration-300 max-w-none mx-auto">
                                <div className="mb-6 flex justify-end text-sm text-slate-500 font-medium">
                                    <div className="flex gap-1">
                                        <div className="w-8 h-1.5 rounded-full bg-violet-300" />
                                        <div className="w-8 h-1.5 rounded-full bg-[#7030a0]" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-xl shadow-slate-100/30 mb-6">
                                    <h4 className="font-black text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                                        <Baby className="text-[#7030a0]" size={22} />
                                        Children Information
                                    </h4>
                                    
                                    {formData.children.map((child, i) => (
                                        <div key={i} className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 shadow-sm mb-4 relative hover:border-violet-200 transition-colors">
                                            <div className="flex justify-between items-center mb-4 md:pl-2">
                                                <span className="font-bold text-slate-800 text-sm">Child {i + 1}</span>
                                                {formData.children.length > 1 && (
                                                    <button onClick={() => removeChild(i)} className="text-red-500 text-xs font-semibold hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors">
                                                        Discard
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-4 md:pl-2">
                                                <input
                                                    type="text"
                                                    placeholder="Name of Child *"
                                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-white"
                                                    value={child.name}
                                                    onChange={e => handleChildChange(i, 'name', e.target.value)}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block px-1">
                                                            Age *
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            maxLength={2}
                                                            placeholder="Age *"
                                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm text-center font-semibold bg-white"
                                                            value={child.age}
                                                            onChange={e => handleChildChange(i, 'age', e.target.value.replace(/\D/g, ''))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Sex *</label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {['Male', 'Female'].map(option => {
                                                                const isSelected = child.sex === option;
                                                                return (
                                                                    <button
                                                                        key={option}
                                                                        type="button"
                                                                        onClick={() => handleChildChange(i, 'sex', option)}
                                                                        className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border-2 transition-all font-semibold text-xs ${isSelected ? 'border-[#7030a0] bg-violet-50/50 text-[#7030a0] shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-600'}`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#7030a0]' : 'border-slate-300'}`}>
                                                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#7030a0]" />}
                                                                        </div>
                                                                        <span>{option}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button onClick={addChild} className="w-full py-3 mt-1.5 rounded-xl border-2 border-dashed border-violet-200 text-[#7030a0] font-semibold hover:bg-violet-50 transition-all flex items-center justify-center gap-2 hover:border-violet-300 text-sm">
                                        <span className="text-lg leading-none mb-0.5">+</span> Add Another Child
                                    </button>
                                </div>

                                <div className="mt-8 mb-4 w-full flex justify-end gap-3">
                                    <button onClick={() => setCurrentPart(0)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm bg-white font-semibold active:scale-95 transition-all text-sm">
                                        Back
                                    </button>
                                    <button onClick={goNext} disabled={submitting} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-violet-200 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200/50 text-base">
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
                                <div key={part.key} className="animate-in slide-in-from-right-8 duration-300 max-w-none mx-auto">
                                    <div className="mb-6 flex justify-end text-sm text-slate-500 font-medium">
                                        <div className="flex gap-1">
                                            {Array.from({ length: totalParts }).map((_, i) => (
                                                <div key={i} className={`w-8 h-1.5 rounded-full ${i === currentPart ? 'bg-[#7030a0]' : i < currentPart ? 'bg-violet-300' : 'bg-slate-200'}`} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-xl shadow-slate-100/30 mb-6">
                                        <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                                            <FileText className="text-[#7030a0]" size={22} />
                                            {part.label}
                                        </h3>
                                        <p className="text-slate-600 text-xs font-semibold mb-6 -mt-3">{hasEmoji ? 'Please check the box that best reflects your experience:' : 'Please answer each question.'}</p>

                                        <div className="space-y-5">
                                            {part.questions.map((q, qIndex) => (
                                                <div key={q.key} className="space-y-2.5">
                                                    <label className="text-xs font-extrabold text-slate-700 block ml-1">{qIndex + 1}. {q.label}</label>
                                                    {q.answerType === 'text' ? (
                                                        <textarea className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm resize-none h-28 bg-slate-50/50 focus:bg-white" placeholder="Type your answer..." value={formData[q.key] || ''} onChange={e => handleInputChange(q.key, e.target.value)}></textarea>
                                                    ) : q.answerType === 'satisfaction' ? (
                                                        <div className="space-y-2">
                                                            {OVERALL_SATISFACTION_OPTIONS.map(opt => {
                                                                const isSelected = formData[q.key] === opt.label;
                                                                return (
                                                                    <button
                                                                        key={opt.label}
                                                                        onClick={() => handleInputChange(q.key, opt.label)}
                                                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${isSelected ? `${opt.activeBg} border-transparent ring-2 ring-offset-1 ring-${opt.color.split('-')[1]}-400 shadow-md transform scale-[1.01]` : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                                                    >
                                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-sm ring-1 ring-slate-100`}>
                                                                            <span className="text-xl">{opt.emoji}</span>
                                                                        </div>
                                                                        <span className={`font-semibold text-sm ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{opt.label}</span>
                                                                        {isSelected && <div className={`ml-auto w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm ${opt.color}`}><Check size={12} strokeWidth={3} /></div>}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : q.answerType === 'radio' ? (
                                                        <div className="space-y-2">
                                                            {(q.options || []).map(optLabel => {
                                                                const isSelected = formData[q.key] === optLabel;
                                                                return (
                                                                    <button
                                                                        key={optLabel}
                                                                        onClick={() => handleInputChange(q.key, optLabel)}
                                                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${isSelected ? 'border-[#7030a0] bg-violet-50' : 'border-slate-100 hover:border-violet-200 hover:bg-slate-50 text-slate-700'}`}
                                                                    >
                                                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'border-[#7030a0] bg-[#7030a0]' : 'border-slate-300'}`}>
                                                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                                                        </div>
                                                                        <span className={`font-semibold text-sm transition-colors ${isSelected ? 'text-[#7030a0]' : 'text-slate-700'}`}>
                                                                            {optLabel}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between items-center gap-1 sm:gap-2 bg-slate-50/50 p-2 sm:p-2.5 rounded-2xl border border-slate-100">
                                                            {EVAL_OPTIONS.map(opt => {
                                                                const isSelected = formData[q.key] === opt.value;
                                                                return (
                                                                    <button
                                                                        key={opt.value}
                                                                        onClick={() => handleInputChange(q.key, opt.value)}
                                                                        className="group flex flex-col items-center gap-1.5 flex-1 focus:outline-none"
                                                                    >
                                                                        <div className="relative">
                                                                            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isSelected ? `${opt.bg} ${opt.activeBorder} scale-105 shadow-sm` : 'bg-white border-violet-100 group-hover:border-violet-300 group-hover:bg-violet-50/50'}`}>
                                                                                <span className="text-lg sm:text-xl">{opt.emoji}</span>
                                                                            </div>
                                                                            {isSelected && (
                                                                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-[#7030a0] rounded-full flex items-center justify-center border border-white shadow-sm animate-in zoom-in duration-200">
                                                                                    <Check size={9} strokeWidth={3} className="text-white" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <span className={`text-[8.5px] sm:text-[9.5px] font-bold text-center ${isSelected ? 'text-[#7030a0] font-black' : 'text-slate-500'}`}>
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
                                    </div>

                                    <div className="mt-8 mb-4 w-full flex justify-end gap-3">
                                        {currentPart === 1 ? (
                                            <button onClick={() => setShowBackConfirm(true)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm bg-white font-semibold active:scale-95 transition-all text-sm flex items-center justify-center gap-1.5">
                                                Back
                                            </button>
                                        ) : currentPart > 1 && (
                                            <button onClick={() => setCurrentPart(p => p - 1)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm bg-white font-semibold active:scale-95 transition-all text-sm flex items-center justify-center gap-1.5">
                                                Back
                                            </button>
                                        )}
                                        <button onClick={goNext} disabled={submitting} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-violet-200 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200/50 text-base">
                                            {submitting ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'Continue'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Comments Part */}
                        {flowType === 'evaluate' && codeValidated && !showThankYou && currentPart === totalParts - 1 && (
                            <div className="animate-in slide-in-from-right-8 duration-300 max-w-none mx-auto">
                                <div className="mb-6 flex justify-end text-sm text-slate-500 font-medium">
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalParts }).map((_, i) => (
                                            <div key={i} className={`w-8 h-1.5 rounded-full ${i === currentPart ? 'bg-[#7030a0]' : i < currentPart ? 'bg-violet-300' : 'bg-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-xl shadow-slate-100/30">
                                    <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                                        <Heart className="text-[#7030a0]" size={22} />
                                        Suggestions for Improvement
                                    </h3>
                                    <p className="text-slate-600 text-xs font-semibold mb-6 -mt-3">Please share your comments and recommendations to help us enhance the facility and services:</p>
                                    <textarea className="w-full p-5 rounded-2xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm resize-none h-40 bg-slate-50/50 focus:bg-white" placeholder="Type your comments and recommendations here..." value={formData.comments} onChange={e => handleInputChange('comments', e.target.value)}></textarea>

                                    <div className="mt-8 mb-4 w-full flex justify-end gap-3">
                                        <button onClick={() => setCurrentPart(p => p - 1)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm bg-white font-semibold active:scale-95 transition-all text-sm flex items-center justify-center gap-1.5">
                                            Back
                                        </button>
                                        <button onClick={goNext} disabled={submitting} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-violet-200 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200/50 text-base">
                                            {submitting ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {flowType === 'checkin' && !showThankYou && !showCoverPage && (
                            <div className="animate-in fade-in duration-300 max-w-lg mx-auto my-6 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-100/30">
                                
                                {/* Step 0: Enter Code ID or Email */}
                                {checkinStep === 0 && (
                                    <>
                                        <div className="flex items-center gap-2 mb-3">
                                            <button onClick={() => { setShowCoverPage(true); setFlowType(null); setShowServicesModal(true); }} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <span className="text-[10px] font-black text-[#7030a0] uppercase tracking-wider">
                                                Returning Visitor {formData.serviceAvailed ? `• ${formData.serviceAvailed}` : ''}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">Check-in (Time In)</h3>
                                        <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
                                            Enter your 5-digit Visitor Code ID or registered Email Address to record your Time In {formData.serviceAvailed ? `for ${formData.serviceAvailed}` : ''}.
                                        </p>
                                        
                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <label className="block text-slate-700 text-xs font-bold mb-2">Code ID or Email Address</label>
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="text"
                                                        value={checkinInput}
                                                        onChange={(e) => setCheckinInput(e.target.value)}
                                                        placeholder="e.g. 54321 or name@region1.dost.gov.ph"
                                                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 focus:bg-white transition-all text-slate-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={showScanner ? stopScanner : startScanner}
                                                        className={`absolute right-2.5 p-2 rounded-lg transition-all ${showScanner ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-violet-50 text-[#7030a0] hover:bg-violet-100'}`}
                                                        title={showScanner ? 'Close Scanner' : 'Scan QR Code'}
                                                    >
                                                        <Camera size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {showScanner && (
                                            <div className="mb-6 overflow-hidden rounded-2xl border border-violet-200 relative aspect-video bg-black flex items-center justify-center shadow-inner">
                                                <video
                                                    ref={videoRef}
                                                    className="w-full h-full object-cover"
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                />
                                                {scannerLoading ? (
                                                    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white text-xs font-semibold gap-2 z-10">
                                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Starting camera...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Scanning Target Box Overlay */}
                                                        <div className="absolute inset-0 border-[20px] sm:border-[30px] border-black/40 flex items-center justify-center pointer-events-none">
                                                            <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-[#7030a0] rounded-xl relative">
                                                                {/* Scanning animation line */}
                                                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-pink-500 animate-scan shadow-[0_0_8px_#ec4899]" />
                                                                
                                                                {/* Corner markers */}
                                                                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-500 -mt-0.5 -ml-0.5" />
                                                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-500 -mt-0.5 -mr-0.5" />
                                                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-500 -mb-0.5 -ml-0.5" />
                                                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-500 -mb-0.5 -mr-0.5" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-[9px] text-white px-2.5 py-1 rounded-full font-bold tracking-wider uppercase pointer-events-none">
                                                            Align QR code within box
                                                        </div>
                                                    </>
                                                )}
                                                <canvas ref={canvasRef} className="hidden" />
                                            </div>
                                        )}

                                        <button
                                            onClick={handleVerifyVisitor}
                                            disabled={isVerifying}
                                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            {isVerifying ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                'Verify Visitor'
                                            )}
                                        </button>

                                        {checkinWarning && (
                                            <div className="mt-4 p-4 bg-amber-50 border border-amber-250/60 rounded-2xl flex flex-col items-start gap-2.5 text-left text-amber-900 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-start gap-2.5">
                                                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                                    <span className="text-xs font-semibold leading-relaxed">{checkinWarning}</span>
                                                </div>
                                                {checkinActiveVisit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFlowType('timeout');
                                                            setVerifiedTimeoutVisitor(checkinActiveVisit);
                                                            setTimeoutStep(1);
                                                            setCheckinWarning('');
                                                            setCheckinActiveVisit(null);
                                                        }}
                                                        className="mt-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2783] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                                                    >
                                                        <LogOut size={14} />
                                                        Record Time Out Now
                                                    </button>
                                                )}
                                                {checkinWarning.includes('Please register first') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFlowType('register');
                                                            setCurrentPart(0);
                                                            setShowCoverPage(false);
                                                            setCheckinWarning('');
                                                        }}
                                                        className="mt-1.5 px-4 py-1.5 bg-[#7030a0] hover:bg-[#5b2783] text-white text-[10px] font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                                                    >
                                                        Register Here
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Step 1: Verified Visitor & Select Accompanying Children */}
                                {checkinStep === 1 && verifiedVisitor && (
                                    <>
                                        <div className="flex items-center gap-2 mb-3">
                                            <button onClick={() => setCheckinStep(0)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Visitor Verified</span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-1">Confirm Details</h3>
                                        <p className="text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-5">Station: {formData.serviceAvailed}</p>

                                        {/* Visitor Profile Details */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-left">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Parent / Guardian Profile</span>
                                            <div className="space-y-1.5 text-xs text-slate-700 font-semibold">
                                                <p><span className="text-slate-400 font-bold">Name:</span> {verifiedVisitor.parent_name}</p>
                                                {verifiedVisitor.email && <p><span className="text-slate-400 font-bold">Email:</span> {verifiedVisitor.email}</p>}
                                                <p><span className="text-slate-400 font-bold">Contact:</span> {verifiedVisitor.contact_number}</p>
                                                <p><span className="text-slate-400 font-bold">Address:</span> {verifiedVisitor.office_unit_address}</p>
                                            </div>
                                        </div>

                                        {/* Children Selection */}
                                        <div className="mb-6 text-left">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Accompanying Children (Select all that apply)</span>
                                            
                                            {Array.isArray(verifiedVisitor.children) && verifiedVisitor.children.length > 0 ? (
                                                <div className="flex flex-col gap-2.5">
                                                    {verifiedVisitor.children.map((child, idx) => {
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
                                                                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${isSelected ? 'border-[#7030a0] bg-violet-50/50' : 'border-slate-100 hover:border-violet-100 bg-slate-50/30'}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Baby className={`w-4 h-4 ${isSelected ? 'text-[#7030a0]' : 'text-slate-400'}`} />
                                                                    <span className={`text-xs font-bold ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>{child.name}</span>
                                                                    <span className="text-[10px] text-slate-400 font-bold">({child.age} yrs, {child.sex})</span>
                                                                </div>
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'border-[#7030a0] bg-[#7030a0] text-white' : 'border-slate-300'}`}>
                                                                    {isSelected && <Check size={12} className="stroke-[3]" />}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-slate-400 text-xs italic py-2">No children registered under this profile. Proceed with check-in.</div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleSubmitCheckin}
                                            disabled={isSubmittingCheckin}
                                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            {isSubmittingCheckin ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                'Complete Check-in'
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Time Out Flow */}
                        {flowType === 'timeout' && !showThankYou && !showCoverPage && (
                            <div className="animate-in fade-in duration-300 max-w-lg mx-auto my-6 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-100/30">
                                {/* Step 0: Enter Code or Scan QR */}
                                {timeoutStep === 0 && (
                                    <>
                                        <div className="flex items-center gap-2 mb-3">
                                            <button onClick={() => { setShowCoverPage(true); setFlowType(null); }} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <span className="text-[10px] font-black text-[#7030a0] uppercase tracking-wider">Visitor Departure</span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">Record Time Out</h3>
                                        <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Scan your Access Pass QR code or enter your 5-digit Visitor Code / Email to record your departure.</p>

                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <label className="block text-slate-700 text-xs font-bold mb-2">Code ID or Email Address</label>
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="text"
                                                        value={timeoutInput}
                                                        onChange={(e) => setTimeoutInput(e.target.value)}
                                                        placeholder="e.g. 54321 or name@region1.dost.gov.ph"
                                                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 focus:bg-white transition-all text-slate-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={showScanner && scannerTargetRef.current === 'timeout' ? stopScanner : () => startScanner('timeout')}
                                                        className={`absolute right-2.5 p-2 rounded-lg transition-all ${showScanner && scannerTargetRef.current === 'timeout' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-violet-50 text-[#7030a0] hover:bg-violet-100'}`}
                                                        title={showScanner ? 'Close Scanner' : 'Scan QR Code'}
                                                    >
                                                        <Camera size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {showScanner && scannerTargetRef.current === 'timeout' && (
                                            <div className="mb-6 overflow-hidden rounded-2xl border border-violet-200 relative aspect-video bg-black flex items-center justify-center shadow-inner">
                                                <video
                                                    ref={videoRef}
                                                    className="w-full h-full object-cover"
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                />
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
                                                            Align QR code within box
                                                        </div>
                                                    </>
                                                )}
                                                <canvas ref={canvasRef} className="hidden" />
                                            </div>
                                        )}

                                        <button
                                            onClick={handleVerifyTimeoutVisitor}
                                            disabled={isVerifyingTimeout}
                                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            {isVerifyingTimeout ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                'Verify & Proceed'
                                            )}
                                        </button>

                                        {timeoutWarning && (
                                            <div className="mt-4 p-4 bg-amber-50 border border-amber-250/60 rounded-2xl flex items-start gap-2.5 text-left text-amber-900 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                                <span className="text-xs font-semibold leading-relaxed">{timeoutWarning}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Step 1: Confirm Departure */}
                                {timeoutStep === 1 && verifiedTimeoutVisitor && (
                                    <>
                                        <div className="flex items-center gap-2 mb-3">
                                            <button onClick={() => setTimeoutStep(0)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Visitor Located</span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-1">Confirm Departure</h3>
                                        <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Review your visit details and confirm your departure time.</p>

                                        {/* Visit Summary Card */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-left space-y-3">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Visitor Name</span>
                                                <span className="text-sm font-extrabold text-slate-800">{verifiedTimeoutVisitor.parent_name}</span>
                                            </div>
                                            {verifiedTimeoutVisitor.service_availed && (
                                                <div>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Service Availed</span>
                                                    <span className="text-xs font-extrabold text-[#7030a0]">{verifiedTimeoutVisitor.service_availed}</span>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                                                <div>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Time In</span>
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {new Date(verifiedTimeoutVisitor.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Current Time</span>
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                                <span className="text-xs font-black text-slate-600">Calculated Stay Duration</span>
                                                <span className="inline-flex items-center px-2 py-0.5 bg-violet-100 text-[#7030a0] rounded-lg text-xs font-black">
                                                    <Clock size={12} className="mr-1" />
                                                    {formatDuration(verifiedTimeoutVisitor.created_at, new Date().toISOString())}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleConfirmTimeout}
                                            disabled={isSubmittingTimeout}
                                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            {isSubmittingTimeout ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <LogOut size={16} />
                                                    Confirm Time Out & Exit
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                    {/* Services Modal */}
                    {showServicesModal && (
                        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/45 backdrop-blur-sm" onClick={() => setShowServicesModal(false)}>
                            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Available GAD Hub Services</h3>
                                        <p className="text-[#7030a0] text-[10px] font-black uppercase tracking-wider mt-0.5">DOST Ilocos Region Innovation Hub</p>
                                    </div>
                                    <button onClick={() => setShowServicesModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-4 mb-2">
                                    {[
                                        {
                                            label: 'Child Minding Station',
                                            emoji: '🧒',
                                            desc: 'A secure, supervised, and fun play area equipped with child-friendly educational toys, books, and nursery amenities for infants and toddlers.',
                                        },
                                        {
                                            label: 'Mother and Child Care',
                                            emoji: '🤱',
                                            desc: 'A quiet, private lactation room and care space designed for nursing mothers, diaper changes, and maternal support services.',
                                        },
                                        {
                                            label: 'GAD Learning Resource Center',
                                            emoji: '📚',
                                            desc: 'A comprehensive library offering specialized Gender and Development literature, policy guidelines, and interactive resources promoting gender-responsive education.',
                                        }
                                    ].map((service, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                setShowServicesModal(false);
                                                handleInputChange('serviceAvailed', service.label);
                                                setFlowType('checkin');
                                                setCheckinStep(0);
                                                setVerifiedVisitor(null);
                                                setCheckinInput('');
                                                setSelectedChildren([]);
                                                setShowCoverPage(false);
                                            }}
                                            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex gap-4 hover:border-violet-200 transition-all hover:bg-white cursor-pointer hover:shadow-md hover:scale-[1.01] duration-200 text-left group"
                                        >
                                            <span className="text-4xl shrink-0 mt-0.5">{service.emoji}</span>
                                            <div className="flex-1">
                                                <h4 className="font-extrabold text-slate-800 text-sm">{service.label}</h4>
                                                <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-1">{service.desc}</p>
                                                <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-[#7030a0] group-hover:underline">
                                                    Time In for this service &rarr;
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

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

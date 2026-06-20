import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_FORM_PARTS } from '../constants/feedback';

/**
 * Custom hook for managing the multi-step Feedback Form state and logic.
 * Handles registration, evaluation flow, dynamic question fetching, and submission.
 * 
 * @returns {Object} A comprehensive state object and handler functions for the feedback form.
 */
export function useFeedbackForm() {
    // List of form sections (fetched from DB or defaulted)
    const [formParts, setFormParts] = useState(DEFAULT_FORM_PARTS);
    
    // Main form state containing all user inputs
    const [formData, setFormData] = useState({
        firstName: '', middleName: '', lastName: '', sex: '', email: '', birthdate: '', countryCode: '+63', contactNumber: '',
        clientType: 'Internal', officeUnitAddress: '', officeUnitOther: '',
        province: '', city: '', barangay: '',
        children: [{ name: '', age: '', sex: '' }],
        activities: '',
        dateOfUse: new Date().toISOString().split('T')[0],
        comments: '',
        serviceAvailed: '',
    });

    // Navigation and flow control state
    const [flowType, setFlowType] = useState(window.location.pathname === '/registration' ? 'register' : null); // 'register' | 'evaluate' | null
    const [userCode, setUserCode] = useState(''); // 5-digit code entered by user
    const [codeValidated, setCodeValidated] = useState(false); // Whether enter code is verified
    const [generatedCode, setGeneratedCode] = useState(''); // Newly generated code for registration
    const [registrationId, setRegistrationId] = useState(null); // DB ID of the current registration record
    const [currentPart, setCurrentPart] = useState(0); // Current wizard step index
    const [showCoverPage, setShowCoverPage] = useState(window.location.pathname === '/registration' ? false : true); // Toggle for intro screen
    const [showThankYou, setShowThankYou] = useState(false); // Toggle for success screen
    const [submitting, setSubmitting] = useState(false); // Form submission status
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'error' });

    const triggerSnackbar = (message, type = 'error') => {
        setSnackbar({ show: true, message, type });
    };


    /**
     * Effect hook to fetch form structure (parts and questions) from Supabase on mount.
     */
    useEffect(() => {
        async function fetchFormParts() {
            try {
                const { data: partsData } = await supabase.from('form_parts').select('key, sort_order, label').order('sort_order');
                const { data: questionsData } = await supabase.from('questions').select('part, sort_order, key, label, answer_type, options').order('part').order('sort_order');
                if (partsData && questionsData) {
                    const parts = partsData
                        .map(p => ({
                            key: p.key, label: p.label,
                            questions: questionsData.filter(q => q.part === p.key).map(q => ({
                                key: q.key,
                                label: q.label,
                                answerType: q.answer_type || 'emoji',
                                options: q.options || []
                            }))
                        }))
                        .filter(p => p.questions.length > 0);
                    if (parts.length > 0) setFormParts(parts);
                }
            } catch (e) { console.error('Error fetching parts:', e); }
        }
        fetchFormParts();
    }, []);

    /**
     * Updates a single field in the formData state.
     * @param {string} field - The field name to update.
     * @param {any} value - The new value.
     */
    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    /**
     * Updates a specific field for a child at a given index.
     * @param {number} index - Index in the children array.
     * @param {string} field - Field name (name, age, sex).
     * @param {any} value - The new value.
     */
    const handleChildChange = (index, field, value) => {
        const newChildren = [...formData.children];
        newChildren[index][field] = value;
        handleInputChange('children', newChildren);
    };

    /** Adds a new empty child entry to the form. */
    const addChild = () => handleInputChange('children', [...formData.children, { name: '', age: '', sex: '' }]);

    /**
     * Removes a child entry at the specified index.
     * @param {number} index - Index to remove.
     */
    const removeChild = (index) => {
        if (formData.children.length === 1) return;
        const newChildren = [...formData.children];
        newChildren.splice(index, 1);
        handleInputChange('children', newChildren);
    };

    /**
     * Validates basic user/parent details (Step 1 of Registration).
     * @returns {boolean} True if valid.
     */
    const validateBasicInfo = () => {
        if (!formData.firstName.trim()) { triggerSnackbar('Please enter your first name'); return false; }
        if (!formData.lastName.trim()) { triggerSnackbar('Please enter your last name'); return false; }
        if (!formData.birthdate) { triggerSnackbar('Please enter your birthdate'); return false; }
        if (formData.contactNumber.replace(/\D/g, '').length !== 10) { triggerSnackbar('Contact number must be exactly 10 digits.'); return false; }
        if (formData.clientType === 'Internal' && !formData.officeUnitAddress) { triggerSnackbar('Please select your office/unit'); return false; }
        if ((formData.clientType === 'External' || formData.officeUnitAddress === 'Others') && !formData.officeUnitOther.trim()) { triggerSnackbar('Please specify your address'); return false; }
        return true;
    };

    /**
     * Validates children details and activities (Step 2 of Registration).
     * @returns {boolean} True if valid.
     */
    const validateChildrenInfo = () => {
        const requiresChildren = formData.serviceAvailed === 'Child Minding Station' || formData.serviceAvailed === 'Mother and Child Care';
        const hasChildData = formData.children.some(c => (c.name || '').trim() || (c.age || '').trim() || (c.sex || '').trim());
        
        if (requiresChildren || hasChildData) {
            if (formData.children.some(c => !(c.name || '').trim() || !(c.age || '').trim() || !(c.sex || '').trim())) {
                triggerSnackbar('Please fill in all child details (Name, Age, and Sex).');
                return false;
            }
        }
        if (formData.serviceAvailed === 'Mother and Child Care' && !formData.activities.trim()) { triggerSnackbar('Please enter the activities.'); return false; }
        return true;
    };

    /**
     * Validates Part I of the form (Registration details).
     * @returns {boolean} True if valid, shows alert and return false otherwise.
     */
    const validateRegistration = () => {
        return validateBasicInfo() && validateChildrenInfo();
    };

    /**
     * Generates a unique 5-digit code and submits the registration data to Supabase.
     */
    const submitRegistration = async () => {
        if (!validateRegistration()) return;
        setSubmitting(true);
        try {
            let code;
            let isUnique = false;
            while (!isUnique) {
                code = Math.floor(10000 + Math.random() * 90000).toString();
                const { data } = await supabase.from('registrations').select('code').eq('code', code).single();
                if (!data) isUnique = true;
            }
            const activeChildren = formData.children.filter(c => (c.name || '').trim() || (c.age || '').trim() || (c.sex || '').trim());
            const row = {
                code,
                first_name: formData.firstName,
                middle_name: formData.middleName || null,
                last_name: formData.lastName,
                parent_name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim().replace(/\s+/g, ' '),
                sex: formData.sex || null,
                email: formData.email || null,
                birthdate: formData.birthdate || null,
                country_code: formData.countryCode || null,
                contact_number: formData.contactNumber,
                client_type: formData.clientType,
                office_unit_address: formData.clientType === 'Internal' ? formData.officeUnitAddress : formData.officeUnitOther,
                office_unit_other: formData.officeUnitAddress === 'Others' || formData.clientType === 'External' ? formData.officeUnitOther : null,
                province: formData.province || null,
                city: formData.city || null,
                barangay: formData.barangay || null,
                children: activeChildren,
                date_of_use: formData.dateOfUse,
                service_availed: formData.serviceAvailed || null,
                activities: formData.activities || null,
            };
            const { error } = await supabase.from('registrations').insert([row]);
            if (error) throw error;
            setGeneratedCode(code);

            // Send registration code to email if provided
            if (formData.email && formData.email.trim()) {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    await fetch(`${apiUrl}/api/send-email`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: formData.email,
                            code: code,
                            parentName: `${formData.firstName} ${formData.lastName}`.trim(),
                        }),
                    });
                } catch (emailErr) {
                    console.error('Failed to send registration code email:', emailErr);
                }
            }

            setShowThankYou(true);
        } catch (e) {
            console.error('Registration submission error:', e);
            triggerSnackbar(`Could not submit registration. ${e.message || ''}`);
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Validates the 5-digit code entered by the user to start an evaluation.
     */
    const validateUserCode = async () => {
        if (userCode.length !== 5) { triggerSnackbar('Enter a 5-digit code.'); return; }
        setSubmitting(true);
        try {
            const { data, error } = await supabase.from('registrations').select('id').eq('code', userCode).single();
            if (error || !data) throw new Error(error?.message || 'Code not found');
            setRegistrationId(data.id);
            setCodeValidated(true);
            setCurrentPart(1);
        } catch (e) {
            console.error('Code validation error:', e);
            triggerSnackbar('Invalid or non-existent code.');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Validates that all question parts have answers and submits the evaluation to Supabase.
     */
    const submitEvaluation = async () => {
        for (let i = 0; i < formParts.length; i++) {
            const requiredQuestions = formParts[i].questions.filter(q => q.answerType !== 'text');
            const allAnswered = requiredQuestions.every(q => {
                const val = formData[q.key];
                return val !== undefined && val !== null && String(val).trim() !== '';
            });
            if (!allAnswered) {
                triggerSnackbar(`Please answer all questions in ${formParts[i].label}.`);
                return;
            }
        }
        setSubmitting(true);
        try {
            const answers = {};
            formParts.forEach(part => part.questions.forEach(q => { answers[q.key] = formData[q.key] || null; }));
            const { error } = await supabase.from('evaluations').insert([{
                registration_id: registrationId,
                answers, comments: formData.comments || null
            }]);
            if (error) throw error;
            setShowThankYou(true);
        } catch (e) {
            console.error('Evaluation submission error:', e);
            triggerSnackbar(`Could not submit evaluation. ${e.message || ''}`);
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Resets the entire form flow and data to its initial state.
     */
    const resetForm = () => {
        setFormData({
            firstName: '', middleName: '', lastName: '', sex: '', email: '', birthdate: '', countryCode: '+63', contactNumber: '',
            clientType: 'Internal', officeUnitAddress: '', officeUnitOther: '',
            province: '', city: '', barangay: '',
            children: [{ name: '', age: '', sex: '' }],
            activities: '',
            dateOfUse: new Date().toISOString().split('T')[0], comments: '', serviceAvailed: ''
        });
        const isRegPath = window.location.pathname === '/registration';
        setCurrentPart(0); 
        setFlowType(isRegPath ? 'register' : null); 
        setShowCoverPage(isRegPath ? false : true); 
        setShowThankYou(false); 
        setCodeValidated(false); 
        setUserCode('');
    };

    return {
        formParts,
        formData,
        flowType,
        setFlowType,
        userCode,
        setUserCode,
        codeValidated,
        setCodeValidated,
        generatedCode,
        setGeneratedCode,
        registrationId,
        setRegistrationId,
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
        totalParts: formParts.length + 2,
        snackbar,
        setSnackbar,
        triggerSnackbar,
    };
}

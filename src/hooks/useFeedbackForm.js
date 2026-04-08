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
        firstName: '', lastName: '', sex: '', countryCode: '+63', contactNumber: '',
        clientType: 'Internal', officeUnitAddress: '', officeUnitOther: '',
        province: '', city: '', barangay: '',
        children: [{ name: '', age: '', sex: '' }],
        activities: '',
        dateOfUse: new Date().toISOString().split('T')[0],
        comments: '',
        serviceAvailed: '',
    });

    // Navigation and flow control state
    const [flowType, setFlowType] = useState(null); // 'register' | 'evaluate' | null
    const [userCode, setUserCode] = useState(''); // 5-digit code entered by user
    const [codeValidated, setCodeValidated] = useState(false); // Whether enter code is verified
    const [generatedCode, setGeneratedCode] = useState(''); // Newly generated code for registration
    const [registrationId, setRegistrationId] = useState(null); // DB ID of the current registration record
    const [currentPart, setCurrentPart] = useState(0); // Current wizard step index
    const [showCoverPage, setShowCoverPage] = useState(true); // Toggle for intro screen
    const [showThankYou, setShowThankYou] = useState(false); // Toggle for success screen
    const [submitting, setSubmitting] = useState(false); // Form submission status

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
     * Validates Part I of the form (Registration details).
     * @returns {boolean} True if valid, shows alert and return false otherwise.
     */
    const validateRegistration = () => {
        if (!formData.firstName.trim()) { alert('Please enter your first name'); return false; }
        if (!formData.lastName.trim()) { alert('Please enter your last name'); return false; }
        if (formData.contactNumber.replace(/\D/g, '').length !== 10) { alert('Contact number must be exactly 10 digits.'); return false; }
        if (formData.clientType === 'Internal' && !formData.officeUnitAddress) { alert('Please select your office/unit'); return false; }
        if ((formData.clientType === 'External' || formData.officeUnitAddress === 'Others') && !formData.officeUnitOther.trim()) { alert('Please specify your address'); return false; }
        if (formData.children.some(c => !c.name || !c.age || !c.sex)) { alert('Please fill in all child details.'); return false; }
        if (formData.serviceAvailed === 'Mother and Child Care' && !formData.activities.trim()) { alert('Please enter the activities.'); return false; }
        return true;
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
            const row = {
                code,
                first_name: formData.firstName,
                last_name: formData.lastName,
                parent_name: `${formData.firstName} ${formData.lastName}`.trim(),
                sex: formData.sex || null,
                country_code: formData.countryCode || null,
                contact_number: formData.contactNumber,
                client_type: formData.clientType,
                office_unit_address: formData.clientType === 'Internal' ? formData.officeUnitAddress : formData.officeUnitOther,
                office_unit_other: formData.officeUnitAddress === 'Others' || formData.clientType === 'External' ? formData.officeUnitOther : null,
                province: formData.province || null,
                city: formData.city || null,
                barangay: formData.barangay || null,
                children: formData.children,
                date_of_use: formData.dateOfUse,
                service_availed: formData.serviceAvailed || null,
                activities: formData.activities || null,
            };
            const { error } = await supabase.from('registrations').insert([row]);
            if (error) throw error;
            setGeneratedCode(code);
            setShowThankYou(true);
        } catch (e) {
            alert('Could not submit registration.');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Validates the 5-digit code entered by the user to start an evaluation.
     */
    const validateUserCode = async () => {
        if (userCode.length !== 5) { alert('Enter a 5-digit code.'); return; }
        setSubmitting(true);
        try {
            const { data, error } = await supabase.from('registrations').select('id').eq('code', userCode).single();
            if (error || !data) throw new Error();
            setRegistrationId(data.id);
            setCodeValidated(true);
            setCurrentPart(1);
        } catch {
            alert('Invalid code.');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Validates that all question parts have answers and submits the evaluation to Supabase.
     */
    const submitEvaluation = async () => {
        const hasAnyRating = (questions) => questions.some(q => formData[q.key] && formData[q.key].trim() !== '');
        for (let i = 0; i < formParts.length; i++) {
            if (!hasAnyRating(formParts[i].questions)) {
                alert(`Please answer all required items in ${formParts[i].label}.`);
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
        } catch {
            alert('Could not submit evaluation.');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Resets the entire form flow and data to its initial state.
     */
    const resetForm = () => {
        setFormData({
            firstName: '', lastName: '', sex: '', countryCode: '+63', contactNumber: '',
            clientType: 'Internal', officeUnitAddress: '', officeUnitOther: '',
            province: '', city: '', barangay: '',
            children: [{ name: '', age: '', sex: '' }],
            activities: '',
            dateOfUse: new Date().toISOString().split('T')[0], comments: '', serviceAvailed: ''
        });
        setCurrentPart(0); setFlowType(null); setShowCoverPage(true); setShowThankYou(false); setCodeValidated(false); setUserCode('');
    };

    return {
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
        totalParts: formParts.length + 2,
    };
}

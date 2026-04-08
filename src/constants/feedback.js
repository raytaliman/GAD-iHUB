export const DEFAULT_FORM_PARTS = [
    {
        key: 'part2',
        label: 'Part II. Facility and Service Evaluation',
        questions: [
            { key: 'cleanliness_safety', label: 'Cleanliness and safety of the station', answerType: 'emoji' },
            { key: 'child_comfort', label: "Child's comfort and enjoyment in the facility", answerType: 'emoji' },
            { key: 'toys_materials', label: 'Availability and quality of toys/materials', answerType: 'emoji' },
            { key: 'staff_attentiveness', label: 'Attentiveness and support of staff', answerType: 'emoji' },
            { key: 'accessibility_convenience', label: 'Accessibility and convenience of location', answerType: 'emoji' },
            { key: 'maintenance_upkeep', label: 'Maintenance and upkeep of the facility', answerType: 'emoji' },
            { key: 'staff_responsiveness', label: "Responsiveness of staff to parents' concerns", answerType: 'emoji' },
        ],
    },
    {
        key: 'part3',
        label: 'Part III. Staff Evaluation',
        questions: [
            { key: 'staff_eval_attentiveness', label: 'Attentiveness and support of staff', answerType: 'emoji' },
            { key: 'staff_eval_friendliness', label: 'Friendliness and courtesy', answerType: 'emoji' },
            { key: 'staff_eval_responsiveness', label: "Responsiveness to parents' concerns", answerType: 'emoji' },
        ],
    },
    {
        key: 'part4',
        label: 'Part IV – Overall Satisfaction',
        questions: [
            { key: 'overall_satisfaction', label: 'How satisfied are you with your overall experience using the Child-Minding Station?', answerType: 'satisfaction' },
        ],
    },
];

export const OFFICE_UNIT_OPTIONS = [
    'Scholarship Unit', 'Planning Unit', 'Gender and Development (GAD) Unit', 'S&T Promo', 'TACS and Training',
    'Regional Standards and Testing Laboratory (RSTL)', 'Emerging Technology Research and Development (ICIEERD)',
    'The Innovation for Filipinos Working Distantly from the Philippines (iFWD PH)', 'TECHGROW',
    'Small Enterprise Technology Upgrading Program (DOST-SETUP)', 'RDILMPC', 'OneASIN', 'Accounting Unit',
    'Budget Unit', 'HRMU', 'Supply Unit', 'Cash Unit', 'PSTO La Union', 'PSTO Ilocos Norte', 'PSTO Ilocos Sur',
    'PSTO Pangasinan', 'Office of Regional Director (ORD)', 'ITSMU', 'DRRMU', 'GATES', 'General Services', 'Others',
];

export const ILOCOS_REGION_DATA = {
    'Ilocos Norte': {
        'Laoag City': ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5'],
        'Batac City': ['Barangay I', 'Barangay II', 'Barangay III', 'Barangay IV'],
        'Bangui': ['Abaca', 'Bacsil', 'Banban', 'Baruyen'],
        'Burgos': ['Agaga', 'Bayog', 'Bobon', 'Buduan'],
    },
    'Ilocos Sur': {
        'Vigan City': ['Ayusan Norte', 'Ayusan Sur', 'Barangay I', 'Barangay II', 'Pantay Daya', 'Pantay Laud'],
        'Candon City': ['Bagani Campo', 'Bagani Gabor', 'Bagani Tocotoc', 'Caterman'],
        'Narvacan': ['Abuor', 'Ambulogan', 'Aquibane', 'Banat'],
        'Santa Maria': ['Ag-agrao', 'Ampamee', 'Baballasioan', 'Baliw'],
    },
    'La Union': {
        'San Fernando City': ['Tanqui', 'Catbangen', 'Poro', 'Ilocanos Sur', 'Ilocanos Norte', 'Lingsat'],
        'Bauang': ['Central East', 'Central West', 'Baccuit Norte', 'Baccuit Sur'],
        'Agoo': ['Ambitacay', 'Balawarte', 'Capas', 'Consolacion'],
        'San Juan': ['Taboc', 'Panicsican', 'Ili Norte', 'Ili Sur'],
    },
    'Pangasinan': {
        'Dagupan City': ['Pantal', 'Lucao', 'Tapuac', 'Poblacion Oeste'],
        'Urdaneta City': ['Anonas', 'Bayaoas', 'Catablan', 'Nancayasan'],
        'Alaminos City': ['Poblacion', 'Palamis', 'Lucap', 'Alos'],
        'Lingayen': ['Poblacion', 'Libsong East', 'Libsong West', 'Pangapisan North'],
    }
};

export const EVAL_OPTIONS = [
    { value: 'excellent', label: 'Excellent', emoji: '😃', bg: 'bg-green-50', activeBorder: 'border-green-500' },
    { value: 'veryGood', label: 'Very Good', emoji: '🙂', bg: 'bg-green-50/50', activeBorder: 'border-green-400' },
    { value: 'good', label: 'Good', emoji: '😐', bg: 'bg-amber-50', activeBorder: 'border-amber-500' },
    { value: 'fair', label: 'Fair', emoji: '😕', bg: 'bg-orange-50', activeBorder: 'border-orange-500' },
    { value: 'poor', label: 'Poor', emoji: '😞', bg: 'bg-red-50', activeBorder: 'border-red-500' },
    { value: 'na', label: 'N/A', emoji: '❌', bg: 'bg-red-50', activeBorder: 'border-red-500' },
];

export const OVERALL_SATISFACTION_OPTIONS = [
    { label: 'Very Satisfied', emoji: '😃', color: 'text-green-500', bg: 'bg-green-50', activeBg: 'bg-green-100' },
    { label: 'Satisfied', emoji: '🙂', color: 'text-green-400', bg: 'bg-green-50/50', activeBg: 'bg-green-50' },
    { label: 'Neutral', emoji: '😐', color: 'text-amber-500', bg: 'bg-amber-50', activeBg: 'bg-amber-100' },
    { label: 'Dissatisfied', emoji: '😕', color: 'text-orange-500', bg: 'bg-orange-50', activeBg: 'bg-orange-100' },
    { label: 'Very Dissatisfied', emoji: '😞', color: 'text-red-500', bg: 'bg-red-50', activeBg: 'bg-red-100' },
];

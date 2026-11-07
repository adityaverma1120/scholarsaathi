import type { WhoActs } from './types';

export interface FaultLabelConfig {
  who_acts: WhoActs;
  label: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  colorTheme: string;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  iconName: string;
}

export const FAULT_MAP: Record<WhoActs, FaultLabelConfig> = {
  student: {
    who_acts: 'student',
    label: {
      en: 'Your Action Needed',
      hi: 'आपकी कार्रवाई आवश्यक',
    },
    description: {
      en: 'You must log in to the portal and fix or resubmit your application.',
      hi: 'आपको पोर्टल पर लॉगिन करके आवेदन में सुधार करना होगा।',
    },
    colorTheme: 'badge-warning',
    borderColor: 'border-amber-500',
    borderStyle: 'solid',
    iconName: 'UserCheck',
  },
  institute: {
    who_acts: 'institute',
    label: {
      en: 'College / Institute Action',
      hi: 'कॉलेज / संस्थान स्तर पर कार्रवाई',
    },
    description: {
      en: 'Your college nodal officer needs to verify your documents or take action.',
      hi: 'आपके कॉलेज नोडल अधिकारी को दस्तावेजों का सत्यापन करना होगा।',
    },
    colorTheme: 'badge-secondary',
    borderColor: 'border-purple-500',
    borderStyle: 'dashed',
    iconName: 'Building2',
  },
  district_state: {
    who_acts: 'district_state',
    label: {
      en: 'District / State Action',
      hi: 'जिला / राज्य स्तर पर कार्रवाई',
    },
    description: {
      en: 'The government district or state nodal officer is reviewing your file.',
      hi: 'जिला या राज्य नोडल अधिकारी आपकी फाइल की समीक्षा कर रहे हैं।',
    },
    colorTheme: 'badge-info',
    borderColor: 'border-blue-500',
    borderStyle: 'dotted',
    iconName: 'Landmark',
  },
  bank: {
    who_acts: 'bank',
    label: {
      en: 'Bank / PFMS Action',
      hi: 'बैंक / पीएफएमएस स्तर पर कार्रवाई',
    },
    description: {
      en: 'Your Aadhaar is not mapped in your bank account for DBT payment.',
      hi: 'डीबीटी भुगतान हेतु आपके बैंक खाते में आधार मैप नहीं है।',
    },
    colorTheme: 'badge-accent',
    borderColor: 'border-teal-500',
    borderStyle: 'double',
    iconName: 'CreditCard',
  },
  unsure: {
    who_acts: 'unsure',
    label: {
      en: 'Action Needed',
      hi: 'कार्रवाई आवश्यक',
    },
    description: {
      en: 'Check the official portal to determine the responsible authority.',
      hi: 'जिम्मेदार प्राधिकारी जानने के लिए आधिकारिक पोर्टल देखें।',
    },
    colorTheme: 'badge-ghost',
    borderColor: 'border-gray-500',
    borderStyle: 'solid',
    iconName: 'HelpCircle',
  },
};

export function getFaultConfig(whoActs: WhoActs): FaultLabelConfig {
  return FAULT_MAP[whoActs] || FAULT_MAP.unsure;
}


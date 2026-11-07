'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const UI_DICTIONARY: Record<string, Record<Language, string>> = {
  // Navigation & Brand
  brandName: {
    en: 'ScholarSaathi',
    hi: 'स्कॉलर साथी (ScholarSaathi)',
  },
  tagline: {
    en: 'Your complete scholarship assistant — discover, check, prepare, apply and track.',
    hi: 'आपका संपूर्ण छात्रवृत्ति सहायक — खोजें, जाँचें, तैयार करें और ट्रैक करें।',
  },
  ribbonDisclaimer: {
    en: 'Independent prototype. Not a government service. Not affiliated with NSP.',
    hi: 'स्वतंत्र प्रोटोटाइप। सरकारी सेवा नहीं है। एनएसपी से संबद्ध नहीं है।',
  },
  aboutLink: {
    en: 'About & Privacy',
    hi: 'परिचय एवं गोपनीयता',
  },
  backToHome: {
    en: 'Back to Home',
    hi: 'मुख्य पृष्ठ पर वापस जाएँ',
  },

  // Home Screen S01
  homeHeading: {
    en: 'ScholarSaathi — Scholarship Lifecycle Assistant',
    hi: 'स्कॉलर साथी — छात्रवृत्ति सहायता मंच',
  },
  homeSubheading: {
    en: 'Discover scholarships, verify documents, check eligibility, and decode application remarks.',
    hi: 'छात्रवृत्तियां खोजें, दस्तावेज़ जाँचें, पात्रता समझें, और आवेदन स्थिति को डिकोड करें।',
  },
  privacyBoxTitle: {
    en: 'Privacy Safeguard Active',
    hi: 'गोपनीयता सुरक्षा सक्रिय',
  },
  privacyBoxDesc: {
    en: 'Never enter Aadhaar, bank details, passwords, or OTP. ScholarSaathi explains rules and remarks; it never stores personal credentials.',
    hi: 'कृपया आधार, बैंक खाता, पासवर्ड या ओटीपी कभी दर्ज न करें। स्कॉलर साथी नियमों और टिप्पणियों को समझाती है; यह संवेदनशील क्रेडेंशियल्स संग्रहीत नहीं करती।',
  },
  tapDoorTitle: {
    en: 'Tap the message I see',
    hi: 'दिखाई देने वाला संदेश चुनें',
  },
  tapDoorDesc: {
    en: 'Browse common defective, pending & rejected remarks (Works offline)',
    hi: 'सामान्य दोषपूर्ण, लंबित एवं अस्वीकृत संदेश देखें (ऑफ़लाइन उपलब्ध)',
  },
  pasteDoorTitle: {
    en: 'Paste the message text',
    hi: 'संदेश का पाठ (टेक्स्ट) पेस्ट करें',
  },
  pasteDoorDesc: {
    en: 'Type or paste the exact wording shown on your portal screen',
    hi: 'पोर्टल स्क्रीन पर दिखाई देने वाला संदेश यहाँ टाइप या पेस्ट करें',
  },

  // First Run Notice S02
  firstRunHeading: {
    en: 'Important Notice Before You Start',
    hi: 'शुरू करने से पहले आवश्यक सूचना',
  },
  firstRunPoint1: {
    en: 'ScholarSaathi is an independent prototype, not affiliated with NSP or any government ministry.',
    hi: 'स्कॉलर साथी एक स्वतंत्र प्रोटोटाइप है, जो एनएसपी या किसी सरकारी मंत्रालय से संबद्ध नहीं है।',
  },
  firstRunPoint2: {
    en: 'ScholarSaathi explains rules and remarks; it does not approve scholarships, evaluate eligibility officially, or disburse money.',
    hi: 'स्कॉलर साथी केवल नियमों और टिप्पणियों का अर्थ समझाती है; यह आधिकारिक छात्रवृत्ति स्वीकृत या भुगतान नहीं करती।',
  },
  firstRunPoint3: {
    en: 'Zero Personal Data: Do not paste passwords, OTPs, Aadhaar numbers, or bank account details.',
    hi: 'शून्य व्यक्तिगत डेटा: पासवर्ड, ओटीपी, आधार या बैंक खाता संख्या कभी दर्ज न करें।',
  },
  firstRunStatsLabel: {
    en: 'Share anonymous usage statistics to help improve matching (optional)',
    hi: 'मिलान सुधारने हेतु अनाम उपयोग आँकड़े साझा करें (वैकल्पिक)',
  },
  firstRunConsentDesc: {
    en: 'No personal details or message text are ever saved or shared.',
    hi: 'कोई भी व्यक्तिगत विवरण या संदेश कभी सहेजा या साझा नहीं किया जाता।',
  },
  firstRunConfirmBtn: {
    en: 'I Understand & Agree',
    hi: 'मैं समझ गया / आगे बढ़ें',
  },

  // S04 Paste Screen
  pasteHeading: {
    en: 'Paste Your Status Remark',
    hi: 'अपनी स्थिति या टिप्पणी यहाँ पेस्ट करें',
  },
  pasteSubheading: {
    en: 'Copy the exact status or rejection remark shown on your National Scholarship Portal screen.',
    hi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (एनएसपी) पर दिखाई देने वाली सटीक टिप्पणी यहाँ दर्ज करें।',
  },
  pastePlaceholder: {
    en: 'e.g. Application marked defective by Institute Nodal Officer due to income certificate...',
    hi: 'उदा. Application marked defective by Institute Nodal Officer...',
  },
  charactersLabel: {
    en: 'characters',
    hi: 'अक्षर',
  },
  explainBtn: {
    en: 'Explain This Message',
    hi: 'इस संदेश का अर्थ समझें',
  },
  clearBtn: {
    en: 'Clear Text',
    hi: 'पाठ साफ़ करें',
  },
  sampleRemarksLabel: {
    en: 'Or try a sample remark:',
    hi: 'या इनमें से कोई उदाहरण चुनें:',
  },

  // S06 Matching Overlay
  matchingOverlayTitle: {
    en: 'Decoding Scholarship Remark...',
    hi: 'संदेश का विश्लेषण किया जा रहा है...',
  },
  matchingOverlayDesc: {
    en: 'Comparing remark against verified scholarship guidance...',
    hi: 'सत्यापित छात्रवृत्ति नियमों के साथ मिलान किया जा रहा है...',
  },
  matchingOverlayCancel: {
    en: 'Cancel & return to editor',
    hi: 'रद्द करें एवं वापस जाएँ',
  },

  // S08 Fix Card
  portalStatusLabel: {
    en: 'Status on Official Portal:',
    hi: 'पोर्टल पर दर्ज स्थिति:',
  },
  plainMeaningLabel: {
    en: 'What this usually means:',
    hi: 'इसका सामान्य अर्थ क्या है:',
  },
  actionStepsHeading: {
    en: 'What You Need to Do Next',
    hi: 'आगे आपको क्या करना होगा',
  },
  typicalWaitLabel: {
    en: 'Typical Wait:',
    hi: 'अनुमानित समय:',
  },
  openPortalBtn: {
    en: 'Open the Official NSP Page',
    hi: 'आधिकारिक एनएसपी पोर्टल खोलें',
  },
  openPortalNote: {
    en: 'You will leave ScholarSaathi. ScholarSaathi never logs in or edits applications for you.',
    hi: 'आप आधिकारिक पोर्टल पर चले जाएंगे। स्कॉलर साथी कभी आपके लिए लॉगिन या आवेदन संपादित नहीं करती।',
  },
  sourceLabel: {
    en: 'Official Source:',
    hi: 'आधिकारिक स्रोत:',
  },
  checkedOnLabel: {
    en: 'Checked on:',
    hi: 'सत्यापन तिथि:',
  },
  draftGrievanceBtn: {
    en: 'Draft a Grievance Letter',
    hi: 'शिकायत पत्र का प्रारूप तैयार करें',
  },
  shareBtn: {
    en: 'Share Card',
    hi: 'कार्ड साझा करें',
  },
  printBtn: {
    en: 'Print A4',
    hi: 'प्रिंट करें',
  },
  notMyMessageBtn: {
    en: 'This is not my message (Browse all)',
    hi: 'यह मेरा संदेश नहीं है (अन्य संदेश देखें)',
  },

  // S10 Grievance
  grievanceHeading: {
    en: 'Official Grievance Draft Generator',
    hi: 'औपचारिक शिकायत पत्र प्रारूप',
  },
  grievanceSubheading: {
    en: 'Prepare a formal representation to submit through official grievance channels.',
    hi: 'आधिकारिक शिकायत निवारण पोर्टल पर प्रस्तुत करने हेतु औपचारिक पत्र तैयार करें।',
  },
  grievanceBanner: {
    en: 'Nothing has been filed. You must submit this draft yourself through the official route.',
    hi: 'कोई शिकायत दर्ज नहीं हुई है। आपको इस प्रारूप को आधिकारिक पोर्टल पर स्वयं जमा करना होगा।',
  },
  studentNameLabel: {
    en: 'Your Name (Optional / Client-only)',
    hi: 'आपका नाम (वैकल्पिक / केवल आपके फ़ोन पर)',
  },
  instituteNameLabel: {
    en: 'College / Institute Name',
    hi: 'कॉलेज या संस्थान का नाम',
  },
  applicationIdLabel: {
    en: 'Application ID (Client-only)',
    hi: 'आवेदन क्रमांक (केवल आपके फ़ोन पर)',
  },
  reviewCheckboxLabel: {
    en: 'I understand that ScholarSaathi does not file grievances. I will review and submit this myself on scholarships.gov.in or pgportal.gov.in.',
    hi: 'मैं समझता/समझती हूँ कि स्कॉलर साथी कोई शिकायत दर्ज नहीं करती। मैं इसे स्वयं आधिकारिक पोर्टल पर जमा करूँगा/करूँगी।',
  },
  copyDraftBtn: {
    en: 'Copy Draft to Clipboard',
    hi: 'पत्र कॉपी करें',
  },
  copiedBtn: {
    en: 'Copied!',
    hi: 'कॉपी हो गया!',
  },
  downloadTxtBtn: {
    en: 'Download as .TXT',
    hi: '.TXT फ़ाइल डाउनलोड करें',
  },

  // Profile navigation
  profileLink: {
    en: 'My Profile',
    hi: 'मेरी प्रोफ़ाइल',
  },
  profileDoorTitle: {
    en: 'Student Profile & Academic Vault',
    hi: 'छात्र प्रोफ़ाइल और शैक्षणिक कोष',
  },
  profileDoorDesc: {
    en: 'Save your academic details locally for eligibility checks and form preparation',
    hi: 'पात्रता जाँच और फॉर्म तैयारी के लिए अपनी शैक्षणिक जानकारी स्थानीय रूप से सहेजें',
  },

  // Vault navigation
  vaultLink: {
    en: 'Doc Vault',
    hi: 'दस्तावेज़ कोष',
  },
  vaultDoorTitle: {
    en: 'Document Vault & Readiness Checker',
    hi: 'दस्तावेज़ कोष एवं तैयारी परीक्षक',
  },
  vaultDoorDesc: {
    en: 'Organise certificates, check size and format, and verify required fields',
    hi: 'प्रमाण पत्र व्यवस्थित करें, आकार और प्रारूप जाँचें, और आवश्यक फ़ील्ड सत्यापित करें',
  },

  // Checker navigation
  checkerLink: {
    en: 'Doc Checker',
    hi: 'दस्तावेज़ परीक्षक',
  },
  checkerDoorTitle: {
    en: 'Cross-Document Consistency Checker',
    hi: 'दस्तावेज़ सुसंगतता परीक्षक',
  },
  checkerDoorDesc: {
    en: 'Compare names, dates of birth, and records across your documents to prevent portal defects',
    hi: 'पोर्टल दोषों से बचने के लिए अपने सभी दस्तावेज़ों में नाम, जन्म तिथि आदि का मिलान करें',
  },

  // Discovery navigation
  discoveryLink: {
    en: 'Scholarships',
    hi: 'छात्रवृत्तियां',
  },
  discoveryDoorTitle: {
    en: 'Discover Verified Scholarships',
    hi: 'सत्यापित छात्रवृत्तियां खोजें',
  },
  discoveryDoorDesc: {
    en: 'Browse genuine Central (NSP) and State schemes filtered by your eligibility',
    hi: 'अपनी पात्रता के अनुसार प्रामाणिक केंद्रीय (एनएसपी) और राज्य योजनाओं की खोज करें',
  },

  // Eligibility navigation
  eligibilityLink: {
    en: 'Eligibility',
    hi: 'पात्रता',
  },
  eligibilityDoorTitle: {
    en: 'Deterministic Eligibility Checker',
    hi: 'पारदर्शी पात्रता जाँचकर्ता',
  },
  eligibilityDoorDesc: {
    en: 'Check your profile against verified scheme criteria with transparent rules and source citations',
    hi: 'सत्यापित नियमों और स्रोत संदर्भों के साथ अपनी प्रोफ़ाइल की योजना पात्रता जाँचें',
  },

  // Readiness navigation
  readinessLink: {
    en: 'Readiness',
    hi: 'तैयारी',
  },
  readinessDoorTitle: {
    en: 'Application Readiness Checklist',
    hi: 'आवेदन तैयारी चेकलिस्ट',
  },
  readinessDoorDesc: {
    en: 'Verify required documents, quality, and cross-document alignment before portal submission',
    hi: 'पोर्टल पर आवेदन करने से पूर्व आवश्यक दस्तावेज़ों, स्पष्टता और मिलान की पुष्टि करें',
  },

  // Assistant navigation
  assistantLink: {
    en: 'Assistant',
    hi: 'सहायक',
  },
  assistantDoorTitle: {
    en: 'Form-Filling Assistant & Safe Review',
    hi: 'फॉर्म-सहायक एवं सुरक्षित समीक्षा',
  },
  assistantDoorDesc: {
    en: 'Prepare verified candidate values, copy with one click, and review official guidelines safely',
    hi: 'सत्यापित मान तैयार करें, एक क्लिक में कॉपी करें, और आधिकारिक निर्देशों की सुरक्षित समीक्षा करें',
  },

  // Tracker navigation
  trackerLink: {
    en: 'Tracker',
    hi: 'ट्रैकर',
  },
  trackerDoorTitle: {
    en: 'Application Status Tracker & Grievance Assistant',
    hi: 'आवेदन स्थिति ट्रैकर एवं शिकायत सहायक',
  },
  trackerDoorDesc: {
    en: 'Track submitted applications, log status updates, and draft formal representations',
    hi: 'जमा किए गए आवेदन ट्रैक करें, स्थिति परिवर्तन दर्ज करें, और औपचारिक शिकायत पत्र तैयार करें',
  },

  // Calendar navigation
  calendarLink: {
    en: 'Calendar',
    hi: 'कैलेंडर',
  },
  calendarDoorTitle: {
    en: 'Application Calendar & Deadlines',
    hi: 'आवेदन कैलेंडर एवं अंतिम तिथियां',
  },
  calendarDoorDesc: {
    en: 'Track verified portal deadlines, correction windows, and set personal reminders',
    hi: 'सत्यापित पोर्टल अंतिम तिथियां, सुधार अवधि ट्रैक करें और अपने व्यक्तिगत अनुस्मारक सेट करें',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wajah.lang');
      if (saved === 'hi' || saved === 'en') {
        setLanguageState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // LocalStorage access restricted or unavailable
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('wajah.lang', lang);
    } catch {}
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'hi' : 'en';
    setLanguage(next);
  };

  const t = (key: string): string => {
    if (UI_DICTIONARY[key] && UI_DICTIONARY[key][language]) {
      return UI_DICTIONARY[key][language];
    }
    return UI_DICTIONARY[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}


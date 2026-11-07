import { type TrackedApplication } from './schema';
import { type StudentProfile } from '../profile/schema';

export interface GrievanceDraft {
  scholarshipId: string;
  scholarshipNameEn: string;
  scholarshipNameHi: string;
  portalName: string;
  officialGrievanceUrl: string;
  officialHelpdeskEmail: string;
  officialHelplineNumber: string;
  escalationAuthorityEn: string;
  escalationAuthorityHi: string;
  subjectEn: string;
  subjectHi: string;
  bodyEn: string;
  bodyHi: string;
  requiredAttachmentsEn: string[];
  requiredAttachmentsHi: string[];
  submissionInstructionsEn: string[];
  submissionInstructionsHi: string[];
}

/**
 * Generates an editable formal grievance draft linked to official escalation channels.
 * Strictly adheres to Spec 12 Section 6 (verified authorities, no invented contacts).
 */
export function generateGrievanceDraft(
  application: TrackedApplication,
  profile?: StudentProfile | null,
  specificReason?: string
): GrievanceDraft {
  const isUpScheme = application.scholarshipId.includes('up_') || application.portalName.includes('UP');

  const studentName = profile?.basic?.displayName || '[Student Full Name / विद्यार्थी का नाम]';
  const appId = application.maskedApplicationId || '[Application ID / आवेदन संख्या]';
  const state = profile?.basic?.domicileState || application.scholarshipNameEn.includes('Uttar Pradesh') ? 'Uttar Pradesh' : '[State / राज्य]';
  const district = profile?.basic?.domicileDistrict || '[District / ज़िला]';
  const college = profile?.academicRecords?.[0]?.institution || '[College/Institute Name / संस्थान का नाम]';
  const course = profile?.academicRecords?.[0]?.course || '[Course / पाठ्यक्रम]';
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  if (isUpScheme) {
    // Uttar Pradesh State Scholarship Official Grievance Routing
    return {
      scholarshipId: application.scholarshipId,
      scholarshipNameEn: application.scholarshipNameEn,
      scholarshipNameHi: application.scholarshipNameHi,
      portalName: 'UP Scholarship & Fee Reimbursement Portal',
      officialGrievanceUrl: 'https://jansunwai.up.nic.in',
      officialHelpdeskEmail: 'helpdesk.scholarship-up@gov.in',
      officialHelplineNumber: '1076 (UP CM Helpline) / 1800-180-5131',
      escalationAuthorityEn: 'District Social Welfare Officer (DSWO) / Directorate of Social Welfare, UP',
      escalationAuthorityHi: 'ज़िला समाज कल्याण अधिकारी (DSWO) / समाज कल्याण निदेशालय, उत्तर प्रदेश',
      subjectEn: `Grievance regarding pending/defective scholarship application (Ref: ${appId}) - ${application.scholarshipNameEn}`,
      subjectHi: `छात्रवृत्ति आवेदन के लंबित/दोषपूर्ण स्थिति के संबंध में प्रत्यावेदन (आवेदन संख्या: ${appId}) - ${application.scholarshipNameHi}`,
      bodyEn: `To,
The District Social Welfare Officer (DSWO),
District: ${district},
Department of Social Welfare, Government of Uttar Pradesh.

Date: ${currentDate}

Subject: Formal representation regarding scholarship status (${application.statusLabelEn}) - Application No: ${appId}

Respected Sir/Madam,

I am a bonafide student enrolled in ${course} at ${college}, District: ${district}, Uttar Pradesh. I have duly applied for the ${application.scholarshipNameEn} for Academic Year ${application.academicYear}.

My application is currently reflecting the following status on the UP Scholarship portal:
Status: "${application.statusLabelEn}"
Recorded Issue: ${specificReason || application.nextActionEn || 'Application pending beyond prescribed portal verification window.'}

I have submitted all necessary documents, including fee receipts, bonafide certificate, and income/caste certificates, to my institute nodal desk within the notified portal deadline. All my documents are genuine and verified.

I earnestly request your kind intervention to review my application records and update my verification status on the portal so that my fee reimbursement and scholarship are processed in accordance with government guidelines.

Thank you.

Yours faithfully,
Name: ${studentName}
Application Reference ID: ${appId}
Institution: ${college}
District: ${district}`,
      bodyHi: `सेवा में,
ज़िला समाज कल्याण अधिकारी,
ज़िला: ${district},
समाज कल्याण विभाग, उत्तर प्रदेश सरकार।

दिनांक: ${currentDate}

विषय: छात्रवृत्ति आवेदन की स्थिति (${application.statusLabelHi}) के संबंध में प्रत्यावेदन - आवेदन संख्या: ${appId}

महोदय/महोदया,

मैं ${college}, ज़िला ${district} में ${course} का नियमित छात्र/छात्रा हूँ। मैंने शैक्षणिक सत्र ${application.academicYear} हेतु "${application.scholarshipNameHi}" के अंतर्गत आवेदन किया है।

वर्तमान में आधिकारिक पोर्टल पर मेरे आवेदन की स्थिति निम्न प्रकार प्रदर्शित हो रही है:
स्थिति: "${application.statusLabelHi}"
विवरण: ${specificReason || application.nextActionHi || 'निर्धारित समय-सीमा के उपरांत भी सत्यापन प्रक्रिया पूर्ण नहीं हुई है।'}

मैंने अपने सभी मूल प्रमाण पत्र (शुल्क रसीद, आय/जाति प्रमाण पत्र एवं बोनाफाइड) समय से संस्थान के नोडल अधिकारी के समक्ष प्रस्तुत कर दिए हैं।

अतः आपसे विनम्र निवेदन है कि कृपया मेरे आवेदन की समीक्षा कर पोर्टल पर स्थिति को अग्रसारित/संशोधित करने की कृपा करें।

सधन्यवाद,
भवदीय/भवदीया,
नाम: ${studentName}
आवेदन संख्या: ${appId}
संस्थान: ${college}
ज़िला: ${district}`,
      requiredAttachmentsEn: [
        'UP Scholarship Application Final Printout / Acknowledgment Slip',
        'Fee Receipt for Academic Year 2026-27',
        'Income Certificate and Caste Certificate copies',
        'Bonafide Certificate issued by College Principal',
      ],
      requiredAttachmentsHi: [
        'उत्तर प्रदेश छात्रवृत्ति आवेदन की अंतिम प्रिंट प्रति',
        'सत्र 2026-27 की शुल्क रसीद',
        'आय एवं जाति प्रमाण पत्र की छायाप्रति',
        'कॉलेज प्राचार्य द्वारा जारी बोनाफाइड प्रमाण पत्र',
      ],
      submissionInstructionsEn: [
        '1. Copy this draft and review all bracketed details.',
        '2. Log in to IGRS Jan Sunwai portal at https://jansunwai.up.nic.in.',
        '3. Select "Register Grievance (शिकायत पंजीकरण)" and paste this text.',
        '4. Attach supporting documents and note down the grievance registration number.',
      ],
      submissionInstructionsHi: [
        '1. इस प्रारूप की समीक्षा करें तथा कोष्ठक में दिए गए विवरण सत्यापित करें।',
        '2. आधिकारिक जनसुनवाई पोर्टल https://jansunwai.up.nic.in पर जाएँ।',
        '3. "शिकायत पंजीकरण" का चयन करें और यह पाठ पेस्ट करें।',
        '4. आवश्यक दस्तावेज़ संलग्न करें तथा शिकायत संख्या अवश्य नोट करें।',
      ],
    };
  }

  // Central NSP Official Grievance Routing (MoSJE / MoMA / DoHE)
  return {
    scholarshipId: application.scholarshipId,
    scholarshipNameEn: application.scholarshipNameEn,
    scholarshipNameHi: application.scholarshipNameHi,
    portalName: 'National Scholarship Portal (NSP)',
    officialGrievanceUrl: 'https://pgportal.gov.in',
    officialHelpdeskEmail: 'helpdesk@nsp.gov.in',
    officialHelplineNumber: '0120-6619540 (NSP Central Helpdesk)',
    escalationAuthorityEn: 'Ministry Nodal Officer / Central Grievance Redressal Officer (CPGRAMS)',
    escalationAuthorityHi: 'मंत्रालय नोडल अधिकारी / केंद्रीय जन शिकायत निवारण अधिकारी (CPGRAMS)',
    subjectEn: `Grievance regarding pending/defective National Scholarship application (Ref: ${appId}) - ${application.scholarshipNameEn}`,
    subjectHi: `राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) आवेदन में लंबित/दोषपूर्ण स्थिति के संबंध में शिकायत (Ref: ${appId})`,
    bodyEn: `To,
The Nodal Officer (Scholarships),
National Scholarship Division,
Government of India.

Date: ${currentDate}

Subject: Request for resolution regarding NSP application status: "${application.statusLabelEn}" (Application Ref: ${appId})

Respected Officer,

I am a student pursuing ${course} at ${college}, ${district}, ${state}. I submitted my application for the "${application.scholarshipNameEn}" (Academic Year ${application.academicYear}) on the National Scholarship Portal (scholarships.gov.in).

Currently, my application status on the portal shows:
Status: "${application.statusLabelEn}"
Remarks: ${specificReason || application.nextActionEn || 'Application pending verification without further updates.'}

All my required documents and identity details have been uploaded in the official format. My bank account is active and seeded with Aadhaar for DBT transactions.

I kindly request your department to look into this matter and direct the concerned authority (Institute/District/State Nodal Officer) to verify and process my application.

Thank you.

Yours sincerely,
Student Name: ${studentName}
Application Reference ID: ${appId}
Institution: ${college}
State / Domicile: ${state}`,
    bodyHi: `सेवा में,
नोडल अधिकारी (छात्रवृत्ति प्रभाग),
राष्ट्रीय छात्रवृत्ति प्रभाग,
भारत सरकार।

दिनांक: ${currentDate}

विषय: एनएसपी आवेदन की स्थिति "${application.statusLabelHi}" के समाधान हेतु शिकायत (आवेदन संदर्भ: ${appId})

महोदय/महोदया,

मैं ${college}, ${state} में ${course} का छात्र/छात्रा हूँ। मैंने राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in) पर शैक्षणिक सत्र ${application.academicYear} हेतु "${application.scholarshipNameHi}" के लिए आवेदन किया है।

वर्तमान में मेरे आवेदन की स्थिति निम्न प्रकार प्रदर्शित हो रही है:
स्थिति: "${application.statusLabelHi}"
टिप्पणी: ${specificReason || application.nextActionHi || 'संबंधित स्तर पर आवेदन लंबित है।'}

मेरे सभी आवश्यक दस्तावेज़ पोर्टल पर अपलोड हैं और मेरा बैंक खाता सक्रिय एवं आधार से जुड़ा हुआ है।

अतः आपसे अनुरोध है कि संबंधित नोडल अधिकारी को मेरे आवेदन के सत्यापन हेतु निर्देशित करने की कृपा करें।

सधन्यवाद,
भवदीय/भवदीया,
नाम: ${studentName}
आवेदन संख्या: ${appId}
संस्थान: ${college}
राज्य: ${state}`,
    requiredAttachmentsEn: [
      'NSP Application Acknowledgment Slip with Application ID',
      'Class 10th Certificate / Marksheet',
      'Bank Passbook showing Account Number, IFSC, and Aadhaar seeding',
      'Bonafide Certificate on College Letterhead',
    ],
    requiredAttachmentsHi: [
      'एनएसपी आवेदन रसीद (आवेदन संख्या सहित)',
      '10वीं कक्षा की अंकतालिका / प्रमाण पत्र',
      'बैंक पासबुक (खाता संख्या, आईएफएससी एवं आधार सीडिंग स्पष्ट)',
      'कॉलेज लेटरहेड पर जारी बोनाफाइड प्रमाण पत्र',
    ],
    submissionInstructionsEn: [
      '1. Review this draft and confirm your application details.',
      '2. Visit the Government of India CPGRAMS portal at https://pgportal.gov.in.',
      '3. Select "Lodge a Grievance" and choose the relevant Central Ministry (Ministry of Social Justice / Minority Affairs / Education).',
      '4. Paste the grievance text, upload PDF attachments, and save your registration registration number for tracking.',
    ],
    submissionInstructionsHi: [
      '1. इस प्रारूप की समीक्षा करें और अपने विवरण की पुष्टि करें।',
      '2. भारत सरकार के CPGRAMS पोर्टल https://pgportal.gov.in पर जाएँ।',
      '3. "शिकायत दर्ज करें (Lodge a Grievance)" चुनें और संबंधित मंत्रालय का चयन करें।',
      '4. पाठ पेस्ट करें, आवश्यक दस्तावेज़ अपलोड करें, और ट्रैकिंग संख्या सुरक्षित रखें।',
    ],
  };
}


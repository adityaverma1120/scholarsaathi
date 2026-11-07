import {
  type PortalFieldDef,
  type PreparedFieldValue,
  type ApplicationPreparationForm,
  type PreparationStatus,
  PortalFieldDefSchema,
  PreparedFieldValueSchema,
  ApplicationPreparationFormSchema,
} from './schema';
import { type Scholarship } from '../catalogue/schema';
import { type StudentProfile } from '../profile/schema';
import { type VaultDocument } from '../vault/schema';
import { getScholarshipById } from '../catalogue/engine';

export const CURRENT_MAPPING_VERSION = 'nsp_2026_27.v1';

/**
 * Standard NSP Portal Field Definitions based on official portal instructions
 */
export const NSP_PORTAL_FIELD_DEFS: PortalFieldDef[] = [
  // Section 1: General & Identity Details
  {
    fieldId: 'student_name',
    section: 'General Information',
    labelEn: 'Student Full Name',
    labelHi: 'विद्यार्थी का पूरा नाम',
    profilePath: 'basic.displayName',
    vaultCategory: 'class_10_marksheet',
    vaultFieldKey: 'student_name',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: 'Enter name exactly as printed on Class 10 Marksheet. Do not add titles like Shri/Mr./Ms.',
    formatHelpHi: 'कक्षा 10 की अंकतालिका के अनुसार दर्ज करें। श्री/सुश्री जैसे उपसर्ग न जोड़ें।',
    placeholderEn: 'e.g. RAHUL KUMAR',
    placeholderHi: 'उदा. राहुल कुमार',
    sourceInstructionRef: 'NSP Registration Guidelines - Clause 2.1 (Identity Matching)',
  },
  {
    fieldId: 'dob',
    section: 'General Information',
    labelEn: 'Date of Birth (DD/MM/YYYY)',
    labelHi: 'जन्म तिथि (दिन/माह/वर्ष)',
    profilePath: 'basic.dateOfBirth',
    vaultCategory: 'class_10_marksheet',
    vaultFieldKey: 'date_of_birth',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: 'Official portal requires DD/MM/YYYY format matching Class 10 certificate.',
    formatHelpHi: 'आधिकारिक पोर्टल पर कक्षा 10 प्रमाण पत्र के अनुसार DD/MM/YYYY प्रारूप आवश्यक है।',
    placeholderEn: 'DD/MM/YYYY',
    placeholderHi: 'दिन/माह/वर्ष',
    sourceInstructionRef: 'NSP Registration Guidelines - Clause 2.2',
  },
  {
    fieldId: 'domicile_state',
    section: 'General Information',
    labelEn: 'State of Domicile',
    labelHi: 'अधिवास राज्य',
    profilePath: 'basic.domicileState',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: 'Select the state where you hold permanent residency. Cannot be changed after registration.',
    formatHelpHi: 'वह राज्य चुनें जहाँ का मूल निवास प्रमाण पत्र आपके पास है। पंजीकरण के बाद यह बदला नहीं जा सकता।',
    sourceInstructionRef: 'NSP State Domicile Rules',
  },
  {
    fieldId: 'domicile_district',
    section: 'General Information',
    labelEn: 'District of Domicile',
    labelHi: 'अधिवास ज़िला',
    profilePath: 'basic.domicileDistrict',
    isMandatory: false,
    highImpact: false,
    formatHelpEn: 'Select your home district within your domicile state.',
    formatHelpHi: 'अपने अधिवास राज्य के अंतर्गत गृह जनपद चुनें।',
    sourceInstructionRef: 'NSP District Nodal Office Protocol',
  },
  {
    fieldId: 'category',
    section: 'General Information',
    labelEn: 'Social / Caste Category',
    labelHi: 'सामाजिक / जाति श्रेणी',
    profilePath: 'schemeDependent.category',
    vaultCategory: 'caste_certificate',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: 'Select SC, ST, OBC, or General as verified by your government caste certificate.',
    formatHelpHi: 'सत्यापित जाति प्रमाण पत्र के अनुसार SC, ST, OBC या General चुनें।',
    sourceInstructionRef: 'MoSJE & MoMA Category Quota Guidelines',
  },
  {
    fieldId: 'annual_family_income',
    section: 'General Information',
    labelEn: 'Annual Family Income (in ₹)',
    labelHi: 'वार्षिक पारिवारिक आय (₹ में)',
    profilePath: 'schemeDependent.familyIncome',
    vaultCategory: 'income_certificate',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: 'Enter total annual family income from all sources in pure digits without commas.',
    formatHelpHi: 'सभी स्रोतों से कुल वार्षिक पारिवारिक आय बिना कॉमा के केवल अंकों में दर्ज करें।',
    placeholderEn: 'e.g. 150000',
    placeholderHi: 'उदा. 150000',
    sourceInstructionRef: 'Means Test Verification Manual',
  },
  {
    fieldId: 'minority_status',
    section: 'General Information',
    labelEn: 'Minority Community Member',
    labelHi: 'अल्पसंख्यक समुदाय सदस्य',
    profilePath: 'schemeDependent.minorityStatus',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: 'Select Yes if member of notified minority (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).',
    formatHelpHi: 'अधिसूचित अल्पसंख्यक समुदाय का सदस्य होने पर हाँ (Yes) चुनें।',
    sourceInstructionRef: 'Ministry of Minority Affairs Notification',
  },

  // Section 2: Academic Details
  {
    fieldId: 'institution_name',
    section: 'Academic Details',
    labelEn: 'Present Institution / College Name',
    labelHi: 'वर्तमान संस्थान / कॉलेज का नाम',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: 'Select AISHE / DISE registered institution from the official NSP portal dropdown.',
    formatHelpHi: 'आधिकारिक एनएसपी ड्रॉपडाउन से AISHE / DISE पंजीकृत संस्थान का चयन करें।',
    sourceInstructionRef: 'Institute Nodal Officer Verification Guidelines',
  },
  {
    fieldId: 'present_course',
    section: 'Academic Details',
    labelEn: 'Present Course / Degree',
    labelHi: 'वर्तमान पाठ्यक्रम / डिग्री',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: 'Course in which student is currently enrolled for Academic Year 2026-27.',
    formatHelpHi: 'सत्र 2026-27 में अध्ययनरत पाठ्यक्रम का नाम।',
    sourceInstructionRef: 'Course Eligibility Matrix',
  },
  {
    fieldId: 'previous_board',
    section: 'Academic Details',
    labelEn: 'Previous Examination Board',
    labelHi: 'पूर्व परीक्षा बोर्ड',
    isMandatory: false,
    highImpact: false,
    formatHelpEn: 'Board or University from which the qualifying examination was passed.',
    formatHelpHi: 'वह बोर्ड या विश्वविद्यालय जिससे अर्हक परीक्षा उत्तीर्ण की।',
    sourceInstructionRef: 'Academic Record Standards',
  },
  {
    fieldId: 'previous_marks_percentage',
    section: 'Academic Details',
    labelEn: 'Previous Marks Percentage (%)',
    labelHi: 'पूर्व परीक्षा प्राप्तांक प्रतिशत (%)',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: 'Percentage scored in the qualifying examination. Do not round up.',
    formatHelpHi: 'अर्हक परीक्षा में प्राप्त वास्तविक प्रतिशत। दशमलव सहित दर्ज करें।',
    placeholderEn: 'e.g. 78.50',
    placeholderHi: 'उदा. 78.50',
    sourceInstructionRef: 'Merit List Calculation Rules',
  },
  {
    fieldId: 'previous_passing_year',
    section: 'Academic Details',
    labelEn: 'Passing Year of Qualifying Exam',
    labelHi: 'अर्हक परीक्षा उत्तीर्ण वर्ष',
    isMandatory: false,
    highImpact: false,
    formatHelpEn: 'Year in which previous qualifying examination was cleared.',
    formatHelpHi: 'वह वर्ष जिसमें पूर्व परीक्षा उत्तीर्ण की गई थी।',
    sourceInstructionRef: 'Continuous Study Rules',
  },

  // Section 3: Bank Account Details
  {
    fieldId: 'bank_ifsc',
    section: 'Bank Account Details',
    labelEn: 'Bank IFSC Code',
    labelHi: 'बैंक आईएफएससी कोड',
    vaultCategory: 'bank_passbook',
    vaultFieldKey: 'ifsc',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: '11-character IFSC code printed on your passbook or cheque leaf.',
    formatHelpHi: 'पासबुक पर अंकित 11 अक्षरों का आईएफएससी कोड।',
    placeholderEn: 'e.g. SBIN0001234',
    placeholderHi: 'उदा. SBIN0001234',
    sourceInstructionRef: 'PFMS Direct Benefit Transfer (DBT) Guidelines',
  },
  {
    fieldId: 'bank_account_number',
    section: 'Bank Account Details',
    labelEn: 'Bank Account Number',
    labelHi: 'बैंक खाता संख्या',
    vaultCategory: 'bank_passbook',
    vaultFieldKey: 'account_number',
    isMandatory: true,
    highImpact: true,
    formatHelpEn: 'Active personal savings account in the student’s own name. Must be Aadhaar seeded for DBT.',
    formatHelpHi: 'छात्र के अपने नाम पर सक्रिय बचत खाता, जो आधार एवं डीबीटी से जुड़ा हो।',
    sourceInstructionRef: 'Aadhaar Enabled Payment System (AePS) Rules',
  },

  // Section 4: Contact & Identity Details
  {
    fieldId: 'hosteller_status',
    section: 'Contact & Residential Details',
    labelEn: 'Day Scholar or Hosteller',
    labelHi: 'डे-स्कॉलर अथवा छात्रावासी',
    profilePath: 'schemeDependent.hostellerStatus',
    isMandatory: true,
    highImpact: false,
    formatHelpEn: 'Affects maintenance allowance entitlement. Hosteller requires valid hostel certificate.',
    formatHelpHi: 'रखरखाव भत्ते का निर्धारण करता है। छात्रावास प्रमाण पत्र आवश्यक होता है।',
    sourceInstructionRef: 'Maintenance Allowance Entitlement Rules',
  },
];

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY for Indian portals
 */
export function formatToPortalDate(isoDate: string): string {
  if (!isoDate) return '';
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate;
  const [, yyyy, mm, dd] = match;
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Generates an Application Preparation Workspace for a scholarship scheme
 */
export function generateApplicationPreparationForm(
  scheme: Scholarship,
  profile?: StudentProfile | null,
  vaultDocuments?: VaultDocument[] | null,
  existingForm?: ApplicationPreparationForm | null
): ApplicationPreparationForm {
  const docs = vaultDocuments || [];
  const preparedFields: PreparedFieldValue[] = [];

  let preparedCount = 0;
  let missingCount = 0;
  let confirmedCount = 0;
  let conflictCount = 0;
  let highImpactPendingCount = 0;

  for (const def of NSP_PORTAL_FIELD_DEFS) {
    let candidateValue = '';
    let sourceType: 'profile' | 'vault_document' | 'manual_override' | 'missing' = 'missing';
    let provenanceNoteEn = 'Not yet recorded in Profile or Vault.';
    let provenanceNoteHi = 'प्रोफ़ाइल अथवा वॉल्ट में अभी दर्ज नहीं है।';
    let hasConflict = false;
    let conflictDetailEn: string | undefined;
    let conflictDetailHi: string | undefined;
    let isConfirmed = false;

    // Check if an existing user-confirmed or overridden value exists
    const existingField = existingForm?.fields.find(f => f.fieldId === def.fieldId);
    if (existingField && existingField.sourceType === 'manual_override') {
      candidateValue = existingField.candidateValue;
      sourceType = 'manual_override';
      provenanceNoteEn = 'Manually edited and verified by student.';
      provenanceNoteHi = 'छात्र द्वारा स्वयं संपादित एवं सत्यापित।';
      isConfirmed = existingField.isConfirmed;
    } else {
      // 1. Check Student Profile
      let profileVal: any = undefined;
      if (profile && def.profilePath) {
        if (def.profilePath === 'basic.displayName') profileVal = profile.basic?.displayName;
        else if (def.profilePath === 'basic.dateOfBirth') profileVal = profile.basic?.dateOfBirth;
        else if (def.profilePath === 'basic.domicileState') profileVal = profile.basic?.domicileState;
        else if (def.profilePath === 'basic.domicileDistrict') profileVal = profile.basic?.domicileDistrict;
        else if (def.profilePath === 'schemeDependent.category') profileVal = profile.schemeDependent?.category?.toUpperCase();
        else if (def.profilePath === 'schemeDependent.familyIncome') profileVal = profile.schemeDependent?.familyIncome;
        else if (def.profilePath === 'schemeDependent.minorityStatus') {
          profileVal = profile.schemeDependent?.minorityStatus === true ? 'Yes (Minority)' : 'No (Non-Minority)';
        } else if (def.profilePath === 'schemeDependent.hostellerStatus') {
          profileVal = profile.schemeDependent?.hostellerStatus === 'hosteller' ? 'Hosteller' : 'Day Scholar';
        }
      }

      // 2. Check Academic Records
      if (profile?.academicRecords && profile.academicRecords.length > 0) {
        const topRec = profile.academicRecords[0];
        if (def.fieldId === 'institution_name' && topRec.institution) profileVal = topRec.institution;
        else if (def.fieldId === 'present_course' && topRec.course) profileVal = topRec.course;
        else if (def.fieldId === 'previous_board' && topRec.board) profileVal = topRec.board;
        else if (def.fieldId === 'previous_passing_year' && topRec.passingYear) profileVal = String(topRec.passingYear);
        else if (def.fieldId === 'previous_marks_percentage' && topRec.percentage !== undefined) {
          profileVal = topRec.percentage.toFixed(2);
        }
      }

      // 3. Check Vault Documents
      let vaultVal: string | undefined = undefined;
      let vaultDocName: string | undefined = undefined;

      if (def.vaultCategory) {
        const matchedDoc = docs.find(d => d.category === def.vaultCategory);
        if (matchedDoc) {
          vaultDocName = matchedDoc.fileName;
          if (def.vaultFieldKey && matchedDoc.extractedFields) {
            const extField = matchedDoc.extractedFields.find(
              f => f.fieldKey === def.vaultFieldKey
            );
            if (extField) {
              vaultVal = extField.userConfirmedValue || extField.originalValue;
            }
          }
        }
      }

      // Check conflict between Profile and Document
      if (profileVal && vaultVal && String(profileVal).toLowerCase() !== String(vaultVal).toLowerCase()) {
        hasConflict = true;
        conflictDetailEn = `Discrepancy: Profile has "${profileVal}", but Document shows "${vaultVal}". Please verify official certificate.`;
        conflictDetailHi = `भिन्नता: प्रोफ़ाइल में "${profileVal}" है किंतु दस्तावेज़ में "${vaultVal}" है। कृपया प्रमाण पत्र की जाँच करें।`;
        conflictCount++;
      }

      // Determine candidate value and provenance
      if (profileVal !== undefined && profileVal !== null && String(profileVal).trim() !== '') {
        candidateValue = def.fieldId === 'dob' ? formatToPortalDate(String(profileVal)) : String(profileVal);
        sourceType = 'profile';
        provenanceNoteEn = 'Retrieved from Student Profile.';
        provenanceNoteHi = 'छात्र प्रोफ़ाइल से प्राप्त।';
      } else if (vaultVal) {
        candidateValue = def.fieldId === 'dob' ? formatToPortalDate(vaultVal) : vaultVal;
        sourceType = 'vault_document';
        provenanceNoteEn = `Extracted from Vault Document (${vaultDocName}).`;
        provenanceNoteHi = `वॉल्ट दस्तावेज़ (${vaultDocName}) से प्राप्त।`;
      }

      if (existingField) {
        isConfirmed = existingField.isConfirmed;
      }
    }

    if (candidateValue && candidateValue.trim() !== '') {
      preparedCount++;
      if (isConfirmed) confirmedCount++;
      else if (def.highImpact) highImpactPendingCount++;
    } else {
      missingCount++;
      if (def.highImpact) highImpactPendingCount++;
    }

    preparedFields.push({
      fieldId: def.fieldId,
      section: def.section,
      labelEn: def.labelEn,
      labelHi: def.labelHi,
      candidateValue,
      sourceType,
      provenanceNoteEn,
      provenanceNoteHi,
      isMandatory: def.isMandatory,
      highImpact: def.highImpact,
      isConfirmed,
      hasConflict,
      conflictDetailEn,
      conflictDetailHi,
      formatHelpEn: def.formatHelpEn,
      formatHelpHi: def.formatHelpHi,
      sourceInstructionRef: def.sourceInstructionRef,
    });
  }

  const allHighImpactConfirmed = preparedFields
    .filter(f => f.highImpact && f.isMandatory)
    .every(f => f.isConfirmed && f.candidateValue.trim() !== '');

  const status: PreparationStatus =
    existingForm?.status === 'confirmed_by_student' || (allHighImpactConfirmed && missingCount === 0)
      ? 'confirmed_by_student'
      : preparedCount > 0
      ? 'in_review'
      : 'draft';

  return {
    preparationId: existingForm?.preparationId || `prep_${scheme.id}_${Date.now()}`,
    scholarshipId: scheme.id,
    scholarshipCode: scheme.code,
    scholarshipNameEn: scheme.nameEn,
    scholarshipNameHi: scheme.nameHi,
    portalName: 'National Scholarship Portal (NSP)',
    portalUrl: scheme.officialSource.applicationUrl,
    academicYear: scheme.academicYear,
    mappingVersion: CURRENT_MAPPING_VERSION,
    status,
    fields: preparedFields,
    summary: {
      totalFields: preparedFields.length,
      preparedCount,
      missingCount,
      confirmedCount,
      conflictCount,
      highImpactPendingCount,
    },
    finalReviewChecklist: existingForm?.finalReviewChecklist || {
      schemeConfirmed: false,
      identityConfirmed: false,
      academicsConfirmed: false,
      bankAccountConfirmed: false,
      categoryIncomeConfirmed: false,
      documentsConfirmed: false,
      officialGuidelinesRead: false,
    },
    studentNotes: existingForm?.studentNotes,
    updatedAt: new Date().toISOString(),
    reviewedAt: existingForm?.reviewedAt,
  };
}

/**
 * Updates a specific field inside an existing preparation form
 */
export function updateFieldValueInForm(
  form: ApplicationPreparationForm,
  fieldId: string,
  newValue: string,
  isConfirmed: boolean = true
): ApplicationPreparationForm {
  const updatedFields = form.fields.map(f => {
    if (f.fieldId === fieldId) {
      return {
        ...f,
        candidateValue: newValue,
        sourceType: 'manual_override' as const,
        provenanceNoteEn: 'Manually verified and confirmed by student.',
        provenanceNoteHi: 'छात्र द्वारा स्वयं सत्यापित एवं पुष्टि की गई।',
        isConfirmed,
        hasConflict: false,
      };
    }
    return f;
  });

  const preparedCount = updatedFields.filter(f => f.candidateValue.trim() !== '').length;
  const missingCount = updatedFields.filter(f => f.candidateValue.trim() === '').length;
  const confirmedCount = updatedFields.filter(f => f.isConfirmed).length;
  const conflictCount = updatedFields.filter(f => f.hasConflict).length;
  const highImpactPendingCount = updatedFields.filter(
    f => f.highImpact && (!f.isConfirmed || f.candidateValue.trim() === '')
  ).length;

  return {
    ...form,
    fields: updatedFields,
    summary: {
      totalFields: updatedFields.length,
      preparedCount,
      missingCount,
      confirmedCount,
      conflictCount,
      highImpactPendingCount,
    },
    updatedAt: new Date().toISOString(),
  };
}


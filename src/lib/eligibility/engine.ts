import {
  type ConditionEvaluation,
  type SchemeEligibilityEvaluation,
  type EligibilityEvaluationBatch,
  type OverallEligibilityStatus,
  ConditionEvaluationSchema,
  SchemeEligibilityEvaluationSchema,
} from './schema';
import { type StudentProfile } from '../profile/schema';
import { type Scholarship } from '../catalogue/schema';
import { getAllScholarships, getScholarshipById } from '../catalogue/engine';

export const CURRENT_RULESET_VERSION = '2026-27.v1';

/**
 * Format currency number in Indian numbering system
 */
function formatInr(amount: number): string {
  return amount.toLocaleString('en-IN');
}

/**
 * Evaluates a single scholarship scheme against a student profile deterministically.
 * Adheres strictly to Spec 08: 3-valued logic (PASS, FAIL, UNKNOWN) and Rule P2 (explains, never guarantees).
 */
export function evaluateSchemeEligibility(
  scheme: Scholarship,
  profile?: StudentProfile | null,
  uploadedDocumentCategories?: string[]
): SchemeEligibilityEvaluation {
  const conditions: ConditionEvaluation[] = [];
  const missingFields: string[] = [];
  const failedReasonsEn: string[] = [];
  const failedReasonsHi: string[] = [];

  const sourceCitation = `Official Guideline: ${scheme.providerEn} (${scheme.academicYear})`;

  // 1. Domicile State Condition
  const schemeState = scheme.state.trim();
  const studentState = profile?.basic?.domicileState?.trim();

  if (schemeState.toLowerCase() === 'all india') {
    if (studentState) {
      conditions.push({
        conditionId: `${scheme.id}_domicile`,
        conditionType: 'domicile_state',
        labelEn: 'State Domicile',
        labelHi: 'राज्य का अधिवास',
        result: 'PASS',
        isMandatory: true,
        studentValue: studentState,
        expectedValue: 'All India (Any Indian State/UT)',
        explanationEn: `Student domicile in ${studentState} satisfies the All-India central scheme criteria.`,
        explanationHi: `छात्र का ${studentState} में अधिवास अखिल भारतीय केंद्रीय योजना पात्रता को पूरा करता है।`,
        sourceReference: `${sourceCitation} - Section 3 (Domicile Scope)`,
      });
    } else {
      conditions.push({
        conditionId: `${scheme.id}_domicile`,
        conditionType: 'domicile_state',
        labelEn: 'State Domicile',
        labelHi: 'राज्य का अधिवास',
        result: 'UNKNOWN',
        isMandatory: true,
        studentValue: undefined,
        expectedValue: 'All India (Any Indian State/UT)',
        explanationEn: 'Student domicile state is not recorded in profile. Central schemes require verified Indian domicile.',
        explanationHi: 'प्रोफ़ाइल में अधिवास राज्य दर्ज नहीं है। केंद्रीय योजनाओं हेतु सत्यापित अधिवास आवश्यक है।',
        sourceReference: `${sourceCitation} - Section 3 (Domicile Scope)`,
        missingFieldName: 'basic.domicileState',
      });
      missingFields.push('Domicile State (अधिवास राज्य)');
    }
  } else {
    // Specific state scheme (e.g. Uttar Pradesh)
    if (!studentState) {
      conditions.push({
        conditionId: `${scheme.id}_domicile`,
        conditionType: 'domicile_state',
        labelEn: 'State Domicile',
        labelHi: 'राज्य का अधिवास',
        result: 'UNKNOWN',
        isMandatory: true,
        studentValue: undefined,
        expectedValue: schemeState,
        explanationEn: `Scheme is restricted to residents of ${schemeState}, but domicile state is not recorded in profile.`,
        explanationHi: `यह योजना ${schemeState} के मूल निवासियों हेतु है, किंतु प्रोफ़ाइल में राज्य दर्ज नहीं है।`,
        sourceReference: `${sourceCitation} - Eligibility Clause 1`,
        missingFieldName: 'basic.domicileState',
      });
      missingFields.push('Domicile State (अधिवास राज्य)');
    } else if (studentState.toLowerCase() === schemeState.toLowerCase()) {
      conditions.push({
        conditionId: `${scheme.id}_domicile`,
        conditionType: 'domicile_state',
        labelEn: 'State Domicile',
        labelHi: 'राज्य का अधिवास',
        result: 'PASS',
        isMandatory: true,
        studentValue: studentState,
        expectedValue: schemeState,
        explanationEn: `Student domicile in ${studentState} matches the required state (${schemeState}).`,
        explanationHi: `छात्र का अधिवास (${studentState}) योजना के आवश्यक राज्य (${schemeState}) से मेल खाता है।`,
        sourceReference: `${sourceCitation} - Eligibility Clause 1`,
      });
    } else {
      const reasonEn = `Scheme is restricted to residents of ${schemeState}. Recorded domicile is ${studentState}.`;
      const reasonHi = `यह योजना ${schemeState} के निवासियों के लिए है। छात्र का दर्ज अधिवास ${studentState} है।`;
      conditions.push({
        conditionId: `${scheme.id}_domicile`,
        conditionType: 'domicile_state',
        labelEn: 'State Domicile',
        labelHi: 'राज्य का अधिवास',
        result: 'FAIL',
        isMandatory: true,
        studentValue: studentState,
        expectedValue: schemeState,
        explanationEn: reasonEn,
        explanationHi: reasonHi,
        sourceReference: `${sourceCitation} - Eligibility Clause 1`,
      });
      failedReasonsEn.push(reasonEn);
      failedReasonsHi.push(reasonHi);
    }
  }

  // 2. Social Category Condition
  const studentCategory = profile?.schemeDependent?.category;
  const isMinority = profile?.schemeDependent?.minorityStatus;
  const targetCategories = scheme.targetCategories;

  if (targetCategories.includes('all')) {
    if (studentCategory) {
      conditions.push({
        conditionId: `${scheme.id}_category`,
        conditionType: 'category',
        labelEn: 'Social Category',
        labelHi: 'सामाजिक श्रेणी',
        result: 'PASS',
        isMandatory: true,
        studentValue: studentCategory.toUpperCase(),
        expectedValue: 'All Categories (सभी श्रेणियाँ)',
        explanationEn: 'Scheme is open to eligible applicants from all social categories.',
        explanationHi: 'यह योजना सभी सामाजिक श्रेणियों के पात्र आवेदकों के लिए खुली है।',
        sourceReference: `${sourceCitation} - Target Group`,
      });
    } else {
      conditions.push({
        conditionId: `${scheme.id}_category`,
        conditionType: 'category',
        labelEn: 'Social Category',
        labelHi: 'सामाजिक श्रेणी',
        result: 'UNKNOWN',
        isMandatory: true,
        studentValue: undefined,
        expectedValue: 'All Categories (सभी श्रेणियाँ)',
        explanationEn: 'Social category not recorded in profile.',
        explanationHi: 'प्रोफ़ाइल में सामाजिक श्रेणी दर्ज नहीं है।',
        sourceReference: `${sourceCitation} - Target Group`,
        missingFieldName: 'schemeDependent.category',
      });
      missingFields.push('Social Category (सामाजिक श्रेणी)');
    }
  } else if (targetCategories.includes('minority')) {
    // Minority scheme
    if (isMinority === true) {
      conditions.push({
        conditionId: `${scheme.id}_category`,
        conditionType: 'category',
        labelEn: 'Minority Status',
        labelHi: 'अल्पसंख्यक स्थिति',
        result: 'PASS',
        isMandatory: true,
        studentValue: 'Minority Community (अल्पसंख्यक)',
        expectedValue: 'Minority Community (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)',
        explanationEn: 'Student is identified as a member of a notified minority community.',
        explanationHi: 'छात्र को अधिसूचित अल्पसंख्यक समुदाय के सदस्य के रूप में दर्ज किया गया है।',
        sourceReference: `${sourceCitation} - MoMA Target Beneficiary Rules`,
      });
    } else if (isMinority === false) {
      const reasonEn = 'Scheme is strictly reserved for notified minority communities.';
      const reasonHi = 'यह योजना केवल अधिसूचित अल्पसंख्यक समुदायों के विद्यार्थियों हेतु आरक्षित है।';
      conditions.push({
        conditionId: `${scheme.id}_category`,
        conditionType: 'category',
        labelEn: 'Minority Status',
        labelHi: 'अल्पसंख्यक स्थिति',
        result: 'FAIL',
        isMandatory: true,
        studentValue: 'Non-Minority (गैर-अल्पसंख्यक)',
        expectedValue: 'Minority Community',
        explanationEn: reasonEn,
        explanationHi: reasonHi,
        sourceReference: `${sourceCitation} - MoMA Target Beneficiary Rules`,
      });
      failedReasonsEn.push(reasonEn);
      failedReasonsHi.push(reasonHi);
    } else {
      conditions.push({
        conditionId: `${scheme.id}_category`,
        conditionType: 'category',
        labelEn: 'Minority Status',
        labelHi: 'अल्पसंख्यक स्थिति',
        result: 'UNKNOWN',
        isMandatory: true,
        studentValue: undefined,
        expectedValue: 'Minority Community',
        explanationEn: 'Minority community status is not recorded in profile.',
        explanationHi: 'प्रोफ़ाइल में अल्पसंख्यक समुदाय की स्थिति दर्ज नहीं है।',
        sourceReference: `${sourceCitation} - MoMA Target Beneficiary Rules`,
        missingFieldName: 'schemeDependent.minorityStatus',
      });
      missingFields.push('Minority Status (अल्पसंख्यक स्थिति)');
    }
  } else {
    // Specific caste category (e.g. SC, ST, OBC)
    const expectedCategories = targetCategories.map(c => c.toUpperCase()).join(', ');
    if (!studentCategory) {
      conditions.push({
        conditionId: `${scheme.id}_category`,
        conditionType: 'category',
        labelEn: 'Social Category',
        labelHi: 'सामाजिक श्रेणी',
        result: 'UNKNOWN',
        isMandatory: true,
        studentValue: undefined,
        expectedValue: expectedCategories,
        explanationEn: `Scheme requires category (${expectedCategories}), but category is not recorded in profile.`,
        explanationHi: `योजना हेतु श्रेणी (${expectedCategories}) आवश्यक है, किंतु प्रोफ़ाइल में दर्ज नहीं है।`,
        sourceReference: `${sourceCitation} - Category Eligibility`,
        missingFieldName: 'schemeDependent.category',
      });
      missingFields.push('Social Category (सामाजिक श्रेणी)');
    } else if (targetCategories.includes(studentCategory as any)) {
      conditions.push({
        conditionId: `${scheme.id}_category`,
        conditionType: 'category',
        labelEn: 'Social Category',
        labelHi: 'सामाजिक श्रेणी',
        result: 'PASS',
        isMandatory: true,
        studentValue: studentCategory.toUpperCase(),
        expectedValue: expectedCategories,
        explanationEn: `Student category (${studentCategory.toUpperCase()}) satisfies the scheme requirement (${expectedCategories}).`,
        explanationHi: `छात्र की श्रेणी (${studentCategory.toUpperCase()}) योजना की आवश्यकता (${expectedCategories}) को पूरा करती है।`,
        sourceReference: `${sourceCitation} - Category Eligibility`,
      });
    } else {
      const reasonEn = `Scheme is restricted to ${expectedCategories}. Recorded student category is ${studentCategory.toUpperCase()}.`;
      const reasonHi = `यह योजना ${expectedCategories} हेतु आरक्षित है। छात्र की श्रेणी ${studentCategory.toUpperCase()} है।`;
      conditions.push({
        conditionId: `${scheme.id}_category`,
        conditionType: 'category',
        labelEn: 'Social Category',
        labelHi: 'सामाजिक श्रेणी',
        result: 'FAIL',
        isMandatory: true,
        studentValue: studentCategory.toUpperCase(),
        expectedValue: expectedCategories,
        explanationEn: reasonEn,
        explanationHi: reasonHi,
        sourceReference: `${sourceCitation} - Category Eligibility`,
      });
      failedReasonsEn.push(reasonEn);
      failedReasonsHi.push(reasonHi);
    }
  }

  // 3. Family Income Ceiling Condition
  if (scheme.maxAnnualIncome !== undefined && scheme.maxAnnualIncome !== null) {
    const rawIncome = profile?.schemeDependent?.familyIncome;
    const incomePeriod = profile?.schemeDependent?.incomePeriod || 'annual';

    if (rawIncome === undefined || rawIncome === null) {
      conditions.push({
        conditionId: `${scheme.id}_income`,
        conditionType: 'income_ceiling',
        labelEn: 'Family Income Ceiling',
        labelHi: 'पारिवारिक आय सीमा',
        result: 'UNKNOWN',
        isMandatory: true,
        studentValue: undefined,
        expectedValue: `≤ ₹${formatInr(scheme.maxAnnualIncome)} / year`,
        explanationEn: `Scheme requires annual family income ≤ ₹${formatInr(scheme.maxAnnualIncome)}, but income is not recorded in profile.`,
        explanationHi: `योजना हेतु वार्षिक पारिवारिक आय ₹${formatInr(scheme.maxAnnualIncome)} या कम आवश्यक है, जो प्रोफ़ाइल में दर्ज नहीं है।`,
        sourceReference: `${sourceCitation} - Means Test / Income Criteria`,
        missingFieldName: 'schemeDependent.familyIncome',
      });
      missingFields.push('Annual Family Income (वार्षिक पारिवारिक आय)');
    } else {
      const annualIncome = incomePeriod === 'monthly' ? rawIncome * 12 : rawIncome;
      if (annualIncome <= scheme.maxAnnualIncome) {
        conditions.push({
          conditionId: `${scheme.id}_income`,
          conditionType: 'income_ceiling',
          labelEn: 'Family Income Ceiling',
          labelHi: 'पारिवारिक आय सीमा',
          result: 'PASS',
          isMandatory: true,
          studentValue: `₹${formatInr(annualIncome)} / year`,
          expectedValue: `≤ ₹${formatInr(scheme.maxAnnualIncome)} / year`,
          explanationEn: `Annual family income of ₹${formatInr(annualIncome)} is within the permissible limit of ₹${formatInr(scheme.maxAnnualIncome)}.`,
          explanationHi: `वार्षिक पारिवारिक आय ₹${formatInr(annualIncome)} अनुमत सीमा ₹${formatInr(scheme.maxAnnualIncome)} के भीतर है।`,
          sourceReference: `${sourceCitation} - Means Test / Income Criteria`,
        });
      } else {
        const reasonEn = `Annual family income of ₹${formatInr(annualIncome)} exceeds the ceiling of ₹${formatInr(scheme.maxAnnualIncome)}.`;
        const reasonHi = `वार्षिक पारिवारिक आय ₹${formatInr(annualIncome)} अधिकतम सीमा ₹${formatInr(scheme.maxAnnualIncome)} से अधिक है।`;
        conditions.push({
          conditionId: `${scheme.id}_income`,
          conditionType: 'income_ceiling',
          labelEn: 'Family Income Ceiling',
          labelHi: 'पारिवारिक आय सीमा',
          result: 'FAIL',
          isMandatory: true,
          studentValue: `₹${formatInr(annualIncome)} / year`,
          expectedValue: `≤ ₹${formatInr(scheme.maxAnnualIncome)} / year`,
          explanationEn: reasonEn,
          explanationHi: reasonHi,
          sourceReference: `${sourceCitation} - Means Test / Income Criteria`,
        });
        failedReasonsEn.push(reasonEn);
        failedReasonsHi.push(reasonHi);
      }
    }
  }

  // 4. Education Level Condition
  const targetLevels = scheme.targetEducationLevels;
  const records = profile?.academicRecords || [];

  if (targetLevels.includes('all')) {
    if (records.length > 0) {
      conditions.push({
        conditionId: `${scheme.id}_education_level`,
        conditionType: 'education_level',
        labelEn: 'Education Level',
        labelHi: 'शिक्षा का स्तर',
        result: 'PASS',
        isMandatory: true,
        studentValue: records.map(r => r.level).join(', '),
        expectedValue: 'All Education Levels (सभी स्तर)',
        explanationEn: 'Scheme covers all recognised education levels.',
        explanationHi: 'यह योजना सभी मान्यता प्राप्त शिक्षा स्तरों को सम्मिलित करती है।',
        sourceReference: `${sourceCitation} - Course Eligibility`,
      });
    } else {
      conditions.push({
        conditionId: `${scheme.id}_education_level`,
        conditionType: 'education_level',
        labelEn: 'Education Level',
        labelHi: 'शिक्षा का स्तर',
        result: 'UNKNOWN',
        isMandatory: true,
        studentValue: undefined,
        expectedValue: 'All Education Levels (सभी स्तर)',
        explanationEn: 'No academic records found in student profile.',
        explanationHi: 'छात्र प्रोफ़ाइल में कोई शैक्षणिक रिकॉर्ड नहीं मिला।',
        sourceReference: `${sourceCitation} - Course Eligibility`,
        missingFieldName: 'academicRecords',
      });
      missingFields.push('Academic Records (शैक्षणिक रिकॉर्ड)');
    }
  } else {
    const expectedLevelsStr = targetLevels.map(l => l.replace(/_/g, ' ')).join(', ');
    if (records.length === 0) {
      conditions.push({
        conditionId: `${scheme.id}_education_level`,
        conditionType: 'education_level',
        labelEn: 'Education Level',
        labelHi: 'शिक्षा का स्तर',
        result: 'UNKNOWN',
        isMandatory: true,
        studentValue: undefined,
        expectedValue: expectedLevelsStr,
        explanationEn: `Scheme requires enrollment in (${expectedLevelsStr}), but no academic records are recorded.`,
        explanationHi: `योजना हेतु (${expectedLevelsStr}) में अध्ययन आवश्यक है, किंतु कोई शैक्षणिक रिकॉर्ड दर्ज नहीं है।`,
        sourceReference: `${sourceCitation} - Course Eligibility`,
        missingFieldName: 'academicRecords',
      });
      missingFields.push('Academic Records (शैक्षणिक रिकॉर्ड)');
    } else {
      // Find matching level in student's academic records
      // Special mapping: class_10 can match class_9_10; class_12 can match class_11_12
      const matchesLevel = records.some(r => {
        if (targetLevels.includes(r.level as any)) return true;
        if (r.level === 'class_10' && targetLevels.includes('class_9_10')) return true;
        if (r.level === 'class_12' && targetLevels.includes('class_11_12')) return true;
        return false;
      });

      const studentLevelsStr = records.map(r => r.level.replace(/_/g, ' ')).join(', ');

      if (matchesLevel) {
        conditions.push({
          conditionId: `${scheme.id}_education_level`,
          conditionType: 'education_level',
          labelEn: 'Education Level',
          labelHi: 'शिक्षा का स्तर',
          result: 'PASS',
          isMandatory: true,
          studentValue: studentLevelsStr,
          expectedValue: expectedLevelsStr,
          explanationEn: `Student academic enrollment (${studentLevelsStr}) matches scheme target level (${expectedLevelsStr}).`,
          explanationHi: `छात्र का शैक्षणिक स्तर (${studentLevelsStr}) योजना के लक्षित स्तर (${expectedLevelsStr}) से मेल खाता है।`,
          sourceReference: `${sourceCitation} - Course Eligibility`,
        });
      } else {
        const reasonEn = `Scheme is designed for (${expectedLevelsStr}). Recorded student level is (${studentLevelsStr}).`;
        const reasonHi = `यह योजना (${expectedLevelsStr}) हेतु है। छात्र का दर्ज स्तर (${studentLevelsStr}) है।`;
        conditions.push({
          conditionId: `${scheme.id}_education_level`,
          conditionType: 'education_level',
          labelEn: 'Education Level',
          labelHi: 'शिक्षा का स्तर',
          result: 'FAIL',
          isMandatory: true,
          studentValue: studentLevelsStr,
          expectedValue: expectedLevelsStr,
          explanationEn: reasonEn,
          explanationHi: reasonHi,
          sourceReference: `${sourceCitation} - Course Eligibility`,
        });
        failedReasonsEn.push(reasonEn);
        failedReasonsHi.push(reasonHi);
      }
    }
  }

  // 5. Minimum Marks Percentage Condition
  if (scheme.minPercentageMarks !== undefined && scheme.minPercentageMarks !== null) {
    const recordsWithMarks = records.filter(r => r.percentage !== undefined || (r.marks !== undefined && r.maxMarks));
    if (recordsWithMarks.length === 0) {
      conditions.push({
        conditionId: `${scheme.id}_marks`,
        conditionType: 'minimum_marks',
        labelEn: 'Minimum Academic Marks',
        labelHi: 'न्यूनतम शैक्षणिक अंक',
        result: 'UNKNOWN',
        isMandatory: true,
        studentValue: undefined,
        expectedValue: `≥ ${scheme.minPercentageMarks}%`,
        explanationEn: `Scheme requires minimum ${scheme.minPercentageMarks}% marks in qualifying exam, but marks are not recorded.`,
        explanationHi: `योजना हेतु अर्हक परीक्षा में न्यूनतम ${scheme.minPercentageMarks}% अंक आवश्यक हैं, जो दर्ज नहीं हैं।`,
        sourceReference: `${sourceCitation} - Merit Criteria`,
        missingFieldName: 'academicRecords.percentage',
      });
      missingFields.push('Qualifying Examination Percentage (अंक प्रतिशत)');
    } else {
      // Find the highest or most recent percentage
      const percentages = recordsWithMarks.map(r => {
        if (r.percentage !== undefined) return r.percentage;
        if (r.marks !== undefined && r.maxMarks && r.maxMarks > 0) {
          return (r.marks / r.maxMarks) * 100;
        }
        return 0;
      });
      const maxPercentage = Math.max(...percentages);

      if (maxPercentage >= scheme.minPercentageMarks) {
        conditions.push({
          conditionId: `${scheme.id}_marks`,
          conditionType: 'minimum_marks',
          labelEn: 'Minimum Academic Marks',
          labelHi: 'न्यूनतम शैक्षणिक अंक',
          result: 'PASS',
          isMandatory: true,
          studentValue: `${maxPercentage.toFixed(1)}%`,
          expectedValue: `≥ ${scheme.minPercentageMarks}%`,
          explanationEn: `Achieved score of ${maxPercentage.toFixed(1)}% satisfies the required minimum of ${scheme.minPercentageMarks}%.`,
          explanationHi: `प्राप्त ${maxPercentage.toFixed(1)}% अंक आवश्यक न्यूनतम ${scheme.minPercentageMarks}% को पूरा करते हैं।`,
          sourceReference: `${sourceCitation} - Merit Criteria`,
        });
      } else {
        const reasonEn = `Achieved score of ${maxPercentage.toFixed(1)}% is below the required minimum of ${scheme.minPercentageMarks}%.`;
        const reasonHi = `प्राप्त ${maxPercentage.toFixed(1)}% अंक आवश्यक न्यूनतम ${scheme.minPercentageMarks}% से कम हैं।`;
        conditions.push({
          conditionId: `${scheme.id}_marks`,
          conditionType: 'minimum_marks',
          labelEn: 'Minimum Academic Marks',
          labelHi: 'न्यूनतम शैक्षणिक अंक',
          result: 'FAIL',
          isMandatory: true,
          studentValue: `${maxPercentage.toFixed(1)}%`,
          expectedValue: `≥ ${scheme.minPercentageMarks}%`,
          explanationEn: reasonEn,
          explanationHi: reasonHi,
          sourceReference: `${sourceCitation} - Merit Criteria`,
        });
        failedReasonsEn.push(reasonEn);
        failedReasonsHi.push(reasonHi);
      }
    }
  }

  // 6. Gender Restriction Condition
  if (scheme.genderRestriction === 'all') {
    conditions.push({
      conditionId: `${scheme.id}_gender`,
      conditionType: 'gender_restriction',
      labelEn: 'Gender Eligibility',
      labelHi: 'लिंग पात्रता',
      result: 'PASS',
      isMandatory: true,
      studentValue: 'All Genders (सभी लिंग)',
      expectedValue: 'All Genders (सभी लिंग)',
      explanationEn: 'Scheme has no gender restrictions and is open to all applicants.',
      explanationHi: 'यह योजना बिना किसी लिंग प्रतिबंध के सभी आवेदकों के लिए खुली है।',
      sourceReference: `${sourceCitation} - General Eligibility`,
    });
  }

  // 7. Informational Document Readiness Condition (from Document Vault if provided)
  if (scheme.requiredDocuments && scheme.requiredDocuments.length > 0) {
    if (uploadedDocumentCategories && uploadedDocumentCategories.length > 0) {
      const uploadedCount = scheme.requiredDocuments.filter(d => uploadedDocumentCategories.includes(d)).length;
      const totalDocs = scheme.requiredDocuments.length;
      const docResult = uploadedCount === totalDocs ? 'PASS' : 'UNKNOWN';

      conditions.push({
        conditionId: `${scheme.id}_documents`,
        conditionType: 'required_documents',
        labelEn: 'Vault Documents Readiness',
        labelHi: 'वॉल्ट दस्तावेज़ तैयारी',
        result: docResult,
        isMandatory: false, // Informational document readiness, does not block core eligibility rule
        studentValue: `${uploadedCount} / ${totalDocs} uploaded`,
        expectedValue: `${totalDocs} verified documents`,
        explanationEn:
          uploadedCount === totalDocs
            ? 'All required scheme documents are uploaded in your private Document Vault.'
            : `${uploadedCount} of ${totalDocs} required documents are in your Document Vault. Upload remaining documents before final submission.`,
        explanationHi:
          uploadedCount === totalDocs
            ? 'सभी आवश्यक दस्तावेज़ आपके निजी डॉक्युमेंट वॉल्ट में अपलोड हैं।'
            : `${totalDocs} में से ${uploadedCount} आवश्यक दस्तावेज़ वॉल्ट में हैं। अंतिम आवेदन से पूर्व शेष दस्तावेज़ अपलोड करें।`,
        sourceReference: `${sourceCitation} - Required Document Checklist`,
      });
    }
  }

  // Compute 3-Valued Aggregation Invariant (Spec 08 Section 5)
  const mandatoryConditions = conditions.filter(c => c.isMandatory);
  const passedCount = mandatoryConditions.filter(c => c.result === 'PASS').length;
  const failedCount = mandatoryConditions.filter(c => c.result === 'FAIL').length;
  const unknownCount = mandatoryConditions.filter(c => c.result === 'UNKNOWN').length;

  let overallResult: OverallEligibilityStatus;

  // Stale or unverified rules cannot evaluate to positive (Spec 08 Section 5)
  if (scheme.officialSource.reviewStatus !== 'verified') {
    overallResult = 'UNVERIFIED';
  } else if (failedCount > 0) {
    overallResult = 'NOT_ELIGIBLE';
  } else if (unknownCount > 0) {
    overallResult = 'NEEDS_INFORMATION';
  } else {
    overallResult = 'POTENTIALLY_ELIGIBLE';
  }

  return {
    scholarshipId: scheme.id,
    scholarshipCode: scheme.code,
    scholarshipNameEn: scheme.nameEn,
    scholarshipNameHi: scheme.nameHi,
    providerEn: scheme.providerEn,
    providerHi: scheme.providerHi,
    academicYear: scheme.academicYear,
    overallResult,
    ruleSetVersion: CURRENT_RULESET_VERSION,
    conditionEvaluations: conditions,
    passedCount,
    failedCount,
    unknownCount,
    missingFields: Array.from(new Set(missingFields)),
    failedReasonsEn,
    failedReasonsHi,
    officialSourceUrl: scheme.officialSource.guidelineUrl,
    applicationUrl: scheme.officialSource.applicationUrl,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Runs eligibility evaluation across all or selected scholarship schemes.
 */
export function runEligibilityEvaluation(
  profile?: StudentProfile | null,
  scholarshipIds?: string[],
  uploadedDocumentCategories?: string[]
): EligibilityEvaluationBatch {
  const allSchemes = getAllScholarships();
  const schemesToEvaluate = scholarshipIds && scholarshipIds.length > 0
    ? allSchemes.filter(s => scholarshipIds.includes(s.id))
    : allSchemes;

  const evaluations: SchemeEligibilityEvaluation[] = [];

  for (const scheme of schemesToEvaluate) {
    const evaluation = evaluateSchemeEligibility(scheme, profile, uploadedDocumentCategories);
    evaluations.push(evaluation);
  }

  const summary = {
    totalEvaluated: evaluations.length,
    potentiallyEligible: evaluations.filter(e => e.overallResult === 'POTENTIALLY_ELIGIBLE').length,
    needsInformation: evaluations.filter(e => e.overallResult === 'NEEDS_INFORMATION').length,
    notEligible: evaluations.filter(e => e.overallResult === 'NOT_ELIGIBLE').length,
    unverified: evaluations.filter(e => e.overallResult === 'UNVERIFIED').length,
  };

  return {
    evaluationId: `eval_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    evaluatedAt: new Date().toISOString(),
    ruleSetVersion: CURRENT_RULESET_VERSION,
    evaluations,
    summary,
  };
}


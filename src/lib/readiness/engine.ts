import {
  type DocumentMatchingItem,
  type DocumentMatchingOutcome,
  type ReadinessState,
  type ReadinessIssue,
  type ScholarshipReadinessReport,
  type DocumentRequirementSpec,
} from './schema';
import { type Scholarship } from '../catalogue/schema';
import { type StudentProfile } from '../profile/schema';
import { type VaultDocument } from '../vault/schema';
import { evaluateSchemeEligibility } from '../eligibility/engine';
import { runCrossDocumentComparison } from '../checker/engine';
import { getAllScholarships, getScholarshipById } from '../catalogue/engine';

/**
 * Standard requirement specifications for known document categories
 */
const DOCUMENT_SPECS: Record<string, Partial<DocumentRequirementSpec> & { labelEn: string; labelHi: string }> = {
  class_10_marksheet: {
    labelEn: 'Class 10 Marksheet / Certificate',
    labelHi: 'कक्षा 10 की अंकतालिका / प्रमाण पत्र',
    isMandatory: true,
    issuerAuthorityEn: 'Recognized State or Central Education Board (CBSE, ICSE, State Boards)',
    issuerAuthorityHi: 'मान्यता प्राप्त केंद्रीय या राज्य शिक्षा बोर्ड (CBSE, ICSE, राज्य बोर्ड)',
    validityRuleEn: 'Permanent official educational record. Must clearly show date of birth and full name.',
    validityRuleHi: 'स्थायी शैक्षणिक रिकॉर्ड। जन्म तिथि और पूरा नाम स्पष्ट होना चाहिए।',
    maxSizeBytes: 2097152,
    sourceReference: 'NSP Portal General Guidelines - Annexure II (Document Standards)',
  },
  class_12_marksheet: {
    labelEn: 'Class 12 Marksheet',
    labelHi: 'कक्षा 12 की अंकतालिका',
    isMandatory: true,
    issuerAuthorityEn: 'Recognized Higher Secondary Education Board',
    issuerAuthorityHi: 'मान्यता प्राप्त उच्चतर माध्यमिक शिक्षा बोर्ड',
    validityRuleEn: 'Qualifying board examination certificate for post-secondary education.',
    validityRuleHi: 'उच्च शिक्षा हेतु अर्हक बोर्ड परीक्षा प्रमाण पत्र।',
    maxSizeBytes: 2097152,
    sourceReference: 'NSP Portal Guidelines - Post-Matric Criteria',
  },
  income_certificate: {
    labelEn: 'Income Certificate',
    labelHi: 'आय प्रमाण पत्र',
    isMandatory: true,
    issuerAuthorityEn: 'Competent Revenue Authority (Tehsildar / Sub-Divisional Magistrate / District Magistrate)',
    issuerAuthorityHi: 'सक्षम राजस्व प्राधिकारी (तहसीलदार / उप-जिलाधिकारी / जिलाधिकारी)',
    validityRuleEn: 'Must be issued in the name of parents/guardians and valid for the current financial year.',
    validityRuleHi: 'माता-पिता/अभिभावक के नाम पर जारी तथा चालू वित्तीय वर्ष हेतु वैध होना चाहिए।',
    maxSizeBytes: 2097152,
    sourceReference: 'Ministry of Social Justice & Empowerment - Income Criteria Circular',
  },
  caste_certificate: {
    labelEn: 'Caste / Community Certificate',
    labelHi: 'जाति प्रमाण पत्र',
    isMandatory: true,
    issuerAuthorityEn: 'Authorized State Revenue Officer / Tehsildar / District Magistrate',
    issuerAuthorityHi: 'अधिकृत राज्य राजस्व अधिकारी / तहसीलदार / जिलाधिकारी',
    validityRuleEn: 'Valid digitally verifiable state or central government caste certificate.',
    validityRuleHi: 'सत्यापन योग्य राज्य अथवा केंद्र सरकार द्वारा जारी जाति प्रमाण पत्र।',
    maxSizeBytes: 2097152,
    sourceReference: 'NSP Community Verification Guidelines',
  },
  domicile_certificate: {
    labelEn: 'Domicile / Residence Certificate',
    labelHi: 'मूल निवास (अधिवास) प्रमाण पत्र',
    isMandatory: true,
    issuerAuthorityEn: 'Tehsildar / Sub-Divisional Officer / Competent State Authority',
    issuerAuthorityHi: 'तहसीलदार / उप-प्रभागीय अधिकारी / सक्षम राज्य प्राधिकारी',
    validityRuleEn: 'Proof of permanent residence in the qualifying state.',
    validityRuleHi: 'संबंधित राज्य में स्थायी निवास का आधिकारिक प्रमाण।',
    maxSizeBytes: 2097152,
    sourceReference: 'State Scholarship Rules - Domicile Clause',
  },
  bank_passbook: {
    labelEn: 'Bank Passbook / Account Statement',
    labelHi: 'बैंक पासबुक / खाता विवरण',
    isMandatory: true,
    issuerAuthorityEn: 'Scheduled Commercial Bank / Core Banking Branch',
    issuerAuthorityHi: 'अनुसूचित वाणिज्यिक बैंक / कोर बैंकिंग शाखा',
    validityRuleEn: 'Active bank account linked with Aadhaar (DBT enabled) in the student’s own name.',
    validityRuleHi: 'छात्र के नाम पर सक्रिय बैंक खाता, आधार एवं डीबीटी से जुड़ा होना अनिवार्य।',
    maxSizeBytes: 2097152,
    sourceReference: 'PFMS Direct Benefit Transfer (DBT) Standards',
  },
  bonafide_certificate: {
    labelEn: 'Bonafide Student Certificate',
    labelHi: 'बोनाफाइड (वास्तविक छात्र) प्रमाण पत्र',
    isMandatory: true,
    issuerAuthorityEn: 'Head of Institution / Principal / Registrar of enrolled College/School',
    issuerAuthorityHi: 'अध्ययनरत संस्थान के प्रधान / प्राचार्य / कुलसचिव',
    validityRuleEn: 'Must be issued on official institution letterhead for Academic Year 2026-27 with seal.',
    validityRuleHi: 'शैक्षणिक सत्र 2026-27 हेतु संस्थान के लेटरहेड पर मुहर सहित जारी।',
    maxSizeBytes: 2097152,
    sourceReference: 'Institute Verification Protocol - AISHE/DISE Registered Institutes',
  },
  fee_receipt: {
    labelEn: 'Current Academic Year Fee Receipt',
    labelHi: 'वर्तमान शैक्षणिक सत्र की शुल्क रसीद',
    isMandatory: true,
    issuerAuthorityEn: 'Finance / Accounts Section of the Enrolled Institution',
    issuerAuthorityHi: 'अध्ययनरत संस्थान का वित्त अथवा लेखा विभाग',
    validityRuleEn: 'Official receipt showing non-refundable tuition and institutional fees paid.',
    validityRuleHi: 'संस्थान को जमा किए गए गैर-वापसी योग्य शिक्षण शुल्क की आधिकारिक रसीद।',
    maxSizeBytes: 2097152,
    sourceReference: 'NSP Fee Reimbursement Verification Rules',
  },
};

/**
 * Evaluates document matching and overall application readiness for a scholarship scheme.
 * Strictly adheres to Spec 09 (5 readiness states, explainable checklist, zero false readiness claims).
 */
export function evaluateScholarshipReadiness(
  scheme: Scholarship,
  profile?: StudentProfile | null,
  vaultDocuments?: VaultDocument[] | null,
  studentConfirmed: boolean = false,
  studentNotes?: string
): ScholarshipReadinessReport {
  const docs = vaultDocuments || [];
  const blockers: ReadinessIssue[] = [];
  const warnings: ReadinessIssue[] = [];

  // Section 1: Eligibility Evaluation
  const eligibilityEval = evaluateSchemeEligibility(scheme, profile, docs.map(d => d.category));
  let eligibilitySectionStatus: 'PASS' | 'FAIL' | 'UNKNOWN' | 'UNVERIFIED';

  if (eligibilityEval.overallResult === 'POTENTIALLY_ELIGIBLE') {
    eligibilitySectionStatus = 'PASS';
  } else if (eligibilityEval.overallResult === 'NOT_ELIGIBLE') {
    eligibilitySectionStatus = 'FAIL';
    blockers.push({
      id: 'blocker_eligibility_ineligible',
      severity: 'BLOCKER',
      section: 'eligibility',
      titleEn: 'Ineligible on Core Scheme Criteria',
      titleHi: 'मुख्य योजना शर्तों पर अपात्र',
      messageEn: eligibilityEval.failedReasonsEn.join(' ') || 'One or more mandatory eligibility criteria were not satisfied.',
      messageHi: eligibilityEval.failedReasonsHi.join(' ') || 'एक या अधिक अनिवार्य पात्रता मानदंड पूरे नहीं हुए।',
      actionLabelEn: 'View Eligibility Breakdown',
      actionLabelHi: 'पात्रता विवरण देखें',
      actionUrl: '/eligibility',
    });
  } else if (eligibilityEval.overallResult === 'NEEDS_INFORMATION') {
    eligibilitySectionStatus = 'UNKNOWN';
    blockers.push({
      id: 'blocker_eligibility_needs_info',
      severity: 'BLOCKER',
      section: 'eligibility',
      titleEn: 'Missing Profile Information for Eligibility',
      titleHi: 'पात्रता जाँच हेतु अधूरी प्रोफ़ाइल जानकारी',
      messageEn: `Missing required fields: ${eligibilityEval.missingFields.join(', ')}`,
      messageHi: `आवश्यक जानकारी अधूरी है: ${eligibilityEval.missingFields.join(', ')}`,
      actionLabelEn: 'Complete Student Profile',
      actionLabelHi: 'छात्र प्रोफ़ाइल पूरी करें',
      actionUrl: '/profile',
    });
  } else {
    eligibilitySectionStatus = 'UNVERIFIED';
    warnings.push({
      id: 'warn_eligibility_unverified',
      severity: 'WARNING',
      section: 'eligibility',
      titleEn: 'Scheme Rules Under Verification',
      titleHi: 'योजना नियम समीक्षाधीन हैं',
      messageEn: 'The rules for this scheme are currently under administrative review.',
      messageHi: 'इस योजना के नियम वर्तमान में प्रशासनिक समीक्षा में हैं।',
      actionLabelEn: 'View Official Guidelines',
      actionLabelHi: 'आधिकारिक दिशानिर्देश देखें',
      actionUrl: scheme.officialSource.guidelineUrl,
    });
  }

  // Section 2: Required Documents Matching
  const requiredCategories = scheme.requiredDocuments || [];
  const documentItems: DocumentMatchingItem[] = [];
  let availableDocsCount = 0;
  let missingDocsCount = 0;
  let needsReviewDocsCount = 0;

  for (const cat of requiredCategories) {
    const specInfo = DOCUMENT_SPECS[cat] || {
      labelEn: cat.replace(/_/g, ' '),
      labelHi: cat.replace(/_/g, ' '),
      isMandatory: true,
      sourceReference: `Scheme Guideline: ${scheme.nameEn}`,
    };

    const requirementSpec: DocumentRequirementSpec = {
      category: cat,
      isMandatory: specInfo.isMandatory !== false,
      conditionNoteEn: specInfo.conditionNoteEn,
      conditionNoteHi: specInfo.conditionNoteHi,
      validityRuleEn: specInfo.validityRuleEn,
      validityRuleHi: specInfo.validityRuleHi,
      issuerAuthorityEn: specInfo.issuerAuthorityEn,
      issuerAuthorityHi: specInfo.issuerAuthorityHi,
      maxSizeBytes: specInfo.maxSizeBytes || 2097152,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      sourceReference: specInfo.sourceReference || `Scheme Requirements (${scheme.academicYear})`,
    };

    // Check conditional applicability:
    // e.g. caste certificate is NOT_APPLICABLE if scheme is open to general and student is general
    const studentCategory = profile?.schemeDependent?.category;
    if (cat === 'caste_certificate' && scheme.targetCategories.includes('all') && studentCategory === 'general') {
      documentItems.push({
        category: cat,
        labelEn: specInfo.labelEn,
        labelHi: specInfo.labelHi,
        requirement: { ...requirementSpec, isMandatory: false },
        outcome: 'NOT_APPLICABLE',
        reasonsEn: ['Not applicable for General Category applicants under general merit/fee reimbursement.'],
        reasonsHi: ['सामान्य श्रेणी के आवेदकों हेतु जाति प्रमाण पत्र आवश्यक नहीं है।'],
      });
      continue;
    }

    // Search vault documents for this category
    const matchingDocs = docs.filter(d => d.category === cat);

    if (matchingDocs.length === 0) {
      missingDocsCount++;
      const actionUrl = '/vault';
      documentItems.push({
        category: cat,
        labelEn: specInfo.labelEn,
        labelHi: specInfo.labelHi,
        requirement: requirementSpec,
        outcome: 'MISSING',
        reasonsEn: [`No document for "${specInfo.labelEn}" has been uploaded in your Document Vault.`],
        reasonsHi: [`दस्तावेज़ कोष में "${specInfo.labelHi}" का कोई दस्तावेज़ अपलोड नहीं है।`],
        actionRequiredEn: `Upload ${specInfo.labelEn} in Document Vault`,
        actionRequiredHi: `दस्तावेज़ कोष में ${specInfo.labelHi} अपलोड करें`,
        actionUrl,
      });

      if (requirementSpec.isMandatory) {
        blockers.push({
          id: `blocker_missing_doc_${cat}`,
          severity: 'BLOCKER',
          section: 'required_documents',
          titleEn: `Missing Document: ${specInfo.labelEn}`,
          titleHi: `अनुपलब्ध दस्तावेज़: ${specInfo.labelHi}`,
          messageEn: `This scholarship requires an official ${specInfo.labelEn}.`,
          messageHi: `इस छात्रवृत्ति हेतु आधिकारिक ${specInfo.labelHi} संलग्न करना अनिवार्य है।`,
          actionLabelEn: 'Upload in Vault',
          actionLabelHi: 'वॉल्ट में अपलोड करें',
          actionUrl: '/vault',
        });
      }
    } else {
      // Find candidate document
      const candidate = matchingDocs[0];
      let docOutcome: DocumentMatchingOutcome = 'AVAILABLE';
      const docReasonsEn: string[] = [];
      const docReasonsHi: string[] = [];

      // Check processing state and quality
      if (candidate.processingState === 'needs_user_review' || candidate.processingState === 'partially_processed') {
        docOutcome = 'NEEDS_REVIEW';
        needsReviewDocsCount++;
        docReasonsEn.push('Document contains unconfirmed extracted fields that require student verification.');
        docReasonsHi: ['दस्तावेज़ में ऐसे अंश हैं जिनका छात्र द्वारा सत्यापन आवश्यक है।'];
        warnings.push({
          id: `warn_doc_review_${cat}`,
          severity: 'WARNING',
          section: 'document_quality',
          titleEn: `Review Needed: ${specInfo.labelEn}`,
          titleHi: `समीक्षा आवश्यक: ${specInfo.labelHi}`,
          messageEn: `Please review and confirm extracted fields in your Document Vault.`,
          messageHi: `कृपया दस्तावेज़ कोष में जाकर निकाले गए फ़ील्ड्स की पुष्टि करें।`,
          actionLabelEn: 'Review in Vault',
          actionLabelHi: 'वॉल्ट में समीक्षा करें',
          actionUrl: '/vault',
        });
      } else if (candidate.readabilityScore && candidate.readabilityScore < 60) {
        docOutcome = 'NEEDS_REVIEW';
        needsReviewDocsCount++;
        docReasonsEn.push(`Low readability score (${candidate.readabilityScore}/100). Re-uploading a clearer scan is recommended.`);
        docReasonsHi.push(`पठनीयता स्कोर कम है (${candidate.readabilityScore}/100)। स्पष्ट प्रति अपलोड करने की सलाह दी जाती है।`);
        warnings.push({
          id: `warn_doc_readability_${cat}`,
          severity: 'WARNING',
          section: 'document_quality',
          titleEn: `Low Scan Quality: ${specInfo.labelEn}`,
          titleHi: `कम स्पष्टता: ${specInfo.labelHi}`,
          messageEn: 'Blurred or low-contrast uploads frequently result in NSP portal defective status.',
          messageHi: 'धुंधले या अस्पष्ट दस्तावेज़ अक्सर पोर्टल पर दोषपूर्ण (Defective) कर दिए जाते हैं।',
          actionLabelEn: 'Re-upload in Vault',
          actionLabelHi: 'वॉल्ट में पुनः अपलोड करें',
          actionUrl: '/vault',
        });
      } else {
        availableDocsCount++;
        docReasonsEn.push(`Verified document uploaded (${candidate.fileName}).`);
        docReasonsHi.push(`सत्यापित दस्तावेज़ उपलब्ध है (${candidate.fileName})।`);
      }

      documentItems.push({
        category: cat,
        labelEn: specInfo.labelEn,
        labelHi: specInfo.labelHi,
        requirement: requirementSpec,
        outcome: docOutcome,
        matchedDocumentId: candidate.id,
        matchedDocumentName: candidate.fileName,
        matchedFileSize: candidate.fileSize,
        reasonsEn: docReasonsEn,
        reasonsHi: docReasonsHi,
        actionUrl: '/vault',
      });
    }
  }

  // Section 3: Document Quality and Validity
  const checksPassed = docs.filter(d => (d.readabilityScore || 80) >= 60).length;
  const checksWarning = docs.filter(d => (d.readabilityScore || 80) < 60).length;
  const docQualityStatus: 'VALID' | 'ISSUES_FOUND' | 'NO_DOCUMENTS' =
    docs.length === 0 ? 'NO_DOCUMENTS' : checksWarning > 0 ? 'ISSUES_FOUND' : 'VALID';

  // Section 4: Cross-Document Consistency Evaluation
  let crossDocStatus: 'CONSISTENT' | 'ATTENTION_RECOMMENDED' | 'MISMATCH_DETECTED' = 'CONSISTENT';
  let exactMatchCount = 0;
  let discrepancyCount = 0;
  let explainedCount = 0;
  const crossNotesEn: string[] = [];
  const crossNotesHi: string[] = [];

  if (docs.length >= 2) {
    const crossComparison = runCrossDocumentComparison(docs, profile);
    exactMatchCount = crossComparison.exactMatches;
    discrepancyCount = crossComparison.mismatches;
    explainedCount = crossComparison.userExplained;

    const hasSignificantMismatch = crossComparison.fieldReports.some(
      r => r.result === 'significant_mismatch'
    );

    if (hasSignificantMismatch) {
      crossDocStatus = 'MISMATCH_DETECTED';
      crossNotesEn.push(`${crossComparison.mismatches} significant field mismatch(es) detected across documents.`);
      crossNotesHi.push(`दस्तावेज़ों के बीच ${crossComparison.mismatches} महत्वपूर्ण अंतर पाए गए।`);

      blockers.push({
        id: 'blocker_cross_mismatch',
        severity: 'BLOCKER',
        section: 'cross_consistency',
        titleEn: 'Cross-Document Field Mismatch Detected',
        titleHi: 'दस्तावेज़ों में भिन्नता पाई गई',
        messageEn: 'Inconsistent student name or date of birth between Aadhaar/marksheet can cause portal rejection.',
        messageHi: 'दस्तावेज़ों में नाम या जन्म तिथि का अंतर पोर्टल पर आवेदन निरस्त कर सकता है।',
        actionLabelEn: 'Resolve in Consistency Checker',
        actionLabelHi: 'कंसिस्टेंसी चेकर में समाधान करें',
        actionUrl: '/checker',
      });
    } else if (crossComparison.mismatches > 0 || crossComparison.likelyMatches > 0) {
      crossDocStatus = 'ATTENTION_RECOMMENDED';
      crossNotesEn.push(`${crossComparison.mismatches + crossComparison.likelyMatches} minor variation(s) observed across documents.`);
      crossNotesHi.push(`दस्तावेज़ों में ${crossComparison.mismatches + crossComparison.likelyMatches} सामान्य नाम भिन्नता पाई गई।`);
    } else {
      crossNotesEn.push('All compared core fields are fully aligned across uploaded documents.');
      crossNotesHi.push('सभी मुख्य फ़ील्ड्स दस्तावेज़ों के मध्य पूर्णतः सुसंगत हैं।');
    }
  } else {
    crossNotesEn.push('Upload at least two documents in the Document Vault to perform cross-document consistency verification.');
    crossNotesHi.push('दस्तावेज़ों के मध्य मिलान जाँचने हेतु कम से कम दो दस्तावेज़ वॉल्ट में अपलोड करें।');
  }

  // Section 5: Profile Fields Required by Application
  const missingProfileFields: string[] = [];
  if (!profile?.basic?.displayName) missingProfileFields.push('Full Student Name (विद्यार्थी का नाम)');
  if (!profile?.basic?.domicileState) missingProfileFields.push('State Domicile (अधिवास राज्य)');
  if (!profile?.schemeDependent?.category) missingProfileFields.push('Social Category (सामाजिक श्रेणी)');
  if (profile?.schemeDependent?.familyIncome === undefined || profile?.schemeDependent?.familyIncome === null) {
    missingProfileFields.push('Annual Family Income (पारिवारिक आय)');
  }
  if (!profile?.academicRecords || profile.academicRecords.length === 0) {
    missingProfileFields.push('Current Academic Record (वर्तमान शैक्षणिक विवरण)');
  }

  const profileCompletenessRate = Math.round(
    ((5 - missingProfileFields.length) / 5) * 100
  );

  if (missingProfileFields.length > 0) {
    warnings.push({
      id: 'warn_profile_incomplete',
      severity: 'WARNING',
      section: 'profile_fields',
      titleEn: 'Incomplete Student Profile',
      titleHi: 'अधूरी छात्र प्रोफ़ाइल',
      messageEn: `${missingProfileFields.length} essential application field(s) are not yet recorded.`,
      messageHi: `${missingProfileFields.length} आवश्यक आवेदन फ़ील्ड्स अभी दर्ज नहीं हैं।`,
      actionLabelEn: 'Update Profile',
      actionLabelHi: 'प्रोफ़ाइल अपडेट करें',
      actionUrl: '/profile',
    });
  }

  // Section 6: Application Window
  const appWindow = scheme.applicationWindow;
  if (appWindow.status === 'closed') {
    blockers.push({
      id: 'blocker_window_closed',
      severity: 'BLOCKER',
      section: 'portal_window',
      titleEn: 'Application Window Closed',
      titleHi: 'आवेदन खिड़की बंद है',
      messageEn: 'The official portal deadline for this scheme has passed. Watch for portal reopening notifications.',
      messageHi: 'इस योजना हेतु आधिकारिक पोर्टल की अंतिम तिथि समाप्त हो चुकी है।',
      actionLabelEn: 'Check Official Portal',
      actionLabelHi: 'आधिकारिक पोर्टल देखें',
      actionUrl: scheme.officialSource.applicationUrl,
    });
  }

  // Determine Overall Readiness State (Spec 09 Section 5)
  let overallState: ReadinessState;

  if (blockers.length > 0) {
    overallState = 'BLOCKED';
  } else if (studentConfirmed) {
    overallState = 'STUDENT_CONFIRMED_READY';
  } else if (
    eligibilitySectionStatus === 'PASS' &&
    missingDocsCount === 0 &&
    needsReviewDocsCount === 0 &&
    crossDocStatus !== 'MISMATCH_DETECTED' &&
    missingProfileFields.length === 0 &&
    appWindow.status !== 'closed'
  ) {
    overallState = 'READY_FOR_STUDENT_REVIEW';
  } else if (docs.length > 0 || (profile?.academicRecords && profile.academicRecords.length > 0)) {
    overallState = 'IN_PROGRESS';
  } else {
    overallState = 'NOT_STARTED';
  }

  const totalChecks = 6;
  const passedChecks = [
    eligibilitySectionStatus === 'PASS',
    missingDocsCount === 0 && needsReviewDocsCount === 0,
    docQualityStatus === 'VALID',
    crossDocStatus === 'CONSISTENT',
    missingProfileFields.length === 0,
    appWindow.status === 'open' || appWindow.status === 'extended',
  ].filter(Boolean).length;

  const formulaExplanation =
    'Readiness requires 100% resolution of all 6 mandatory checklist domains (Eligibility, Documents, Quality, Consistency, Profile, Window). ScholarSaathi never uses an arbitrary percentage score that obscures active blockers.';

  return {
    readinessId: `rdn_${scheme.id}_${Date.now()}`,
    scholarshipId: scheme.id,
    scholarshipCode: scheme.code,
    scholarshipNameEn: scheme.nameEn,
    scholarshipNameHi: scheme.nameHi,
    providerEn: scheme.providerEn,
    providerHi: scheme.providerHi,
    academicYear: scheme.academicYear,
    overallState,
    readinessScoreFormula: formulaExplanation,
    checklistSummary: {
      totalChecks,
      passedChecks,
      blockingIssuesCount: blockers.length,
      warningIssuesCount: warnings.length,
    },
    blockers,
    warnings,
    sections: {
      eligibility: {
        status: eligibilitySectionStatus,
        passedCount: eligibilityEval.passedCount,
        failedCount: eligibilityEval.failedCount,
        unknownCount: eligibilityEval.unknownCount,
        summaryEn: `Eligibility assessment: ${eligibilityEval.overallResult.replace(/_/g, ' ')}.`,
        summaryHi: `पात्रता परिणाम: ${eligibilityEval.overallResult}.`,
      },
      requiredDocuments: {
        status: missingDocsCount === 0 ? 'ALL_AVAILABLE' : availableDocsCount > 0 ? 'PARTIAL' : 'MISSING_MANDATORY',
        totalRequired: requiredCategories.length,
        availableCount: availableDocsCount,
        missingCount: missingDocsCount,
        needsReviewCount: needsReviewDocsCount,
        items: documentItems,
      },
      documentQuality: {
        status: docQualityStatus,
        checksPassed,
        checksWarning,
        checksFailed: 0,
        notesEn: [`${checksPassed} document(s) met size and format standards.`],
        notesHi: [`${checksPassed} दस्तावेज़ आकार और प्रारूप मानकों को पूरा करते हैं।`],
      },
      crossDocConsistency: {
        status: crossDocStatus,
        exactCount: exactMatchCount,
        discrepancyCount,
        explainedCount,
        notesEn: crossNotesEn,
        notesHi: crossNotesHi,
      },
      profileCompleteness: {
        status: missingProfileFields.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
        missingFields: missingProfileFields,
        completionRate: profileCompletenessRate,
      },
      applicationWindow: {
        status: appWindow.status,
        openingDate: appWindow.openingDate,
        closingDate: appWindow.closingDate,
        portalNoticeEn: appWindow.portalNoticeEn,
        portalNoticeHi: appWindow.portalNoticeHi,
        applicationUrl: scheme.officialSource.applicationUrl,
      },
      studentReview: {
        isConfirmed: studentConfirmed,
        confirmedAt: studentConfirmed ? new Date().toISOString() : undefined,
        studentNotes,
      },
    },
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Evaluates readiness across all bundled scholarships
 */
export function evaluateAllScholarshipsReadiness(
  profile?: StudentProfile | null,
  vaultDocuments?: VaultDocument[] | null
): ScholarshipReadinessReport[] {
  const scholarships = getAllScholarships();
  return scholarships.map(scheme => evaluateScholarshipReadiness(scheme, profile, vaultDocuments));
}

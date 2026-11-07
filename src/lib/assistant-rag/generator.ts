import {
  type AssistantResponse,
  type SuggestedAction,
  AssistantResponseSchema,
} from './schema';
import { type RetrievalResult } from './retriever';
import { validateAssistantOutput } from './safety';

const DEFAULT_DISCLAIMER_EN =
  'ScholarSaathi is an independent assistant. Guidance is based on reviewed official circulars; official portal officers decide your application. Check deadlines on the portal as dates fluctuate.';
const DEFAULT_DISCLAIMER_HI =
  'स्कॉलर साथी एक स्वतंत्र सहायक है। यह मार्गदर्शन सत्यापित आधिकारिक परिपत्रों पर आधारित है; अंतिम निर्णय आधिकारिक अधिकारी करते हैं। पोर्टल पर तिथियों की पुष्टि अवश्य करें।';

function getSuggestedActionsForCategory(category?: string): SuggestedAction[] {
  switch (category) {
    case 'income_limit':
    case 'eligibility':
      return [
        { labelEn: 'Check My Eligibility', labelHi: 'मेरी पात्रता जाँचें', href: '/eligibility', actionType: 'internal_link' },
        { labelEn: 'Browse Verified Scholarships', labelHi: 'छात्रवृत्तियां देखें', href: '/discovery', actionType: 'internal_link' },
      ];
    case 'documents':
      return [
        { labelEn: 'Open Document Vault', labelHi: 'दस्तावेज़ कोष खोलें', href: '/vault', actionType: 'internal_link' },
        { labelEn: 'Check Document Consistency', labelHi: 'दस्तावेज़ सुसंगतता जाँचें', href: '/checker', actionType: 'internal_link' },
      ];
    case 'defective_remedy':
    case 'rejection_reason':
      return [
        { labelEn: 'Decode Portal Remark', labelHi: 'पोर्टल टिप्पणी डिकोड करें', href: '/decode/paste', actionType: 'internal_link' },
        { labelEn: 'Track in Application Timeline', labelHi: 'टाइमलाइन में ट्रैक करें', href: '/tracker', actionType: 'internal_link' },
      ];
    case 'payment_dbt':
    case 'grievance_route':
      return [
        { labelEn: 'Application Status & Grievance', labelHi: 'आवेदन स्थिति एवं शिकायत', href: '/tracker', actionType: 'internal_link' },
        { labelEn: 'Official CPGRAMS Portal', labelHi: 'आधिकारिक CPGRAMS पोर्टल', href: 'https://pgportal.gov.in', actionType: 'external_portal' },
      ];
    default:
      return [
        { labelEn: 'Discover Scholarships', labelHi: 'छात्रवृत्तियां खोजें', href: '/discovery', actionType: 'internal_link' },
        { labelEn: 'Official NSP Portal', labelHi: 'आधिकारिक एनएसपी पोर्टल', href: 'https://scholarships.gov.in', actionType: 'external_portal' },
      ];
  }
}

/**
 * Deterministically synthesizes an evidence-grounded response from retrieved verified chunks.
 * Spec 13 Section 4: Pure source-grounded answers with citations and uncertainty indicators.
 */
export function generateGroundedResponse(
  retrieval: RetrievalResult,
  language: 'en' | 'hi' = 'en'
): AssistantResponse {
  const id = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // 1. Insufficient Evidence Case
  if (retrieval.insufficientEvidence || retrieval.chunks.length === 0) {
    return {
      id,
      answerEn:
        'Evidence is insufficient in our reviewed scholarship library to answer this query with complete certainty. To ensure you receive accurate and up-to-date guidance, please check the official guidelines directly on the National Scholarship Portal (scholarships.gov.in).',
      answerHi:
        'हमारी सत्यापित छात्रवृत्ति लाइब्रेरी में इस प्रश्न का पूर्ण निश्चितता के साथ उत्तर देने हेतु पर्याप्त साक्ष्य उपलब्ध नहीं हैं। सटीक एवं अद्यतन जानकारी के लिए कृपया सीधे राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in) पर आधिकारिक दिशा-निर्देश देखें।',
      citations: [],
      confidence: retrieval.topScore,
      insufficientEvidence: true,
      suggestedActions: [
        { labelEn: 'Discover Verified Schemes', labelHi: 'सत्यापित योजनाएं देखें', href: '/discovery', actionType: 'internal_link' },
        { labelEn: 'Official NSP Portal', labelHi: 'आधिकारिक एनएसपी पोर्टल', href: 'https://scholarships.gov.in', actionType: 'external_portal' },
      ],
      disclaimerEn: DEFAULT_DISCLAIMER_EN,
      disclaimerHi: DEFAULT_DISCLAIMER_HI,
    };
  }

  // 2. Extract top matching chunk and category
  const top = retrieval.chunks[0];
  const chunk = top.chunk;
  const category = chunk.category;

  // Synthesize grounded answer
  const answerEn = `${chunk.contentEn}\n\nSource: ${chunk.sourceTitle} (${chunk.sectionLocator}).`;
  const answerHi = `${chunk.contentHi}\n\nस्रोत: ${chunk.sourceTitle} (${chunk.sectionLocator})।`;

  // Validate output against forbidden phrases
  const isCleanEn = validateAssistantOutput(answerEn);
  const isCleanHi = validateAssistantOutput(answerHi);

  if (!isCleanEn || !isCleanHi) {
    return {
      id,
      answerEn:
        'Guidance is available on the official portal. Please consult the verified guidelines at scholarships.gov.in.',
      answerHi:
        'मार्गदर्शन आधिकारिक पोर्टल पर उपलब्ध है। कृपया scholarships.gov.in पर सत्यापित दिशा-निर्देश देखें।',
      citations: retrieval.citations,
      confidence: top.score,
      insufficientEvidence: false,
      matchedCategory: category,
      suggestedActions: getSuggestedActionsForCategory(category),
      disclaimerEn: DEFAULT_DISCLAIMER_EN,
      disclaimerHi: DEFAULT_DISCLAIMER_HI,
    };
  }

  const response: AssistantResponse = {
    id,
    answerEn,
    answerHi,
    citations: retrieval.citations,
    confidence: top.score,
    insufficientEvidence: false,
    matchedCategory: category,
    suggestedActions: getSuggestedActionsForCategory(category),
    disclaimerEn: DEFAULT_DISCLAIMER_EN,
    disclaimerHi: DEFAULT_DISCLAIMER_HI,
  };

  return response;
}


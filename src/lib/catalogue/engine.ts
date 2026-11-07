import {
  type Scholarship,
  type CatalogueFilter,
  ScholarshipSchema,
} from './schema';
import { type StudentProfile } from '../profile/schema';
import rawScholarshipsData from '../../../data/scholarships.json' with { type: 'json' };

export const CATALOGUE_COVERAGE_STATEMENT = {
  en: 'Selected verified Central (NSP) and Uttar Pradesh State schemes for Academic Year 2026-27.',
  hi: 'शैक्षणिक सत्र 2026-27 हेतु चयनित सत्यापित केंद्रीय (NSP) एवं उत्तर प्रदेश राज्य छात्रवृत्ति योजनाएँ।',
};

let cachedScholarships: Scholarship[] | null = null;

/**
 * Loads and validates all bundled scholarship entries from data/scholarships.json
 */
export function getAllScholarships(): Scholarship[] {
  if (cachedScholarships) {
    return cachedScholarships;
  }

  try {
    if (!Array.isArray(rawScholarshipsData)) {
      return [];
    }

    const validated: Scholarship[] = [];
    for (const item of rawScholarshipsData) {
      const parsed = ScholarshipSchema.safeParse(item);
      if (parsed.success) {
        validated.push(parsed.data);
      } else {
        console.warn(`[Scholarship Catalogue] Entry failed validation: ${item.id}`, parsed.error.issues);
      }
    }

    cachedScholarships = validated;
    return cachedScholarships;
  } catch (err) {
    console.error('[Scholarship Catalogue] Failed to load scholarships data', err);
    return [];
  }
}

/**
 * Retrieves a single scholarship by its unique ID
 */
export function getScholarshipById(id: string): Scholarship | null {
  const all = getAllScholarships();
  return all.find(s => s.id === id) || null;
}

/**
 * Filters the scholarship catalogue according to student criteria and query terms.
 */
export function filterScholarships(filters: CatalogueFilter): Scholarship[] {
  const all = getAllScholarships();

  return all.filter(scheme => {
    // 1. State Filter: 'All India' matches all states; specific state matches only that state
    if (filters.state && filters.state.trim() !== '') {
      const targetState = filters.state.trim().toLowerCase();
      const schemeState = scheme.state.trim().toLowerCase();
      if (schemeState !== 'all india' && schemeState !== targetState) {
        return false;
      }
    }

    // 2. Education Level Filter
    if (filters.educationLevel) {
      const matchesLevel =
        scheme.targetEducationLevels.includes('all') ||
        scheme.targetEducationLevels.includes(filters.educationLevel);
      if (!matchesLevel) {
        return false;
      }
    }

    // 3. Category Filter
    if (filters.category) {
      const matchesCategory =
        scheme.targetCategories.includes('all') ||
        scheme.targetCategories.includes(filters.category);
      if (!matchesCategory) {
        return false;
      }
    }

    // 4. Maximum Income Filter: scheme's income limit must be >= student's family income
    if (filters.maxIncome !== undefined && filters.maxIncome !== null) {
      if (scheme.maxAnnualIncome !== undefined && filters.maxIncome > scheme.maxAnnualIncome) {
        return false;
      }
    }

    // 5. Application Status Filter
    if (filters.status) {
      if (scheme.applicationWindow.status !== filters.status) {
        return false;
      }
    }

    // 6. Provider Type Filter
    if (filters.providerType) {
      if (scheme.providerType !== filters.providerType) {
        return false;
      }
    }

    // 7. Keyword Query Search
    if (filters.q && filters.q.trim() !== '') {
      const query = filters.q.trim().toLowerCase();
      const searchHaystack = [
        scheme.nameEn,
        scheme.nameHi,
        scheme.code,
        scheme.providerEn,
        scheme.providerHi,
        scheme.descriptionEn,
        scheme.descriptionHi,
        ...scheme.aliases,
        ...scheme.targetCourses,
      ]
        .join(' ')
        .toLowerCase();

      if (!searchHaystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export interface SchemeMatchRelevance {
  isRelevant: boolean;
  score: number; // 0 to 100
  matchReasonsEn: string[];
  matchReasonsHi: string[];
  missingCriteriaEn: string[];
  missingCriteriaHi: string[];
}

/**
 * Calculates relevance of a scholarship for a given student profile.
 * 
 * IMPORTANT (Rule P2): Explains relevance factors; never predicts guaranteed eligibility or approval.
 */
export function calculateSchemeMatchRelevance(
  scheme: Scholarship,
  profile?: StudentProfile | null
): SchemeMatchRelevance {
  if (!profile) {
    return {
      isRelevant: true,
      score: 50,
      matchReasonsEn: ['General open scholarship in active catalogue.'],
      matchReasonsHi: ['सक्रिय कैटलॉग में सामान्य उपलब्ध छात्रवृत्ति।'],
      missingCriteriaEn: [],
      missingCriteriaHi: [],
    };
  }

  const matchReasonsEn: string[] = [];
  const matchReasonsHi: string[] = [];
  const missingCriteriaEn: string[] = [];
  const missingCriteriaHi: string[] = [];
  let score = 0;

  // 1. State Domicile
  if (profile.basic.domicileState) {
    const studentState = profile.basic.domicileState.toLowerCase();
    const schemeState = scheme.state.toLowerCase();
    if (schemeState === 'all india' || schemeState === studentState) {
      score += 30;
      matchReasonsEn.push(`Matches your domicile state (${profile.basic.domicileState}).`);
      matchReasonsHi.push(`आपके अधिवास राज्य (${profile.basic.domicileState}) के अनुकूल है।`);
    } else {
      missingCriteriaEn.push(`Restricted to residents of ${scheme.state}.`);
      missingCriteriaHi.push(`यह योजना केवल ${scheme.state} के निवासियों के लिए है।`);
    }
  }

  // 2. Category
  if (profile.schemeDependent?.category) {
    const cat = profile.schemeDependent.category;
    if (scheme.targetCategories.includes('all') || scheme.targetCategories.includes(cat as any)) {
      score += 25;
      matchReasonsEn.push(`Eligible for your category (${cat.toUpperCase()}).`);
      matchReasonsHi.push(`आपके वर्ग (${cat.toUpperCase()}) के लिए मान्य है।`);
    } else {
      missingCriteriaEn.push(`Restricted to ${scheme.targetCategories.join(', ').toUpperCase()} categories.`);
      missingCriteriaHi.push(`यह योजना ${scheme.targetCategories.join(', ').toUpperCase()} वर्ग के लिए है।`);
    }
  }

  // 3. Family Income
  if (profile.schemeDependent?.familyIncome !== undefined && scheme.maxAnnualIncome !== undefined) {
    if (profile.schemeDependent.familyIncome <= scheme.maxAnnualIncome) {
      score += 25;
      matchReasonsEn.push(`Within income ceiling (₹${scheme.maxAnnualIncome.toLocaleString('en-IN')}/year).`);
      matchReasonsHi.push(`पारिवारिक आय सीमा (₹${scheme.maxAnnualIncome.toLocaleString('en-IN')}/वर्ष) के अंतर्गत है।`);
    } else {
      missingCriteriaEn.push(`Family income exceeds ceiling of ₹${scheme.maxAnnualIncome.toLocaleString('en-IN')}.`);
      missingCriteriaHi.push(`पारिवारिक आय सीमा ₹${scheme.maxAnnualIncome.toLocaleString('en-IN')} से अधिक है।`);
    }
  }

  // 4. Academic level presence
  if (profile.academicRecords && profile.academicRecords.length > 0) {
    score += 20;
    matchReasonsEn.push('Academic records recorded in profile.');
    matchReasonsHi.push('शैक्षणिक रिकॉर्ड प्रोफ़ाइल में दर्ज हैं।');
  }

  return {
    isRelevant: score >= 40,
    score: Math.min(100, Math.max(10, score)),
    matchReasonsEn,
    matchReasonsHi,
    missingCriteriaEn,
    missingCriteriaHi,
  };
}

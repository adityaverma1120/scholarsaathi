import assert from 'node:assert';
import {
  getAllScholarships,
  getScholarshipById,
  filterScholarships,
  calculateSchemeMatchRelevance,
  CATALOGUE_COVERAGE_STATEMENT,
} from '../../src/lib/catalogue/engine.ts';
import { ScholarshipSchema } from '../../src/lib/catalogue/schema.ts';

console.log('🧪 Testing Verified Scholarship Catalogue & Discovery (Phase 5)...');

// 1. Catalogue Loading & Zod Schema Validation
console.log('  Testing Catalogue Loading & Schema Integrity...');
{
  const scholarships = getAllScholarships();
  assert.ok(scholarships.length >= 6, `Expected at least 6 verified schemes, got ${scholarships.length}`);

  for (const s of scholarships) {
    const parsed = ScholarshipSchema.safeParse(s);
    assert.strictEqual(parsed.success, true, `Scheme ${s.id} failed schema validation: ${JSON.stringify(parsed.error?.issues)}`);

    // Invariant: Official .gov.in URL
    assert.ok(
      s.officialSource.applicationUrl.includes('.gov.in') || s.officialSource.applicationUrl.includes('scholarships.gov.in'),
      `Scheme ${s.id} must point to an official government portal`
    );

    // Invariant: Academic Year 2026-27 awareness
    assert.strictEqual(s.academicYear, '2026-27', `Scheme ${s.id} must be for academic year 2026-27`);

    // Invariant: At least 2 reviewers
    assert.ok(
      s.officialSource.verifiedBy.length >= 2,
      `Scheme ${s.id} must have at least 2 verified reviewers`
    );

    // Invariant: Portal deadline notice (Rule P8)
    assert.ok(
      s.applicationWindow.portalNoticeEn.includes('portal'),
      `Scheme ${s.id} must feature portal deadline warning`
    );
  }
}

// 2. Coverage Statement (Spec 07 Section 7)
console.log('  Testing Coverage Statement...');
{
  assert.ok(CATALOGUE_COVERAGE_STATEMENT.en.includes('2026-27'));
  assert.ok(CATALOGUE_COVERAGE_STATEMENT.hi.includes('2026-27'));
}

// 3. Retrieval by ID
console.log('  Testing getScholarshipById...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme !== null);
  assert.strictEqual(scScheme?.code, 'NSP-PMSC-01');
  assert.strictEqual(scScheme?.providerType, 'central_government');

  const upScheme = getScholarshipById('up_post_matric_dashmottar');
  assert.ok(upScheme !== null);
  assert.strictEqual(upScheme?.state, 'Uttar Pradesh');

  const nonExistent = getScholarshipById('non_existent_fake_id');
  assert.strictEqual(nonExistent, null);
}

// 4. State & Geography Filtering
console.log('  Testing State Geography Filtering...');
{
  // Uttar Pradesh domicile student sees All-India schemes + UP schemes
  const upResults = filterScholarships({ state: 'Uttar Pradesh' });
  const upIds = upResults.map(s => s.id);
  assert.ok(upIds.includes('nsp_post_matric_sc')); // All India
  assert.ok(upIds.includes('up_post_matric_dashmottar')); // UP specific

  // Assam domicile student sees All-India schemes, but NOT UP-specific schemes
  const assamResults = filterScholarships({ state: 'Assam' });
  const assamIds = assamResults.map(s => s.id);
  assert.ok(assamIds.includes('nsp_post_matric_sc'));
  assert.strictEqual(assamIds.includes('up_post_matric_dashmottar'), false);
}

// 5. Education Level & Category Filtering
console.log('  Testing Education Level and Category Filtering...');
{
  // Class 9-10 filter
  const schoolResults = filterScholarships({ educationLevel: 'class_9_10' });
  const schoolIds = schoolResults.map(s => s.id);
  assert.ok(schoolIds.includes('nsp_pre_matric_minority'));
  assert.strictEqual(schoolIds.includes('nsp_post_matric_sc'), false);

  // Undergraduate filter
  const ugResults = filterScholarships({ educationLevel: 'undergraduate' });
  const ugIds = ugResults.map(s => s.id);
  assert.ok(ugIds.includes('nsp_post_matric_sc'));
  assert.ok(ugIds.includes('nsp_merit_cum_means_minority'));

  // SC Category filter
  const scResults = filterScholarships({ category: 'sc' });
  const scIds = scResults.map(s => s.id);
  assert.ok(scIds.includes('nsp_post_matric_sc'));
  assert.ok(scIds.includes('nsp_top_class_education_sc'));
  assert.ok(scIds.includes('up_post_matric_dashmottar')); // Open to all in UP
  assert.strictEqual(scIds.includes('nsp_post_matric_obc'), false); // Excludes OBC scheme
}

// 6. Income Ceiling Filtering
console.log('  Testing Income Ceiling Filtering...');
{
  // Family income ₹1,50,000 (qualifies for 2.5L and 8L schemes, but exceeds 1L pre-matric)
  const inc150k = filterScholarships({ maxIncome: 150000 });
  const inc150kIds = inc150k.map(s => s.id);
  assert.ok(inc150kIds.includes('nsp_post_matric_sc')); // limit 2.5L
  assert.strictEqual(inc150kIds.includes('nsp_pre_matric_minority'), false); // limit 1L

  // High family income ₹5,00,000 (only qualifies for Top Class SC up to 8L)
  const inc500k = filterScholarships({ maxIncome: 500000 });
  const inc500kIds = inc500k.map(s => s.id);
  assert.ok(inc500kIds.includes('nsp_top_class_education_sc')); // limit 8L
  assert.strictEqual(inc500kIds.includes('nsp_post_matric_sc'), false); // limit 2.5L
}

// 7. Application Status & Keyword Query Search
console.log('  Testing Application Status and Keyword Search...');
{
  // Status filter
  const openSchemes = filterScholarships({ status: 'open' });
  assert.ok(openSchemes.every(s => s.applicationWindow.status === 'open'));

  const closedSchemes = filterScholarships({ status: 'closed' });
  assert.ok(closedSchemes.some(s => s.id === 'nsp_pre_matric_minority'));

  // Keyword query: Alias 'MCM'
  const mcmResults = filterScholarships({ q: 'MCM' });
  assert.ok(mcmResults.some(s => s.id === 'nsp_merit_cum_means_minority'));

  // Keyword query: 'Dashmottar'
  const dashResults = filterScholarships({ q: 'Dashmottar' });
  assert.ok(dashResults.some(s => s.id === 'up_post_matric_dashmottar'));

  // Keyword query: Ministry 'Minority Affairs'
  const momaResults = filterScholarships({ q: 'Minority Affairs' });
  assert.ok(momaResults.length >= 2);
}

// 8. Profile Relevance Scoring (calculateSchemeMatchRelevance)
console.log('  Testing Profile Relevance Scoring...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme);

  const studentProfile = {
    id: 'prof_test',
    version: 1,
    basic: {
      displayName: 'Aditya Verma',
      domicileState: 'Uttar Pradesh',
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec_1',
        level: 'undergraduate',
        sourceType: 'user_input',
      },
    ],
    schemeDependent: {
      category: 'sc',
      familyIncome: 180000,
      triggeredBySchemes: [],
    },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const relevance = calculateSchemeMatchRelevance(scScheme, studentProfile);
  assert.strictEqual(relevance.isRelevant, true);
  assert.ok(relevance.score >= 80);
  assert.ok(relevance.matchReasonsEn.some(r => r.includes('domicile')));
  assert.ok(relevance.matchReasonsEn.some(r => r.includes('category')));
  assert.ok(relevance.matchReasonsEn.some(r => r.includes('income')));
}

console.log('✅ Verified Scholarship Catalogue & Discovery: All tests passed cleanly!\n');

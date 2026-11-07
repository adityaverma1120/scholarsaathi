import { NextRequest, NextResponse } from 'next/server';
import {
  filterScholarships,
  CATALOGUE_COVERAGE_STATEMENT,
} from '@/lib/catalogue/engine';
import { CatalogueFilterSchema } from '@/lib/catalogue/schema';

/**
 * GET /api/scholarships
 * Queries the curated, verified scholarship catalogue by criteria.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryFilters = {
      q: searchParams.get('q') || undefined,
      state: searchParams.get('state') || undefined,
      educationLevel: searchParams.get('level') as any || undefined,
      category: searchParams.get('category') as any || undefined,
      status: searchParams.get('status') as any || undefined,
      providerType: searchParams.get('provider') as any || undefined,
      maxIncome: searchParams.get('income') ? parseInt(searchParams.get('income')!, 10) : undefined,
    };

    const parsedFilters = CatalogueFilterSchema.safeParse(queryFilters);
    const filters = parsedFilters.success ? parsedFilters.data : {};

    const results = filterScholarships(filters);

    return NextResponse.json({
      status: 'success',
      coverageStatement: CATALOGUE_COVERAGE_STATEMENT,
      totalCount: results.length,
      scholarships: results,
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred while querying scholarships.' } },
      { status: 500 }
    );
  }
}


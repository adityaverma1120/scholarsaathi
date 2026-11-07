import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/server/db/index';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const forceMock = searchParams.get('mock') === 'true';

    const data = db.getDashboardData(forceMock);
    const dbStatus = db.getStatus();

    return NextResponse.json({
      ...data,
      storage_status: dbStatus,
    });
  } catch (err) {
    console.error('API /api/dashboard error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard metrics' },
      { status: 500 }
    );
  }
}


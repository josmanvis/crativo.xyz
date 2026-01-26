import { NextRequest, NextResponse } from 'next/server';
import { getAds, createAd, getCarbonSettings, updateCarbonSettings } from '@/lib/db';

// Simple admin auth helper
function isAuthorized(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_KEY || 'crativo-admin';
  const providedKey = request.headers.get('x-admin-key') || 
                      request.nextUrl.searchParams.get('key');
  return providedKey === adminKey;
}

// GET /api/admin/ads - List all ads and settings
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [ads, settings] = await Promise.all([
      getAds(),
      getCarbonSettings(),
    ]);

    return NextResponse.json({ ads, settings });
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}

// POST /api/admin/ads - Create a new ad
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    const { image, title, description, link, sponsor } = body;
    if (!image || !title || !description || !link || !sponsor) {
      return NextResponse.json(
        { error: 'Missing required fields: image, title, description, link, sponsor' },
        { status: 400 }
      );
    }

    const ad = await createAd({
      image,
      title,
      description,
      link,
      sponsor,
      active: body.active ?? true,
    });

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error) {
    console.error('Failed to create ad:', error);
    return NextResponse.json(
      { error: 'Failed to create ad' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/ads - Update settings
export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (body.settings) {
      const settings = await updateCarbonSettings(body.settings);
      return NextResponse.json({ settings });
    }

    return NextResponse.json(
      { error: 'No settings provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

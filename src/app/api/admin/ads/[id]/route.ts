import { NextRequest, NextResponse } from 'next/server';
import { getAdById, updateAd, deleteAd, toggleAdActive } from '@/lib/db';

// Simple admin auth helper
function isAuthorized(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_KEY || 'crativo-admin';
  const providedKey = request.headers.get('x-admin-key') || 
                      request.nextUrl.searchParams.get('key');
  return providedKey === adminKey;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/ads/[id] - Get single ad
export async function GET(request: NextRequest, { params }: RouteParams) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const ad = await getAdById(id);
    
    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error('Failed to fetch ad:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/ads/[id] - Update ad
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Handle toggle action
    if (body.action === 'toggle') {
      const ad = await toggleAdActive(id);
      if (!ad) {
        return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
      }
      return NextResponse.json({ ad });
    }

    // Regular update
    const ad = await updateAd(id, body);
    
    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error('Failed to update ad:', error);
    return NextResponse.json(
      { error: 'Failed to update ad' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ads/[id] - Delete ad
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteAd(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ad:', error);
    return NextResponse.json(
      { error: 'Failed to delete ad' },
      { status: 500 }
    );
  }
}

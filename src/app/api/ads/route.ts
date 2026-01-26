import { NextResponse } from 'next/server';
import { getActiveAds, getCarbonSettings } from '@/lib/db';

// GET /api/ads - Get random active ad for public display
export async function GET() {
  try {
    const [ads, settings] = await Promise.all([
      getActiveAds(),
      getCarbonSettings(),
    ]);

    // If using real Carbon Ads, return settings for client-side script
    if (!settings.use_placeholders && settings.carbon_serve_id) {
      return NextResponse.json({
        useCarbonAds: true,
        serveId: settings.carbon_serve_id,
        placementId: settings.carbon_placement_id,
      });
    }

    // Return a random placeholder ad
    if (ads.length === 0) {
      return NextResponse.json({ ad: null });
    }

    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    return NextResponse.json({ 
      useCarbonAds: false,
      ad: {
        image: randomAd.image,
        title: randomAd.title,
        description: randomAd.description,
        link: randomAd.link,
        sponsor: randomAd.sponsor,
      }
    });
  } catch (error) {
    console.error('Failed to fetch ad:', error);
    // Return null ad on error - graceful degradation
    return NextResponse.json({ ad: null });
  }
}

import { NextResponse } from 'next/server';
import { BuilderBusiness } from '../../../types/crm';
import { mockBuilders } from '../../../utils/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || '';
  const category = searchParams.get('category') || 'construction builder';
  const name = searchParams.get('name') || '';

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST || 'google-map-places.p.rapidapi.com';

  // FALLBACK MODE: If no RapidAPI key is configured, return filtered mock data
  if (!rapidApiKey) {
    const filtered = mockBuilders.filter((b) => {
      const matchesName = name ? b.name.toLowerCase().includes(name.toLowerCase()) : true;
      const matchesCity = city ? b.city.toLowerCase().includes(city.toLowerCase()) : true;
      const matchesCategory = category 
        ? b.category.toLowerCase().includes(category.toLowerCase()) 
        : true;
      return matchesName && matchesCity && matchesCategory;
    });

    return NextResponse.json({
      source: 'local_database_fallback',
      builders: filtered,
      message: 'Running in offline fallback mode. RapidAPI key is missing.'
    });
  }

  try {
    // 1. Text Search request to Google Places via RapidAPI
    const searchQuery = `${name} ${category} in ${city}`.trim();
    const searchUrl = `https://${rapidApiHost}/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}`;
    
    console.log(`Searching RapidAPI Google Places for: ${searchQuery}`);
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': rapidApiHost,
        'x-rapidapi-key': rapidApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`RapidAPI search request failed with status: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    // Check status returned in the body by Google Places proxy
    if (searchData.status && searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places proxy error: ${searchData.status} - ${searchData.error_message || ''}`);
    }

    const results = searchData.results || [];
    const builders: BuilderBusiness[] = [];

    // Limit to top 6 results to prevent rapid API quota consumption & fast loads
    const limitedResults = results.slice(0, 6);

    // 2. Query place details for each item to fetch phone numbers & website
    for (const place of limitedResults) {
      if (!place.place_id) continue;

      const detailsUrl = `https://${rapidApiHost}/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,formatted_address,website,rating,url`;
      
      const detailsResponse = await fetch(detailsUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': rapidApiHost,
          'x-rapidapi-key': rapidApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        if (detailsData.status === 'OK') {
          const d = detailsData.result;
          
          builders.push({
            id: place.place_id,
            name: d.name || place.name,
            phone: d.formatted_phone_number || 'No Public Phone Listed',
            address: d.formatted_address || place.formatted_address || '',
            city: city,
            district: city,
            state: 'Tamil Nadu',
            category: category,
            rating: d.rating || place.rating,
            website: d.website,
            googleMapsLink: d.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            notes: 'Live builder details fetched via RapidAPI Google Maps proxy.'
          });
        }
      }
    }

    return NextResponse.json({
      source: 'google_places_api_live',
      builders,
      count: builders.length
    });
  } catch (error: any) {
    console.error('Error fetching live builders via RapidAPI:', error);
    return NextResponse.json(
      { error: 'Failed to search live records from Google Maps.', details: error.message },
      { status: 500 }
    );
  }
}

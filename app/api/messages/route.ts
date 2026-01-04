import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBlMfq130W_WlhmE0x09IRThNFRGAPh90h-lV3KhpAdxdX5vtSKIrZeBx1nH0P3UxD/exec';

// In-memory cache
let cachedData: any = null;
let cacheTimestamp: number = 0;
let cachedUrl: string = ''; // เก็บ URL ที่ใช้ cache ไว้
const CACHE_DURATION = 60000; // 60 วินาที (1 นาที) - สมดุลระหว่าง quota usage และความสดใหม่ของข้อมูล

export async function GET(request: Request) {
  try {
    // ตรวจสอบ query parameter สำหรับ force refresh
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // ตรวจสอบว่า URL เปลี่ยนหรือไม่
    const urlChanged = cachedUrl !== GOOGLE_SCRIPT_URL;
    
    // ถ้า URL เปลี่ยน ให้ clear cache
    if (urlChanged && cachedData) {
      console.log('🔄 URL changed, clearing cache');
      console.log('📊 Old URL:', cachedUrl);
      console.log('📊 New URL:', GOOGLE_SCRIPT_URL);
      cachedData = null;
      cacheTimestamp = 0;
      cachedUrl = '';
    }
    
    // ตรวจสอบ cache ก่อน (ถ้าไม่ force refresh และ URL ยังเหมือนเดิม)
    const now = Date.now();
    if (!forceRefresh && !urlChanged && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('✅ Returning cached data from Next.js API route (fast response)');
      console.log('📊 Cache age:', Math.round((now - cacheTimestamp) / 1000), 'seconds');
      return NextResponse.json(cachedData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Cache-Status': 'HIT',
        },
      });
    }
    
    if (forceRefresh) {
      console.log('🔄 Force refresh requested - clearing cache');
      cachedData = null;
      cacheTimestamp = 0;
    }
    
    console.log('📡 Server-side fetch to Google Apps Script:', GOOGLE_SCRIPT_URL);
    console.log('📊 Cache status: MISS - fetching fresh data');
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Google Apps Script may redirect, so we need to follow redirects
      redirect: 'follow',
      // Add cache control to avoid stale data
      cache: 'no-store',
    });

    console.log('📥 Response status:', response.status, response.statusText);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    // Google Apps Script may return 200 even after redirects
    // Check if response is actually OK or if it's a redirect response
    if (!response.ok && response.status !== 200) {
      const text = await response.text();
      console.error('❌ Response not OK. Status:', response.status);
      console.error('❌ Response text:', text.substring(0, 500));
      return NextResponse.json(
        { 
          error: 'Failed to fetch data from Google Apps Script', 
          status: response.status,
          statusText: response.statusText,
          details: text.substring(0, 200)
        },
        { status: response.status }
      );
    }

    // Try to parse as JSON
    let data;
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, try to parse as text first
      const text = await response.text();
      console.log('📄 Response text (first 500 chars):', text.substring(0, 500));
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Full response text:', text);
        
        // Check if it's a Google sign-in page
        if (text.includes('accounts.google.com') || text.includes('signin')) {
          throw new Error(
            'Google Apps Script requires authentication. ' +
            'Please check your Google Apps Script deployment settings:\n' +
            '1. Go to Google Apps Script → Deploy → Manage deployments\n' +
            '2. Click the pencil icon to edit\n' +
            '3. Set "Who has access" to "Anyone" (not "Only myself")\n' +
            '4. Click "Deploy" to save changes\n' +
            '5. Copy the new Web app URL if it changed'
          );
        }
        
        throw new Error(`Invalid JSON response. Content-Type: ${contentType}, Response: ${text.substring(0, 200)}`);
      }
    }

    console.log('✅ Data fetched successfully');
    console.log('📊 Data structure:', {
      hasData: !!data,
      hasDataArray: !!data?.data,
      dataLength: data?.data?.length || 0,
      dataKeys: data ? Object.keys(data) : []
    });
    
    // Ensure we return the data in the expected format
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format received from Google Apps Script');
    }

    // If data doesn't have a 'data' property, wrap it
    if (!data.data && Array.isArray(data)) {
      data = { data };
    }
    
    // อัปเดต cache พร้อมเก็บ URL ไว้ด้วย
    cachedData = data;
    cacheTimestamp = Date.now();
    cachedUrl = GOOGLE_SCRIPT_URL; // เก็บ URL ที่ใช้ cache ไว้
    console.log('✅ Data cached in Next.js API route for', CACHE_DURATION / 1000, 'seconds');
    console.log('📊 Cached URL:', cachedUrl);
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache-Status': 'MISS',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return a more helpful error message
    return NextResponse.json(
      { 
        error: 'Failed to fetch from Google Apps Script',
        message: errorMessage,
        hint: errorMessage.includes('authentication') 
          ? 'Please check your Google Apps Script deployment settings. Make sure "Who has access" is set to "Anyone".'
          : 'Please verify that your Google Apps Script URL is correct and the script is deployed as a Web app.',
        // Don't expose stack trace in production
        ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined })
      },
      { status: 500 }
    );
  }
}


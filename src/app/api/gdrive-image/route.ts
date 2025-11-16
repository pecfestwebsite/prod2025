import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  console.log('🖼️ GDrive API called with fileId:', fileId);

  if (!fileId) {
    console.error('❌ Missing file ID');
    return new Response('Missing file ID', { status: 400 });
  }

  // Try multiple Google Drive URL formats
  const urlFormats = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w1000`,
  ];

  for (const url of urlFormats) {
    console.log('🔄 Trying URL:', url);
    try {
      const response = await fetch(url, {
        cache: 'force-cache',
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      console.log('📡 Response status:', response.status, 'from', url);

      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        console.log('✅ Successfully fetched image, size:', imageBuffer.byteLength, 'bytes');
        
        return new Response(imageBuffer, {
          headers: {
            'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } catch (error) {
      console.error(`❌ Failed to fetch from ${url}:`, error);
      continue;
    }
  }

  console.error('❌ All URL formats failed for fileId:', fileId);
  return new Response(
    'Failed to fetch image from Google Drive. Make sure the file is set to "Anyone with the link can view"',
    { status: 404 }
  );
}

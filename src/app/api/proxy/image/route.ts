import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const googleDriveId = searchParams.get('id');
    const imageUrl = searchParams.get('url');

    if (!googleDriveId && !imageUrl) {
      return NextResponse.json(
        { error: 'Missing id or url parameter' },
        { status: 400 }
      );
    }

    let url: string;

    if (googleDriveId) {
      // Construct Google Drive direct link
      url = `https://drive.google.com/uc?export=view&id=${googleDriveId}`;
    } else {
      url = imageUrl!;
    }

    // Fetch the image from the source
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      );
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with appropriate CORS headers
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
}

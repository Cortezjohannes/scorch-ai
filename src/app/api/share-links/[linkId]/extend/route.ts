import { NextRequest, NextResponse } from 'next/server';
import { extendExpiration } from '@/services/share-link-service';

/**
 * POST /api/share-links/[linkId]/extend
 * Extend the expiration date of a share link
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;
    const body = await request.json();
    const { ownerId, expiresAt } = body;

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    if (!expiresAt) {
      return NextResponse.json(
        { error: 'New expiration date is required' },
        { status: 400 }
      );
    }

    await extendExpiration(linkId, new Date(expiresAt), ownerId);

    return NextResponse.json({
      success: true,
      message: 'Expiration date updated successfully'
    });
  } catch (error) {
    console.error('Error extending expiration:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Unauthorized')) {
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }
    
    return NextResponse.json(
      {
        error: 'Failed to extend expiration',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}








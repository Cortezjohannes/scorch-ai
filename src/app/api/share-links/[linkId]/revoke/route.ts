import { NextRequest, NextResponse } from 'next/server';
import { revokeShareLink } from '@/services/share-link-service';

/**
 * POST /api/share-links/[linkId]/revoke
 * Revoke a share link
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;
    const body = await request.json();
    const { ownerId } = body;

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

    await revokeShareLink(linkId, ownerId);

    return NextResponse.json({
      success: true,
      message: 'Share link revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking share link:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Unauthorized')) {
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }
    
    return NextResponse.json(
      {
        error: 'Failed to revoke share link',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}








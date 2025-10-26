import { NextRequest, NextResponse } from 'next/server';
import { createShareLink } from '@/services/share-link-service';

/**
 * API endpoint to create a shareable link for a story bible
 * POST /api/share-story-bible
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyBible, ownerId, ownerName, expiresAt } = body;

    // Validate required fields
    if (!storyBible) {
      return NextResponse.json(
        { error: 'Story bible data is required' },
        { status: 400 }
      );
    }

    if (!ownerId || !ownerName) {
      return NextResponse.json(
        { error: 'Owner information is required' },
        { status: 400 }
      );
    }

    // Create the share link
    const shareLinkData = await createShareLink(
      storyBible,
      ownerId,
      ownerName,
      expiresAt ? new Date(expiresAt) : undefined
    );

    return NextResponse.json({
      success: true,
      data: shareLinkData
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      {
        error: 'Failed to create share link',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}








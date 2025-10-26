import { NextRequest, NextResponse } from 'next/server';
import { getSharedStoryBible, updateSharedStoryBible, logAccess } from '@/services/share-link-service';

/**
 * GET /api/shared/[linkId]
 * Fetch a shared story bible by link ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Get the shared story bible
    const sharedBible = await getSharedStoryBible(linkId);

    if (!sharedBible) {
      return NextResponse.json(
        { error: 'Shared story bible not found' },
        { status: 404 }
      );
    }

    // Log the view access
    await logAccess(linkId, 'viewed');

    return NextResponse.json({
      success: true,
      data: sharedBible
    });
  } catch (error) {
    console.error('Error fetching shared story bible:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return appropriate status based on error message
    if (errorMessage.includes('not found')) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    } else if (errorMessage.includes('revoked')) {
      return NextResponse.json({ error: errorMessage }, { status: 410 }); // Gone
    } else if (errorMessage.includes('expired')) {
      return NextResponse.json({ error: errorMessage }, { status: 410 }); // Gone
    }
    
    return NextResponse.json(
      {
        error: 'Failed to fetch shared story bible',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/shared/[linkId]
 * Update a shared story bible
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;
    const updates = await request.json();

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    if (!updates) {
      return NextResponse.json(
        { error: 'Update data is required' },
        { status: 400 }
      );
    }

    // Update the shared story bible
    await updateSharedStoryBible(linkId, updates);

    // Log the edit access
    await logAccess(linkId, 'edited');

    return NextResponse.json({
      success: true,
      message: 'Story bible updated successfully'
    });
  } catch (error) {
    console.error('Error updating shared story bible:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        error: 'Failed to update shared story bible',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}








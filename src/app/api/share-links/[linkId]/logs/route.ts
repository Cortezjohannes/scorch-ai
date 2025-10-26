import { NextRequest, NextResponse } from 'next/server';
import { getAccessLogs } from '@/services/share-link-service';

/**
 * GET /api/share-links/[linkId]/logs
 * Get access logs for a share link
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

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

    const logs = await getAccessLogs(linkId, ownerId);

    // Calculate analytics
    const viewCount = logs.filter(log => log.action === 'viewed').length;
    const editCount = logs.filter(log => log.action === 'edited').length;
    const lastAccessed = logs.length > 0 
      ? logs[logs.length - 1].timestamp 
      : null;

    return NextResponse.json({
      success: true,
      data: {
        logs,
        analytics: {
          viewCount,
          editCount,
          lastAccessed,
          totalAccess: logs.length
        }
      }
    });
  } catch (error) {
    console.error('Error getting access logs:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Unauthorized')) {
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve access logs',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}








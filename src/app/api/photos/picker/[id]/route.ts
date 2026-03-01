import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/photos/picker/[id] — poll picker session status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const res = await fetch(`https://photospicker.googleapis.com/v1/sessions/${id}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to poll session' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ mediaItemsSet: data.mediaItemsSet ?? false });
}

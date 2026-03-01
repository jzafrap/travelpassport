import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/photos/picker — create a Google Photos Picker session
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch('https://photospicker.googleapis.com/v1/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Photos Picker create session error:', text);
    return NextResponse.json({ error: 'Failed to create picker session' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ id: data.id, pickerUri: data.pickerUri });
}

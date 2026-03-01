import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const user = await db.user.findUnique({ where: { id: auth.userId } });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const body = await req.json();
  const { name, alias, residence, age } = body;

  const user = await db.user.update({
    where: { id: auth.userId },
    data: { name, alias, residence, age: age ? parseInt(age) : null },
  });
  return NextResponse.json(user);
}

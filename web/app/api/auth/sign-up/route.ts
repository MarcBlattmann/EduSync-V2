// This API route is not used as the application uses Server Actions instead
// See app/actions.ts for the actual sign-up implementation

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'This API route is deprecated. Please use the Server Action implementation instead.' },
    { status: 404 }
  );
}
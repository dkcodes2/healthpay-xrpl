import { NextRequest, NextResponse } from 'next/server';
import { getWorkerBalance } from '../../../../lib/xrpl-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    if (!address) {
      return NextResponse.json({ error: 'address is required' }, { status: 400 });
    }
    const balance = await getWorkerBalance(address);
    return NextResponse.json({ address, balance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 
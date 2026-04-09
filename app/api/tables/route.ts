import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId') || 'cmnrp3c210000133y8972ejla';

    const tables = await prisma.table.findMany({
      where: { hotelId },
      include: {
        orders: {
          where: {
            status: {
              notIn: ['COMPLETED', 'CANCELLED']
            }
          }
        }
      }
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error('Tables API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

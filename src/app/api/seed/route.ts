import { NextResponse } from 'next/server';
import { seedProducts } from '@/utils/seedProducts';

export async function POST() {
  try {
    // Only allow seeding in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Seeding is only allowed in development mode' },
        { status: 403 }
      );
    }

    const products = await seedProducts();
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${products.length} products`,
      data: products
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to seed the database with sample products',
    note: 'Only available in development mode'
  });
}

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

// GET - Check if products exist and seed if needed
export async function GET() {
  try {
    const { seedProducts } = await import('@/utils/seedProducts');
    const { Product } = await import('@/models');
    const connectDB = (await import('@/lib/mongodb')).default;

    await connectDB();

    const productCount = await Product.countDocuments();

    if (productCount === 0) {
      console.log('No products found, seeding...');
      const products = await seedProducts();
      return NextResponse.json({
        success: true,
        message: `Database was empty. Successfully seeded ${products.length} products`,
        data: { productCount: products.length, seeded: true }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Database already has ${productCount} products`,
      data: { productCount, seeded: false }
    });
  } catch (error) {
    console.error('Seed check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check/seed products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

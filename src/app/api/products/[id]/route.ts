import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid product ID format'
      }, { status: 400 });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch product'
    }, { status: 500 });
  }
}

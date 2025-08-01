import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const gender = searchParams.get('gender');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    interface FilterType {
      category?: string;
      brand?: { $regex: string; $options: string };
      gender?: string;
      price?: { $gte?: number; $lte?: number };
      $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
    }

    const filter: FilterType = {};

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    if (gender) {
      filter.gender = gender;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get products with filters, sorting, and pagination
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get unique values for filters
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');
    const genders = await Product.distinct('gender');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          categories,
          brands,
          genders
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch products'
    }, { status: 500 });
  }
}

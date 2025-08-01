import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Cart } from '@/models';
import { authenticateUser } from '@/utils/auth';
import { ApiResponse } from '@/types';

interface PopulatedCartItem {
  productId: {
    _id: string;
    name: string;
    image: string;
    brand: string;
    price: number;
  };
  quantity: number;
  size: string;
  color: string;
  price: number;
}

// DELETE - Remove specific item from cart
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { productId, size, color } = await request.json();

    // Validate required fields
    if (!productId || !size || !color) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Product ID, size, and color are required'
      }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cart not found'
      }, { status: 404 });
    }

    // Remove item from cart
    await cart.removeItem(productId, size, color);
    await cart.save();

    // Populate cart items for response
    await cart.populate('items.productId');

    // Transform cart data to ensure proper structure for frontend
    const transformedCart = {
      ...cart.toObject(),
      items: cart.items.map((item: PopulatedCartItem) => ({
        productId: item.productId._id || item.productId,
        product: item.productId, // Map populated productId to product
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price
      }))
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Item removed from cart successfully',
      data: transformedCart
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to remove item from cart'
    }, { status: 500 });
  }
}

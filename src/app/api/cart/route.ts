import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Cart, Product } from '@/models';
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

// GET - Get user's cart
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    let cart = await Cart.findOne({ userId: user._id }).populate('items.productId');

    if (!cart) {
      // Create empty cart if none exists
      cart = new Cart({
        userId: user._id,
        items: [],
        totalAmount: 0
      });
      await cart.save();
    }

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
      data: transformedCart
    });

  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch cart'
    }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { productId, quantity, size, color } = await request.json();

    // Validate required fields
    if (!productId || !quantity || !size || !color) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Product ID, quantity, size, and color are required'
      }, { status: 400 });
    }

    // Validate quantity
    if (quantity < 1 || quantity > 10) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Quantity must be between 1 and 10'
      }, { status: 400 });
    }

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Insufficient stock'
      }, { status: 400 });
    }

    // Validate size and color
    if (!product.sizes.includes(size)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid size for this product'
      }, { status: 400 });
    }

    if (!product.colors.includes(color)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid color for this product'
      }, { status: 400 });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({
        userId: user._id,
        items: [],
        totalAmount: 0
      });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, size, color, product.price);
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
      message: 'Item added to cart successfully',
      data: transformedCart
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to add item to cart'
    }, { status: 500 });
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { productId, quantity, size, color } = await request.json();

    // Validate required fields
    if (!productId || quantity === undefined || !size || !color) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Product ID, quantity, size, and color are required'
      }, { status: 400 });
    }

    // Validate quantity
    if (quantity < 0 || quantity > 10) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Quantity must be between 0 and 10'
      }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cart not found'
      }, { status: 404 });
    }

    // Update item quantity (will remove if quantity is 0)
    await cart.updateQuantity(productId, size, color, quantity);
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
      message: 'Cart updated successfully',
      data: transformedCart
    });

  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update cart'
    }, { status: 500 });
  }
}

// DELETE - Clear entire cart
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

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cart not found'
      }, { status: 404 });
    }

    await cart.clearCart();
    await cart.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to clear cart'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order, Product, Cart } from '@/models';
import { authenticateUser } from '@/utils/auth';
import { ApiResponse } from '@/types';

// POST - Confirm cash payment (for admin use or delivery confirmation)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { id: orderId } = await params;

    // Find order by ID and user
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: user._id 
    });

    if (!order) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Check if order is cash on delivery and payment is pending
    if (order.paymentInfo.method !== 'cash') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'This order is not a cash on delivery order'
      }, { status: 400 });
    }

    if (order.paymentStatus === 'completed') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Payment already confirmed'
      }, { status: 400 });
    }

    // Update order payment status
    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    order.paymentInfo.paymentDate = new Date();
    await order.save();

    // Update product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: order.userId },
      { $set: { items: [], totalAmount: 0 } }
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Cash payment confirmed successfully',
      data: order
    });

  } catch (error) {
    console.error('Confirm cash payment error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to confirm payment'
    }, { status: 500 });
  }
}

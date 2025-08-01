import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order, Product } from '@/models';
import { authenticateUser } from '@/utils/auth';
import { ApiResponse } from '@/types';

interface OrderItem {
  _id?: string;
  productId: string;
  quantity: number;
  subtotal: number;
}

// GET - Get specific order details
export async function GET(
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
    }).populate('items.productId', 'name image brand').lean();

    if (!order) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order details error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch order details'
    }, { status: 500 });
  }
}

// PATCH - Cancel order or individual items
export async function PATCH(
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
    const { action, itemId } = await request.json();

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

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Order cannot be cancelled at this stage'
      }, { status: 400 });
    }

    if (action === 'cancel_order') {
      // Cancel entire order
      order.status = 'cancelled';

      // Restore product stock if payment was completed
      if (order.paymentStatus === 'completed') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } }
          );
        }
      }

      await order.save();

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });

    } else if (action === 'cancel_item' && itemId) {
      // Cancel individual item
      const itemIndex = order.items.findIndex((item: OrderItem) => item._id?.toString() === itemId);

      if (itemIndex === -1) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Item not found in order'
        }, { status: 404 });
      }

      const cancelledItem = order.items[itemIndex];

      // Restore product stock if payment was completed
      if (order.paymentStatus === 'completed') {
        await Product.findByIdAndUpdate(
          cancelledItem.productId,
          { $inc: { stock: cancelledItem.quantity } }
        );
      }

      // Remove item from order
      order.items.splice(itemIndex, 1);

      // Recalculate total amount
      order.totalAmount = order.items.reduce((total: number, item: OrderItem) => total + item.subtotal, 0);

      // If no items left, cancel the entire order
      if (order.items.length === 0) {
        order.status = 'cancelled';
      }

      await order.save();

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Item cancelled successfully',
        data: order
      });

    } else {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid action'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to cancel order'
    }, { status: 500 });
  }
}

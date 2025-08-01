import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order, Cart, Product } from '@/models';
import { authenticateUser } from '@/utils/auth';
import { ApiResponse } from '@/types';
import bkashService from '@/services/bkashService';

interface CheckoutRequest {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'bkash' | 'card' | 'cash';
  customerPhone: string;
}

// POST - Create order and initiate payment
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

    const checkoutData: CheckoutRequest = await request.json();

    // Validate required fields
    if (!checkoutData.shippingAddress || !checkoutData.paymentMethod || !checkoutData.customerPhone) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required checkout information'
      }, { status: 400 });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cart is empty'
      }, { status: 400 });
    }

    // Validate stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `Product not found: ${item.productId}`
        }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        }, { status: 400 });
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order items
    const orderItems = cart.items.map((item: { productId: { _id: string; name: string }; quantity: number; size: string; color: string; price: number }) => ({
      productId: item.productId._id,
      productName: item.productId.name,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
      subtotal: item.price * item.quantity
    }));

    // Create order
    const order = new Order({
      userId: user._id,
      orderNumber,
      items: orderItems,
      totalAmount: cart.totalAmount,
      status: 'pending',
      shippingAddress: checkoutData.shippingAddress,
      paymentStatus: 'pending',
      paymentInfo: {
        method: checkoutData.paymentMethod,
        bkashPaymentId: undefined, // Will be set later for bKash payments
        bkashTransactionId: undefined,
        bkashInvoiceNumber: undefined,
        paymentDate: undefined
      }
    });

    await order.save();

    // Handle payment based on method
    if (checkoutData.paymentMethod === 'bkash') {
      try {
        // Create bKash payment
        const bkashPayment = await bkashService.createPayment({
          amount: cart.totalAmount,
          orderNumber: orderNumber,
          customerPhone: checkoutData.customerPhone
        });

        // Update order with bKash payment ID
        order.paymentInfo.bkashPaymentId = bkashPayment.paymentID;
        await order.save();

        return NextResponse.json<ApiResponse>({
          success: true,
          message: 'Order created successfully. Redirecting to bKash payment.',
          data: {
            orderId: order._id,
            orderNumber: orderNumber,
            paymentUrl: bkashPayment.bkashURL,
            paymentId: bkashPayment.paymentID,
            totalAmount: cart.totalAmount
          }
        });

      } catch (bkashError) {
        console.error('bKash payment creation failed:', bkashError);
        
        // Update order status to failed
        order.paymentStatus = 'failed';
        await order.save();

        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Failed to initiate bKash payment. Please try again.'
        }, { status: 500 });
      }
    } else if (checkoutData.paymentMethod === 'cash') {
      // For cash on delivery, order is created but payment is pending
      // Clear user's cart since order is successfully placed
      await Cart.findOneAndUpdate(
        { userId: user._id },
        { $set: { items: [], totalAmount: 0 } }
      );

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Order created successfully. Cash on delivery selected.',
        data: {
          orderId: order._id,
          orderNumber: orderNumber,
          totalAmount: cart.totalAmount,
          paymentMethod: 'cash'
        }
      });
    } else {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Payment method not supported yet'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to process checkout'
    }, { status: 500 });
  }
}

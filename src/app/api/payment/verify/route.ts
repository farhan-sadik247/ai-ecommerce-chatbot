import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models';
import { authenticateUser } from '@/utils/auth';
import { ApiResponse } from '@/types';
import bkashService from '@/services/bkashService';

// POST - Verify payment status
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

    const { paymentId, orderId } = await request.json();

    if (!paymentId && !orderId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Payment ID or Order ID is required'
      }, { status: 400 });
    }

    // Find order
    let order;
    if (orderId) {
      order = await Order.findOne({ _id: orderId, userId: user._id });
    } else {
      order = await Order.findOne({ 
        'paymentInfo.bkashPaymentId': paymentId,
        userId: user._id 
      });
    }

    if (!order) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // If payment is already completed, return the status
    if (order.paymentStatus === 'completed') {
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Payment already completed',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          transactionId: order.paymentInfo.bkashTransactionId,
          totalAmount: order.totalAmount
        }
      });
    }

    // If bKash payment, query the payment status
    if (order.paymentInfo.method === 'bkash' && order.paymentInfo.bkashPaymentId) {
      try {
        const paymentStatus = await bkashService.queryPayment(order.paymentInfo.bkashPaymentId);

        if (paymentStatus.transactionStatus === 'Completed') {
          // Update order if payment is completed
          order.paymentStatus = 'completed';
          order.status = 'confirmed';
          order.paymentInfo.bkashTransactionId = paymentStatus.trxID;
          order.paymentInfo.paymentDate = new Date();
          await order.save();

          return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Payment verified and completed',
            data: {
              orderId: order._id,
              orderNumber: order.orderNumber,
              paymentStatus: 'completed',
              transactionId: paymentStatus.trxID,
              totalAmount: order.totalAmount
            }
          });
        } else {
          return NextResponse.json<ApiResponse>({
            success: false,
            message: 'Payment not completed yet',
            data: {
              orderId: order._id,
              orderNumber: order.orderNumber,
              paymentStatus: order.paymentStatus,
              transactionStatus: paymentStatus.transactionStatus
            }
          });
        }
      } catch (bkashError) {
        console.error('bKash query error:', bkashError);
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Failed to verify payment with bKash'
        }, { status: 500 });
      }
    }

    // For other payment methods, return current status
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentInfo.method,
        totalAmount: order.totalAmount
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to verify payment'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order, Cart, Product } from '@/models';
import bkashService from '@/services/bkashService';

// POST - Handle bKash payment webhook
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { paymentID, status } = await request.json();

    console.log('bKash webhook received:', { paymentID, status });

    if (!paymentID) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required'
      }, { status: 400 });
    }

    // Find order by bKash payment ID
    const order = await Order.findOne({ 'paymentInfo.bkashPaymentId': paymentID });
    if (!order) {
      console.error('Order not found for payment ID:', paymentID);
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    if (status === 'success') {
      try {
        // Execute the payment with bKash
        const executeResponse = await bkashService.executePayment(paymentID);

        if (executeResponse.transactionStatus === 'Completed') {
          // Update order with payment details
          order.paymentStatus = 'completed';
          order.status = 'confirmed';
          order.paymentInfo.bkashTransactionId = executeResponse.trxID;
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

          console.log('Payment completed successfully:', {
            orderId: order._id,
            transactionId: executeResponse.trxID
          });

          return NextResponse.json({
            success: true,
            message: 'Payment completed successfully',
            data: {
              orderId: order._id,
              transactionId: executeResponse.trxID
            }
          });
        } else {
          // Payment execution failed
          order.paymentStatus = 'failed';
          await order.save();

          return NextResponse.json({
            success: false,
            error: 'Payment execution failed'
          }, { status: 400 });
        }
      } catch (executeError) {
        console.error('Payment execution error:', executeError);
        
        order.paymentStatus = 'failed';
        await order.save();

        return NextResponse.json({
          success: false,
          error: 'Failed to execute payment'
        }, { status: 500 });
      }
    } else if (status === 'failure' || status === 'cancel') {
      // Payment failed or cancelled
      order.paymentStatus = 'failed';
      await order.save();

      return NextResponse.json({
        success: false,
        message: 'Payment was cancelled or failed'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid payment status'
    }, { status: 400 });

  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process payment webhook'
    }, { status: 500 });
  }
}

// GET - Handle bKash redirect callbacks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentID = searchParams.get('paymentID');
  const status = searchParams.get('status');

  console.log('bKash redirect callback:', { paymentID, status });

  if (!paymentID) {
    return NextResponse.redirect(new URL('/payment/failed?error=missing-payment-id', request.url));
  }

  try {
    await connectDB();

    // Find order by payment ID
    const order = await Order.findOne({ 'paymentInfo.bkashPaymentId': paymentID });
    if (!order) {
      return NextResponse.redirect(new URL('/payment/failed?error=order-not-found', request.url));
    }

    if (status === 'success') {
      try {
        // Execute the payment
        const executeResponse = await bkashService.executePayment(paymentID);

        if (executeResponse.transactionStatus === 'Completed') {
          // Update order
          order.paymentStatus = 'completed';
          order.status = 'confirmed';
          order.paymentInfo.bkashTransactionId = executeResponse.trxID;
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

          return NextResponse.redirect(
            new URL(`/payment/success?orderId=${order._id}&transactionId=${executeResponse.trxID}`, request.url)
          );
        } else {
          order.paymentStatus = 'failed';
          await order.save();
          return NextResponse.redirect(new URL('/payment/failed?error=execution-failed', request.url));
        }
      } catch (executeError) {
        console.error('Payment execution error:', executeError);
        order.paymentStatus = 'failed';
        await order.save();
        return NextResponse.redirect(new URL('/payment/failed?error=execution-error', request.url));
      }
    } else {
      // Payment failed or cancelled
      order.paymentStatus = 'failed';
      await order.save();
      return NextResponse.redirect(new URL('/payment/failed?error=payment-cancelled', request.url));
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(new URL('/payment/failed?error=callback-error', request.url));
  }
}

import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  subtotal: number;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IPaymentInfo {
  method: 'bkash' | 'card' | 'cash';
  bkashPaymentId?: string;
  bkashTransactionId?: string;
  bkashInvoiceNumber?: string;
  paymentDate?: Date;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: IShippingAddress;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentInfo: IPaymentInfo;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  size: {
    type: String,
    required: true,
    enum: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13']
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  }
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
    maxlength: [100, 'Street address cannot exceed 100 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
    match: [/^\d{4}$/, 'Please enter a valid 4-digit postal code']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'United States'
  }
});

const PaymentInfoSchema = new Schema<IPaymentInfo>({
  method: {
    type: String,
    required: true,
    enum: {
      values: ['bkash', 'card', 'cash'],
      message: 'Payment method must be one of: bkash, card, cash'
    }
  },
  bkashPaymentId: {
    type: String,
    required: false
  },
  bkashTransactionId: {
    type: String
  },
  bkashInvoiceNumber: {
    type: String
  },
  paymentDate: {
    type: Date
  }
});

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      message: 'Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled'
    },
    default: 'pending'
  },
  shippingAddress: {
    type: ShippingAddressSchema,
    required: true
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'completed', 'failed', 'refunded'],
      message: 'Payment status must be one of: pending, completed, failed, refunded'
    },
    default: 'pending'
  },
  paymentInfo: {
    type: PaymentInfoSchema,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

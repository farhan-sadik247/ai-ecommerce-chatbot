import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  calculateTotal(): Promise<number>;
  addItem(productId: string, quantity: number, size: string, color: string, price: number): Promise<void>;
  removeItem(productId: string, size: string, color: string): Promise<void>;
  updateQuantity(productId: string, size: string, color: string, quantity: number): Promise<void>;
  clearCart(): Promise<void>;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Maximum quantity per item is 10']
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
  }
});

const CartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [CartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  }
}, {
  timestamps: true
});

// Index for faster user cart lookups with uniqueness
CartSchema.index({ userId: 1 }, { unique: true });

// Calculate total amount
CartSchema.methods.calculateTotal = async function(): Promise<number> {
  const total = this.items.reduce((sum: number, item: ICartItem) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  this.totalAmount = Math.round(total * 100) / 100; // Round to 2 decimal places
  return this.totalAmount;
};

// Add item to cart
CartSchema.methods.addItem = async function(
  productId: string, 
  quantity: number, 
  size: string, 
  color: string, 
  price: number
): Promise<void> {
  const existingItemIndex = this.items.findIndex((item: ICartItem) => 
    item.productId.toString() === productId && 
    item.size === size && 
    item.color === color
  );

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
    if (this.items[existingItemIndex].quantity > 10) {
      this.items[existingItemIndex].quantity = 10;
    }
  } else {
    // Add new item
    this.items.push({
      productId: new mongoose.Types.ObjectId(productId),
      quantity,
      size,
      color,
      price
    });
  }

  await this.calculateTotal();
};

// Remove item from cart
CartSchema.methods.removeItem = async function(
  productId: string, 
  size: string, 
  color: string
): Promise<void> {
  this.items = this.items.filter((item: ICartItem) => 
    !(item.productId.toString() === productId && 
      item.size === size && 
      item.color === color)
  );

  await this.calculateTotal();
};

// Update item quantity
CartSchema.methods.updateQuantity = async function(
  productId: string, 
  size: string, 
  color: string, 
  quantity: number
): Promise<void> {
  const itemIndex = this.items.findIndex((item: ICartItem) => 
    item.productId.toString() === productId && 
    item.size === size && 
    item.color === color
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = Math.min(quantity, 10);
    }
    await this.calculateTotal();
  }
};

// Clear cart
CartSchema.methods.clearCart = async function(): Promise<void> {
  this.items = [];
  this.totalAmount = 0;
};

// Update total before saving
CartSchema.pre('save', async function(next) {
  await this.calculateTotal();
  next();
});

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  brand: string;
  gender: 'men' | 'women' | 'unisex';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['running', 'casual', 'formal', 'sports', 'boots', 'sandals', 'sneakers'],
      message: 'Category must be one of: running, casual, formal, sports, boots, sandals, sneakers'
    }
  },
  sizes: [{
    type: String,
    required: true,
    enum: {
      values: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'],
      message: 'Invalid shoe size'
    }
  }],
  colors: [{
    type: String,
    required: true,
    trim: true
  }],
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  gender: {
    type: String,
    required: [true, 'Gender category is required'],
    enum: {
      values: ['men', 'women', 'unisex'],
      message: 'Gender must be one of: men, women, unisex'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ gender: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 'text', description: 'text' }); // Text search index

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  message: string;
  response: string;
  intent: string;
  entities: {
    productName?: string;
    category?: string;
    size?: string;
    color?: string;
    quantity?: number;
  };
  timestamp: Date;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  addMessage(message: string, response: string, intent: string, entities?: Record<string, unknown>): Promise<void>;
  getRecentMessages(limit?: number): IChatMessage[];
}

const ChatMessageSchema = new Schema<IChatMessage>({
  message: {
    type: String,
    required: [true, 'User message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  response: {
    type: String,
    required: [true, 'Bot response is required'],
    trim: true,
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  },
  intent: {
    type: String,
    required: [true, 'Intent is required'],
    enum: {
      values: [
        'browse_products',
        'add_to_cart',
        'remove_from_cart',
        'view_cart',
        'checkout',
        'general_inquiry',
        'greeting',
        'unknown'
      ],
      message: 'Invalid intent type'
    }
  },
  entities: {
    productName: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true,
      enum: {
        values: ['running', 'casual', 'formal', 'sports', 'boots', 'sandals', 'sneakers', ''],
        message: 'Invalid category'
      }
    },
    size: {
      type: String,
      enum: {
        values: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', ''],
        message: 'Invalid shoe size'
      }
    },
    color: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Maximum quantity is 10']
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatHistorySchema = new Schema<IChatHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    trim: true
  },
  messages: [ChatMessageSchema]
}, {
  timestamps: true
});

// Indexes for better query performance
ChatHistorySchema.index({ userId: 1 });
ChatHistorySchema.index({ sessionId: 1 });
ChatHistorySchema.index({ 'messages.timestamp': -1 });

// Add message method
ChatHistorySchema.methods.addMessage = async function(
  message: string,
  response: string,
  intent: string,
  entities: Record<string, unknown> = {}
): Promise<void> {
  this.messages.push({
    message,
    response,
    intent,
    entities,
    timestamp: new Date()
  });

  // Keep only the last 50 messages to prevent document from growing too large
  if (this.messages.length > 50) {
    this.messages = this.messages.slice(-50);
  }
};

// Get recent messages
ChatHistorySchema.methods.getRecentMessages = function(limit: number = 10): IChatMessage[] {
  return this.messages
    .sort((a: IChatMessage, b: IChatMessage) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

// Create compound index for user and session
ChatHistorySchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export default mongoose.models.ChatHistory || mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);

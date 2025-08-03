import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import groq from '@/lib/groq';
import { Product, Cart, ChatHistory } from '@/models';
import { authenticateUser, generateSessionId } from '@/utils/auth';
import { ApiResponse, ChatIntent, ChatIntentResult } from '@/types';

interface ChatRequest {
  message: string;
  sessionId?: string;
}

interface ChatResponse {
  response: string;
  intent: ChatIntent;
  entities: {
    productName?: string;
    category?: string;
    size?: string;
    color?: string;
    quantity?: number;
  };
  products?: any[];
  cartUpdated?: boolean;
  sessionId?: string;
}

interface ProductInfo {
  _id: string;
  name: string;
  brand: string;
  price: number;
  colors: string[];
  sizes: string[];
  category: string;
  image?: string;
}

interface ChatEntities {
  productName?: string;
  category?: string;
  size?: string;
  color?: string;
  quantity?: number;
}

interface InternalChatResponse {
  response: string;
  intent: ChatIntent;
  entities: ChatEntities;
  products?: ProductInfo[];
  cartUpdated?: boolean;
}

// POST - Handle chat messages
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

    const { message, sessionId }: ChatRequest = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    // Generate session ID if not provided
    const currentSessionId = sessionId || generateSessionId();

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({
      userId: user._id,
      sessionId: currentSessionId
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId: user._id,
        sessionId: currentSessionId,
        messages: []
      });
    }

    // Get recent messages for context
    const recentMessages = chatHistory.getRecentMessages(5);
    const contextMessages = recentMessages.map((msg: any) =>
      `User: ${msg.message}\nAssistant: ${msg.response}`
    ).join('\n\n');

    // Analyze intent using OpenAI
    const intentResult = await analyzeIntent(message, contextMessages);

    // Handle the intent and generate response
    const chatResponse = await handleIntent(intentResult, user._id, message);

    // Sanitize entities before saving
    const sanitizedEntities = {
      productName: chatResponse.entities.productName || undefined,
      category: chatResponse.entities.category || undefined,
      size: chatResponse.entities.size || undefined,
      color: chatResponse.entities.color || undefined,
      quantity: chatResponse.entities.quantity || undefined
    };

    // Save message to chat history
    await chatHistory.addMessage(
      message,
      chatResponse.response,
      chatResponse.intent,
      sanitizedEntities
    );
    await chatHistory.save();

    return NextResponse.json<ApiResponse<ChatResponse>>({
      success: true,
      data: {
        ...chatResponse,
        sessionId: currentSessionId
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to process chat message'
    }, { status: 500 });
  }
}

// Analyze user intent using OpenAI
async function analyzeIntent(message: string, context: string): Promise<ChatIntentResult> {
  try {
    const prompt = `
You are an AI assistant for a shoe e-commerce store. Analyze the user's message and determine their intent.

Available intents:
1. "browse_products" - User wants to see/search for shoes (e.g., "show me running shoes", "I need boots")
2. "add_to_cart" - User wants to add a specific shoe to cart (e.g., "add red sneakers size 9", "I want the Nike Air Max")
3. "remove_from_cart" - User wants to remove items from cart (e.g., "remove the boots", "delete size 8 sneakers")
4. "view_cart" - User wants to see their cart contents (e.g., "show my cart", "what's in my cart")
5. "checkout" - User wants to complete purchase (e.g., "checkout", "I'm ready to buy", "place order")
6. "general_inquiry" - General questions about products, shipping, etc.
7. "greeting" - User is greeting or starting conversation
8. "unknown" - Cannot determine intent

Extract entities when relevant:
- productName: specific shoe name, brand, or model mentioned (e.g., "Arizona", "Nike Air Max", "Converse", "Birkenstock")
- category: type of shoe (sneakers, boots, sandals, formal, sports, casual)
- size: shoe size mentioned (e.g., "9", "10.5", "size 8")
- color: color mentioned (e.g., "black", "red", "white")
- quantity: number of items (default to 1 if not specified)

Important: For productName, extract ANY shoe-related name, brand, or model mentioned, even partial names like "Arizona" (which refers to Birkenstock Arizona sandals).

Context from previous messages:
${context}

Current user message: "${message}"

Respond with a JSON object containing:
{
  "intent": "intent_name",
  "entities": {
    "productName": "extracted product name or null",
    "category": "extracted category or null",
    "size": "extracted size or null",
    "color": "extracted color or null",
    "quantity": extracted_number_or_null
  },
  "confidence": confidence_score_0_to_1
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing user intents for an e-commerce shoe store. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 300
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const intentResult: ChatIntentResult = JSON.parse(response);
    
    // Validate and set defaults
    if (!intentResult.intent) {
      intentResult.intent = 'unknown';
    }
    if (!intentResult.entities) {
      intentResult.entities = {};
    }
    if (!intentResult.confidence) {
      intentResult.confidence = 0.5;
    }

    return intentResult;

  } catch (error) {
    console.error('Intent analysis error:', error);
    // Return default intent on error
    return {
      intent: 'unknown',
      entities: {},
      confidence: 0.0
    };
  }
}

// Handle different intents and generate appropriate responses
async function handleIntent(
  intentResult: ChatIntentResult,
  userId: string,
  originalMessage: string
): Promise<InternalChatResponse> {
  const { intent, entities } = intentResult;

  switch (intent) {
    case 'browse_products':
      return await handleBrowseProducts(entities, originalMessage);

    case 'add_to_cart':
      return await handleAddToCart(entities, userId, originalMessage);

    case 'remove_from_cart':
      return await handleRemoveFromCart(entities, userId, originalMessage);

    case 'view_cart':
      return await handleViewCart(userId);

    case 'checkout':
      return await handleCheckout(userId);

    case 'greeting':
      return {
        response: "Hello! 👋 Welcome to ShoeBot! I'm here to help you find the perfect shoes. You can ask me to show you products, add items to your cart, or help with checkout. What are you looking for today?",
        intent,
        entities
      };

    case 'general_inquiry':
      return await handleGeneralInquiry(originalMessage);

    default:
      return {
        response: "I'm not sure I understand. I can help you browse shoes, add items to your cart, remove items, view your cart, or checkout. What would you like to do?",
        intent: 'unknown',
        entities
      };
  }
}

// Handle product browsing
async function handleBrowseProducts(entities: ChatEntities, _originalMessage: string): Promise<InternalChatResponse> {
  try {
    // Build search query based on entities
    const filter: any = {};

    if (entities.category) {
      // Map common category terms
      const categoryMap: { [key: string]: string } = {
        'running': 'sneakers',
        'athletic': 'sneakers',
        'sport': 'sports',
        'dress': 'formal',
        'work': 'boots'
      };

      const category = categoryMap[entities.category.toLowerCase()] || entities.category.toLowerCase();
      filter.category = { $regex: category, $options: 'i' };
    }

    if (entities.productName) {
      filter.$or = [
        { name: { $regex: entities.productName, $options: 'i' } },
        { brand: { $regex: entities.productName, $options: 'i' } }
      ];
    }

    if (entities.color) {
      filter.colors = { $in: [new RegExp(entities.color, 'i')] };
    }

    // Get products (limit to 3 for chat display)
    const products = await Product.find(filter)
      .limit(3)
      .lean();

    if (products.length === 0) {
      return {
        response: "I couldn't find any shoes matching your criteria. Would you like me to show you our popular products instead?",
        intent: 'browse_products',
        entities,
        products: []
      };
    }

    const productList = products.map(p =>
      `• **${p.name}** by ${p.brand} - $${p.price}\n  Available in: ${p.colors.join(', ')}\n  Sizes: ${p.sizes.join(', ')}`
    ).join('\n\n');

    const response = `Here are ${products.length} shoes I found for you:\n\n${productList}\n\nWould you like to add any of these to your cart? Just let me know the name, size, and color!`;

    return {
      response,
      intent: 'browse_products',
      entities,
      products: products as unknown as ProductInfo[]
    };

  } catch (error) {
    console.error('Browse products error:', error);
    return {
      response: "Sorry, I had trouble searching for products. Please try again.",
      intent: 'browse_products',
      entities,
      products: []
    };
  }
}

// Handle adding items to cart
async function handleAddToCart(entities: ChatEntities, userId: string, _originalMessage: string): Promise<InternalChatResponse> {
  try {
    // Find the product with improved search
    let product = null;

    if (entities.productName) {
      // Try multiple search strategies
      const searchTerm = entities.productName.toLowerCase();

      // Strategy 1: Exact name match
      product = await Product.findOne({
        name: { $regex: entities.productName, $options: 'i' }
      });

      // Strategy 2: Brand match
      if (!product) {
        product = await Product.findOne({
          brand: { $regex: entities.productName, $options: 'i' }
        });
      }

      // Strategy 3: Partial name match (for cases like "arizona" matching "Birkenstock Arizona")
      if (!product) {
        product = await Product.findOne({
          name: { $regex: searchTerm, $options: 'i' }
        });
      }

      // Strategy 4: Search in description
      if (!product) {
        product = await Product.findOne({
          description: { $regex: searchTerm, $options: 'i' }
        });
      }
    }

    if (!product) {
      return {
        response: "I couldn't find that specific shoe. Could you please be more specific about which shoe you'd like to add? You can say something like 'Add Nike Air Max in black size 9'.",
        intent: 'add_to_cart',
        entities
      };
    }

    // Validate size and color
    const size = entities.size;
    const color = entities.color;

    if (!size || !product.sizes.includes(size)) {
      return {
        response: `Please specify a valid size for ${product.name}. Available sizes: ${product.sizes.join(', ')}`,
        intent: 'add_to_cart',
        entities
      };
    }

    if (!color || !product.colors.some((c: string) => c.toLowerCase().includes(color.toLowerCase()))) {
      return {
        response: `Please specify a valid color for ${product.name}. Available colors: ${product.colors.join(', ')}`,
        intent: 'add_to_cart',
        entities
      };
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        totalAmount: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item: any) =>
      item.productId.toString() === product._id.toString() &&
      item.size === size &&
      item.color.toLowerCase() === color.toLowerCase()
    );

    const quantity = entities.quantity || 1;

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: product._id,
        quantity,
        size,
        color: color.toLowerCase(),
        price: product.price
      });
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
    await cart.save();

    return {
      response: `Great! I've added ${quantity} ${product.name} in ${color} (size ${size}) to your cart for $${(product.price * quantity).toFixed(2)}. Your cart total is now $${cart.totalAmount.toFixed(2)}. Would you like to continue shopping or checkout?`,
      intent: 'add_to_cart',
      entities,
      cartUpdated: true
    };

  } catch (error) {
    console.error('Add to cart error:', error);
    return {
      response: "Sorry, I had trouble adding that item to your cart. Please try again.",
      intent: 'add_to_cart',
      entities
    };
  }
}

// Handle removing items from cart
async function handleRemoveFromCart(entities: ChatEntities, userId: string, _originalMessage: string): Promise<InternalChatResponse> {
  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return {
        response: "Your cart is already empty. Would you like to browse some shoes?",
        intent: 'remove_from_cart',
        entities
      };
    }

    // Find item to remove
    let itemToRemove = null;
    let itemIndex = -1;

    if (entities.productName) {
      itemIndex = cart.items.findIndex((item: any) => {
        const product = item.productId;
        return product.name.toLowerCase().includes(entities.productName!.toLowerCase()) ||
               product.brand.toLowerCase().includes(entities.productName!.toLowerCase());
      });
    }

    // If size and color specified, be more specific
    if (entities.size || entities.color) {
      itemIndex = cart.items.findIndex((item: any) => {
        const product = item.productId;
        const nameMatch = entities.productName ?
          (product.name.toLowerCase().includes(entities.productName.toLowerCase()) ||
           product.brand.toLowerCase().includes(entities.productName.toLowerCase())) : true;
        const sizeMatch = entities.size ? item.size === entities.size : true;
        const colorMatch = entities.color ? item.color.toLowerCase().includes(entities.color.toLowerCase()) : true;

        return nameMatch && sizeMatch && colorMatch;
      });
    }

    if (itemIndex === -1) {
      const cartItems = cart.items.map((item: any) =>
        `• ${item.productId.name} (${item.color}, size ${item.size}) - Qty: ${item.quantity}`
      ).join('\n');

      return {
        response: `I couldn't find that item in your cart. Here's what you currently have:\n\n${cartItems}\n\nPlease be more specific about which item you'd like to remove.`,
        intent: 'remove_from_cart',
        entities
      };
    }

    // Remove the item
    itemToRemove = cart.items[itemIndex];
    const removedProduct = (itemToRemove as any).productId;
    cart.items.splice(itemIndex, 1);

    // Recalculate total
    cart.totalAmount = cart.items.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
    await cart.save();

    return {
      response: `I've removed ${removedProduct.name} in ${itemToRemove.color} (size ${itemToRemove.size}) from your cart. Your new cart total is $${cart.totalAmount.toFixed(2)}.`,
      intent: 'remove_from_cart',
      entities,
      cartUpdated: true
    };

  } catch (error) {
    console.error('Remove from cart error:', error);
    return {
      response: "Sorry, I had trouble removing that item from your cart. Please try again.",
      intent: 'remove_from_cart',
      entities
    };
  }
}

// Handle viewing cart
async function handleViewCart(userId: string): Promise<InternalChatResponse> {
  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return {
        response: "Your cart is empty. Would you like me to show you some popular shoes?",
        intent: 'view_cart',
        entities: {}
      };
    }

    const cartItems = cart.items.map((item: any) =>
      `• **${item.productId.name}** by ${item.productId.brand}\n  Color: ${item.color}, Size: ${item.size}, Qty: ${item.quantity}\n  Price: $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n\n');

    const response = `Here's what's in your cart:\n\n${cartItems}\n\n**Total: $${cart.totalAmount.toFixed(2)}**\n\nWould you like to checkout or continue shopping?`;

    return {
      response,
      intent: 'view_cart',
      entities: {}
    };

  } catch (error) {
    console.error('View cart error:', error);
    return {
      response: "Sorry, I had trouble loading your cart. Please try again.",
      intent: 'view_cart',
      entities: {}
    };
  }
}

// Handle checkout
async function handleCheckout(userId: string): Promise<InternalChatResponse> {
  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return {
        response: "Your cart is empty. Please add some shoes to your cart before checkout.",
        intent: 'checkout',
        entities: {}
      };
    }

    // Import Order model and User model
    const { Order, User } = await import('@/models');

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return {
        response: "Sorry, I couldn't find your user account. Please try logging in again.",
        intent: 'checkout',
        entities: {}
      };
    }

    // Create order from cart
    const orderItems = cart.items.map((item: any) => ({
      productId: item.productId._id,
      productName: item.productId.name,
      productBrand: item.productId.brand,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
      subtotal: item.price * item.quantity
    }));

    // Check if user has complete shipping address
    if (!user.shippingAddress || !user.shippingAddress.street ||
        !user.shippingAddress.city || !user.shippingAddress.state ||
        !user.shippingAddress.zipCode) {
      return {
        response: "To complete your order, please update your profile with a complete shipping address first. You can do this by visiting your Profile page, then come back and say 'I'm ready to checkout' again.",
        intent: 'checkout',
        entities: {}
      };
    }

    const newOrder = new Order({
      userId: userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress: {
        fullName: user.name,
        email: user.email,
        phone: user.phone || "Not provided",
        street: user.shippingAddress.street,
        city: user.shippingAddress.city,
        state: user.shippingAddress.state,
        zipCode: user.shippingAddress.zipCode,
        country: user.shippingAddress.country || "Bangladesh"
      },
      paymentInfo: {
        method: 'cash'
      },
      paymentStatus: 'pending',
      status: 'confirmed',
      orderNumber: `ORD-${Date.now()}`
    });

    await newOrder.save();

    // Clear the cart after successful order
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    const itemCount = orderItems.reduce((total: number, item: any) => total + item.quantity, 0);

    return {
      response: `🎉 Order placed successfully with Cash on Delivery!

**Order Details:**
- Order Number: ${newOrder.orderNumber}
- Items: ${itemCount} item(s)
- Total: $${newOrder.totalAmount.toFixed(2)}
- Payment: Cash on Delivery
- Status: Confirmed
- Delivery Address: ${user.shippingAddress.street}, ${user.shippingAddress.city}
- Estimated Delivery: 7 days from now

Your cart has been cleared and your order is being processed. You'll pay when the items are delivered to your address. You can view your order details in the Orders section. Thank you for shopping with us! 🛍️`,
      intent: 'checkout',
      entities: {},
      cartUpdated: true // Trigger cart refresh since it's now empty
    };

  } catch (error) {
    console.error('Checkout error:', error);
    return {
      response: "Sorry, I had trouble processing your checkout request. Please try again or use the regular checkout process.",
      intent: 'checkout',
      entities: {}
    };
  }
}

// Handle general inquiries
async function handleGeneralInquiry(originalMessage: string): Promise<InternalChatResponse> {
  try {
    const prompt = `
You are a helpful customer service assistant for a shoe e-commerce store. Answer the user's question about shoes, shipping, returns, sizing, or general store policies. Keep responses friendly, helpful, and concise.

User question: "${originalMessage}"

Provide a helpful response about shoes, shopping, or store policies.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful customer service assistant for ShoeBot, an online shoe store. Be friendly, helpful, and informative."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const response = completion.choices[0]?.message?.content ||
      "I'm here to help with any questions about our shoes or shopping experience. What would you like to know?";

    return {
      response,
      intent: 'general_inquiry',
      entities: {}
    };

  } catch (error) {
    console.error('General inquiry error:', error);
    return {
      response: "I'm here to help! You can ask me about our shoes, shipping, returns, or anything else. What would you like to know?",
      intent: 'general_inquiry',
      entities: {}
    };
  }
}

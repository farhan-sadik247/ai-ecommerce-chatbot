import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthenticatedUser {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    await connectDB();

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch {
      return null;
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

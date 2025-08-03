import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { authenticateUser } from '@/utils/auth';
import { ApiResponse } from '@/types';

interface ProfileUpdateRequest {
  name: string;
  phone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Get full user data
    const fullUser = await User.findById(user._id).select('-password');
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: fullUser
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch profile'
    }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const profileData: ProfileUpdateRequest = await request.json();

    // Validate required fields
    if (!profileData.name || !profileData.shippingAddress.street || 
        !profileData.shippingAddress.city || !profileData.shippingAddress.state || 
        !profileData.shippingAddress.zipCode) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name and complete shipping address are required'
      }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        name: profileData.name,
        phone: profileData.phone,
        shippingAddress: profileData.shippingAddress
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update profile'
    }, { status: 500 });
  }
}

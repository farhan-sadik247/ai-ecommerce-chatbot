import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST() {
  try {
    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Logout successful'
    });

    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

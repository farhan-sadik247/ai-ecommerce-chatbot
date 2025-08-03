'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import './profile.scss';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Bangladesh'
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    // Fetch fresh profile data from API
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.success && data.data) {
          setProfile({
            name: data.data.name || '',
            email: data.data.email || '',
            phone: data.data.phone || '',
            shippingAddress: data.data.shippingAddress || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'Bangladesh'
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Fallback to user data from context
        if (user) {
          setProfile({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            shippingAddress: user.shippingAddress || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'Bangladesh'
            }
          });
        }
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [addressField]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Profile updated successfully! 🎉');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Update your personal information and shipping address</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Personal Information */}
          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                required
                disabled
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                placeholder="+880 1234 567890"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="form-section">
            <h2>Shipping Address</h2>
            
            <div className="form-group">
              <label htmlFor="street">Street Address *</label>
              <input
                type="text"
                id="street"
                name="address.street"
                value={profile.shippingAddress.street}
                onChange={handleInputChange}
                placeholder="House/Flat No, Road, Area"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="address.city"
                  value={profile.shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="Dhaka"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State/Division *</label>
                <select
                  id="state"
                  name="address.state"
                  value={profile.shippingAddress.state}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Division</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">ZIP/Postal Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="address.zipCode"
                  value={profile.shippingAddress.zipCode}
                  onChange={handleInputChange}
                  placeholder="1000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="address.country"
                  value={profile.shippingAddress.country}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </form>

        {/* Chat Integration Note */}
        <div className="chat-note">
          <h3>💬 Chat Checkout</h3>
          <p>
            Once you&apos;ve updated your profile, you can use the chat assistant to complete purchases!
            Just say <strong>&quot;I&apos;m ready to checkout&quot;</strong> and your order will be processed with
            Cash on Delivery using the address above.
          </p>
        </div>
      </div>
    </div>
  );
}

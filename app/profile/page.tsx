'use client';

import { useState, useEffect } from 'react';
import PrivateRoute from '@/components/PrivateRoute';
import { useAuth } from '@/components/AuthProvider';

export default function Profile() {
  return (
    <PrivateRoute>
      <ProfileContent />
    </PrivateRoute>
  );
}

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    cookingSkillLevel: 'beginner',
    dietaryPreferences: [] as string[],
    allergies: [] as string[],
    preferredIngredients: [] as string[],
    avoidedIngredients: [] as string[],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setMessage('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const profile = await response.json();
          updateUser(profile);
          setFormData({
            name: profile.name || '',
            cookingSkillLevel: profile.cookingSkillLevel || 'beginner',
            dietaryPreferences: profile.profile?.dietaryPreferences || [],
            allergies: profile.profile?.allergies || [],
            preferredIngredients: profile.profile?.preferredIngredients || [],
            avoidedIngredients: profile.profile?.avoidedIngredients || [],
          });
        } else {
          const errorData = await response.json();
          setMessage('Failed to load profile: ' + (errorData.error || 'Unknown error'));
        }
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        setMessage('Failed to load profile: ' + errorMsg);
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user exists and hasn't already been loaded
    if (user && !formData.name) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setMessage('No authentication token found');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updated = await response.json();
        updateUser(updated);
        setMessage('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        setMessage('Failed to update profile: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setMessage('Failed to update profile: ' + errorMsg);
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Skill Level</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.cookingSkillLevel}
            onChange={(e) => setFormData({ ...formData, cookingSkillLevel: e.target.value })}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Similar form fields for dietary preferences, allergies, etc. */}
        {/* Keeping it concise - full implementation would include all fields */}

        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}


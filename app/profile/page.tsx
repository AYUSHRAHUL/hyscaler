'use client';

import { useState, useEffect } from 'react';
import PrivateRoute from '@/components/PrivateRoute';
import { useAuth } from '@/components/AuthProvider';
import { FiX, FiPlus } from 'react-icons/fi';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Halal', 'Kosher'];
const COMMON_ALLERGIES = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame'];
const COMMON_INGREDIENTS = ['Chicken', 'Beef', 'Fish', 'Pasta', 'Rice', 'Beans', 'Tomato', 'Garlic', 'Onion', 'Bell Pepper'];

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

  const [newDietaryPref, setNewDietaryPref] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newPreferredIng, setNewPreferredIng] = useState('');
  const [newAvoidedIng, setNewAvoidedIng] = useState('');

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
      } finally {
        setLoading(false);
      }
    };

    if (user && !formData.name) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = (field: keyof typeof formData, value: string, setter: (val: string) => void) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value.trim()],
      });
      setter('');
    }
  };

  const removeItem = (field: keyof typeof formData, item: string) => {
    const fieldValue = formData[field];
    if (Array.isArray(fieldValue)) {
      setFormData({
        ...formData,
        [field]: fieldValue.filter((i) => i !== item),
      });
    }
  };

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
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage('Failed to update profile: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setMessage('Failed to update profile: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-light text-gray-900">Your Profile</h1>
          <p className="text-gray-600 mt-1">Manage your preferences and dietary requirements</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 rounded-lg p-4 border ${
              message.includes('success') 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Skill Level</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  value={formData.cookingSkillLevel}
                  onChange={(e) => setFormData({ ...formData, cookingSkillLevel: e.target.value })}
                >
                  <option value="beginner">Beginner - Simple recipes with basic ingredients</option>
                  <option value="intermediate">Intermediate - Comfortable with standard techniques</option>
                  <option value="advanced">Advanced - Experienced with complex recipes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Dietary Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.dietaryPreferences.map((pref) => (
                  <span key={pref} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                    {pref}
                    <button
                      type="button"
                      onClick={() => removeItem('dietaryPreferences', pref)}
                      className="hover:text-blue-900"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <select
                  value={newDietaryPref}
                  onChange={(e) => setNewDietaryPref(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">Select dietary preference...</option>
                  {DIETARY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} disabled={formData.dietaryPreferences.includes(opt)}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => addItem('dietaryPreferences', newDietaryPref, setNewDietaryPref)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 font-medium text-sm"
                >
                  <FiPlus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Allergies & Intolerances</h2>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.allergies.map((allergy) => (
                  <span key={allergy} className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-200">
                    {allergy}
                    <button
                      type="button"
                      onClick={() => removeItem('allergies', allergy)}
                      className="hover:text-red-900"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <select
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">Select allergy...</option>
                  {COMMON_ALLERGIES.map((opt) => (
                    <option key={opt} value={opt} disabled={formData.allergies.includes(opt)}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => addItem('allergies', newAllergy, setNewAllergy)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 font-medium text-sm"
                >
                  <FiPlus className="w-4 h-4" /> Add
                </button>
              </div>

              <input
                type="text"
                placeholder="Or type a custom allergy..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('allergies', newAllergy, setNewAllergy);
                  }
                }}
              />
            </div>
          </div>

          {/* Preferred Ingredients */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferred Ingredients</h2>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.preferredIngredients.map((ingredient) => (
                  <span key={ingredient} className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeItem('preferredIngredients', ingredient)}
                      className="hover:text-green-900"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <select
                  value={newPreferredIng}
                  onChange={(e) => setNewPreferredIng(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">Select ingredient...</option>
                  {COMMON_INGREDIENTS.map((opt) => (
                    <option key={opt} value={opt} disabled={formData.preferredIngredients.includes(opt)}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => addItem('preferredIngredients', newPreferredIng, setNewPreferredIng)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 font-medium text-sm"
                >
                  <FiPlus className="w-4 h-4" /> Add
                </button>
              </div>

              <input
                type="text"
                placeholder="Or type a custom ingredient..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newPreferredIng}
                onChange={(e) => setNewPreferredIng(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('preferredIngredients', newPreferredIng, setNewPreferredIng);
                  }
                }}
              />
            </div>
          </div>

          {/* Ingredients to Avoid */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Ingredients to Avoid</h2>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.avoidedIngredients.map((ingredient) => (
                  <span key={ingredient} className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeItem('avoidedIngredients', ingredient)}
                      className="hover:text-yellow-900"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type ingredient to avoid..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={newAvoidedIng}
                  onChange={(e) => setNewAvoidedIng(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('avoidedIngredients', newAvoidedIng, setNewAvoidedIng);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addItem('avoidedIngredients', newAvoidedIng, setNewAvoidedIng)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 font-medium text-sm"
                >
                  <FiPlus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold text-base"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


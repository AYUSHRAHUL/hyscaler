'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PrivateRoute from '@/components/PrivateRoute';
import { useAuth } from '@/components/AuthProvider';
import { FiStar, FiClock, FiUsers } from 'react-icons/fi';

interface Recipe {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  rating?: {
    average: number | null;
    count: number;
  };
}

interface SearchResults {
  recipes: Recipe[];
  results?: number;
}

export default function Recipes() {
  return (
    <PrivateRoute>
      <RecipesContent />
    </PrivateRoute>
  );
}

function RecipesContent() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [type, setType] = useState('');
  const [maxReadyTime, setMaxReadyTime] = useState('');

  useEffect(() => {
    fetchRandomRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRandomRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/recipes/random?number=12', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as SearchResults;
        setRecipes(data.recipes || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load recipes');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError('Failed to load recipes: ' + errorMsg);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (cuisine) params.append('cuisine', cuisine);
      if (diet) params.append('diet', diet);
      if (type) params.append('type', type);
      if (maxReadyTime) params.append('maxReadyTime', maxReadyTime);
      params.append('number', '12');

      const response = await fetch(`/api/recipes/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as SearchResults;
        setRecipes(data.recipes || []);
        if (!data.recipes || data.recipes.length === 0) {
          setError('No recipes found. Try adjusting your filters.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to search recipes');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError('Failed to search recipes: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-light text-gray-900">Discover Recipes</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pasta, chicken, dessert..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Cuisine
                </label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">All</option>
                  <option value="italian">Italian</option>
                  <option value="mexican">Mexican</option>
                  <option value="chinese">Chinese</option>
                  <option value="indian">Indian</option>
                  <option value="american">American</option>
                  <option value="asian">Asian</option>
                  <option value="thai">Thai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Diet
                </label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">All</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten Free</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Meal Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">All</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Max Time (min)
                </label>
                <input
                  type="number"
                  value={maxReadyTime}
                  onChange={(e) => setMaxReadyTime(e.target.value)}
                  placeholder="e.g., 30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={fetchRandomRecipes}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  title="Show random recipes"
                >
                  🔄
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading recipes...</p>
            </div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No recipes found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
              >
                {/* Recipe Image */}
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                </div>

                {/* Recipe Info */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 h-12">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    {recipe.readyInMinutes && (
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        <span>{recipe.readyInMinutes}m</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <FiUsers className="w-4 h-4" />
                        <span>{recipe.servings}</span>
                      </div>
                    )}
                    {recipe.rating && (
                      <div className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 fill-orange-400 text-orange-400" />
                        <span>{recipe.rating.average?.toFixed(1) || 0} ({recipe.rating.count})</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

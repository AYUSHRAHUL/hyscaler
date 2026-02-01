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
        const data = await response.json();
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
      params.append('number', '12');

      const response = await fetch(`/api/recipes/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecipes(data.results || []);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Recipes</h1>
          <p className="text-gray-600 mb-6">
            Welcome, {user?.name}! Browse and discover delicious recipes.
          </p>

          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
              >
                Search
              </button>
            </div>

            <button
              type="button"
              onClick={fetchRandomRecipes}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Show Random Recipes
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No recipes found. Try a different search!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    {recipe.readyInMinutes && (
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {recipe.readyInMinutes} min
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <FiUsers className="w-4 h-4" />
                        {recipe.servings} servings
                      </div>
                    )}
                  </div>

                  {recipe.rating && (
                    <div className="flex items-center gap-2">
                      <FiStar className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {recipe.rating.average !== null
                          ? recipe.rating.average.toFixed(1)
                          : 'No ratings'}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

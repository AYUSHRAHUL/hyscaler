'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PrivateRoute from '@/components/PrivateRoute';
import { FiStar, FiClock, FiUsers, FiArrowLeft } from 'react-icons/fi';

interface RecipeDetails {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  summary?: string;
  ingredients?: Array<{
    original: string;
  }>;
  instructions?: string;
  rating?: {
    average: number | null;
    count: number;
  };
  userRating?: number;
}

interface Review {
  id: string;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export default function RecipeDetail() {
  return (
    <PrivateRoute>
      <RecipeDetailContent />
    </PrivateRoute>
  );
}

function RecipeDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const recipeId = params?.id as string;

  useEffect(() => {
    if (recipeId) {
      fetchRecipeDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecipeDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/recipes/${recipeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as RecipeDetails;
        setRecipe(data);
        if (data.userRating) {
          setRating(data.userRating);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load recipe');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError('Failed to load recipe: ' + errorMsg);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (value: number) => {
    setRatingLoading(true);
    setRatingMessage('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/recipes/${recipeId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: value }),
      });

      if (response.ok) {
        setRating(value);
        setRatingMessage('Rating saved!');
        setTimeout(() => setRatingMessage(''), 2000);
        // Refresh recipe to show updated average rating
        fetchRecipeDetails();
      } else {
        const errorData = await response.json();
        setRatingMessage('Error: ' + (errorData.error || 'Failed to save rating'));
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setRatingMessage('Error: ' + errorMsg);
    } finally {
      setRatingLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/recipes/${recipeId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || reviewComment.length < 10) {
      setReviewMessage('Review must be at least 10 characters');
      return;
    }

    setReviewLoading(true);
    setReviewMessage('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/recipes/${recipeId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: reviewComment }),
      });

      if (response.ok) {
        setReviewComment('');
        setReviewMessage('Review posted successfully!');
        setTimeout(() => setReviewMessage(''), 2000);
        fetchReviews();
      } else {
        const errorData = await response.json();
        setReviewMessage('Error: ' + (errorData.error || 'Failed to post review'));
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setReviewMessage('Error: ' + errorMsg);
    } finally {
      setReviewLoading(false);
    }
  };

  // Fetch reviews when recipe details load
  useEffect(() => {
    if (recipeId) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <FiArrowLeft /> Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error || 'Recipe not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Recipe Image */}
          {recipe.image && (
            <div className="w-full aspect-video overflow-hidden">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Title and Basic Info */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{recipe.title}</h1>

            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
              {recipe.readyInMinutes && (
                <div className="flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-primary-600" />
                  <span className="text-lg text-gray-700">
                    {recipe.readyInMinutes} minutes
                  </span>
                </div>
              )}

              {recipe.servings && (
                <div className="flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-primary-600" />
                  <span className="text-lg text-gray-700">
                    {recipe.servings} servings
                  </span>
                </div>
              )}

              {/* Rating Section */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FiStar className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-medium">
                    {recipe.rating?.average !== null
                      ? recipe.rating?.average?.toFixed(1)
                      : 'No ratings'}
                  </span>
                  {recipe.rating?.count && (
                    <span className="text-sm text-gray-500">
                      ({recipe.rating.count} ratings)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Your Rating */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate this recipe</h3>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      disabled={ratingLoading}
                      className={`p-2 rounded transition ${
                        rating >= star
                          ? 'text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-300'
                      } ${ratingLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <FiStar className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                {ratingMessage && (
                  <span className="text-sm text-green-600 font-medium">
                    {ratingMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            {recipe.summary && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                <div
                  className="text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: recipe.summary }}
                />
              </div>
            )}

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-700">
                      <input
                        type="checkbox"
                        className="mr-2 cursor-pointer"
                      />
                      {ingredient.original}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {recipe.instructions && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
                <div
                  className="text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                />
              </div>
            )}

            {/* Source Link */}
            {recipe.sourceUrl && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  View Full Recipe
                </a>
              </div>
            )}

            {/* Reviews Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Reviews ({reviews.length})</h3>

              {/* Review Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Your Review</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review (at least 10 characters)..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={4}
                  />
                  {reviewMessage && (
                    <div
                      className={`p-3 rounded-lg ${
                        reviewMessage.includes('successfully')
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {reviewMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 font-medium"
                  >
                    {reviewLoading ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-900">{review.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

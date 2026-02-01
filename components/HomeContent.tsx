'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { FiCheck, FiFilter, FiStar, FiTrendingUp } from 'react-icons/fi';

export default function HomeContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 mb-6">
            <FiCheck className="w-6 h-6 text-orange-600" />
          </div>
          <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-6">
            Find recipes that match
            <span className="font-semibold block text-orange-600 mt-2">your taste & preferences</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Discover personalized recipes tailored to your dietary needs, cooking style, and available ingredients. Join thousands of home cooks simplifying meal planning.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
          {user && (
            <Link
              href="/recipes"
              className="inline-block px-8 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Explore Recipes
            </Link>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors mb-4">
                <FiCheck className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Smart Profiles</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Set your dietary preferences, allergies, and skill level for personalized suggestions.
              </p>
            </div>

            <div className="group">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors mb-4">
                <FiFilter className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Advanced Filters</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Filter by cuisine, cook time, meal type, and dietary requirements in seconds.
              </p>
            </div>

            <div className="group">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors mb-4">
                <FiStar className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Community Ratings</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                See real ratings and reviews from people who have already cooked the recipe.
              </p>
            </div>

            <div className="group">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors mb-4">
                <FiTrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Popular Picks</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Discover trending recipes that match your preferences and cooking experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-12 text-center border border-orange-200">
            <h2 className="text-3xl font-light text-gray-900 mb-3">
              Ready to explore <span className="font-semibold">delicious recipes</span>?
            </h2>
            <p className="text-gray-600 mb-8">
              Create your account in less than a minute and start discovering recipes tailored just for you.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


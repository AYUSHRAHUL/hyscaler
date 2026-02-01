'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { FiUser, FiSearch, FiStar, FiUsers } from 'react-icons/fi';

export default function HomeContent() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-4">
          Discover Your Perfect
          <span className="text-primary-600"> Recipe</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Get personalized recipe recommendations based on your dietary preferences, ingredient availability, and cooking skills.
        </p>
        {!user && (
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-16">
        <div className="bg-white rounded-lg shadow-md p-6">
          <FiUser className="h-12 w-12 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Profiles</h3>
          <p className="text-gray-600">
            Create your profile with dietary preferences, allergies, and cooking skill level for tailored recommendations.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <FiSearch className="h-12 w-12 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Search</h3>
          <p className="text-gray-600">
            Search and filter recipes by cuisine, meal type, cooking time, and dietary requirements.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <FiStar className="h-12 w-12 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ratings & Reviews</h3>
          <p className="text-gray-600">
            Rate and review recipes you have tried, and see what others think before you cook.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <FiUsers className="h-12 w-12 text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Driven</h3>
          <p className="text-gray-600">
            Join a community of food lovers sharing their cooking experiences and favorite recipes.
          </p>
        </div>
      </div>

      {user && (
        <div className="mt-16 text-center">
          <Link
            href="/recipes"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Start Exploring Recipes
          </Link>
        </div>
      )}
    </div>
  );
}


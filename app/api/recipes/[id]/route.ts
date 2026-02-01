import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { spoonacularService } from '@/lib/spoonacular';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const recipeId = parseInt(params.id);
    if (isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    const recipe = await spoonacularService.getRecipeById(recipeId);

    // Get average rating
    const ratingStats = await prisma.rating.groupBy({
      by: ['recipeId'],
      where: { recipeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const rating = ratingStats[0]
      ? { average: ratingStats[0]._avg.rating, count: ratingStats[0]._count }
      : { average: null, count: 0 };

    // Check if user has rated this recipe
    let userRating = null;
    if (authUser) {
      const userRatingRecord = await prisma.rating.findUnique({
        where: {
          userId_recipeId: {
            userId: authUser.userId,
            recipeId,
          },
        },
      });
      userRating = userRatingRecord?.rating || null;
    }

    return NextResponse.json({
      ...recipe,
      rating,
      userRating,
    });
  } catch (error: unknown) {
    console.error('Get recipe error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || 'Failed to get recipe' },
      { status: 500 }
    );
  }
}


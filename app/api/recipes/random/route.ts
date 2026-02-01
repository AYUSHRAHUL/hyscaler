import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { spoonacularService } from '@/lib/spoonacular';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const number = searchParams.get('number') ? parseInt(searchParams.get('number')!) : 10;
    const tags = searchParams.get('tags') || undefined;

    const results = await spoonacularService.getRandomRecipes(number, tags);
    
    // Get ratings for recipes
    if (results.recipes && results.recipes.length > 0) {
      const recipeIds = results.recipes.map((r: unknown) => (r as { id: number }).id);
      const ratings = await prisma.rating.groupBy({
        by: ['recipeId'],
        where: { recipeId: { in: recipeIds } },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const ratingsMap = new Map(
        ratings.map((r) => [r.recipeId, { average: r._avg.rating, count: r._count }])
      );

      results.recipes = results.recipes.map((recipe: unknown) => {
        const rec = recipe as Record<string, unknown>;
        const id = (rec.id as number) ?? null;
        return {
          ...rec,
          rating: id !== null ? (ratingsMap.get(id) || { average: null, count: 0 }) : { average: null, count: 0 },
        };
      });
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error('Get random recipes error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || 'Failed to get random recipes' },
      { status: 500 }
    );
  }
}


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

    // Get user profile for personalized filtering
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { profile: true },
    });

    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('query') || undefined;
    const cuisine = searchParams.get('cuisine') || undefined;
    const diet = searchParams.get('diet') || undefined;
    const type = searchParams.get('type') || undefined;
    const maxReadyTime = searchParams.get('maxReadyTime') ? parseInt(searchParams.get('maxReadyTime')!) : undefined;
    const intolerances = searchParams.get('intolerances') || undefined;
    const includeIngredients = searchParams.get('includeIngredients') || undefined;
    const excludeIngredients = searchParams.get('excludeIngredients') || undefined;
    const number = searchParams.get('number') ? parseInt(searchParams.get('number')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Build search parameters
    const params: Record<string, unknown> = {
      number,
      offset,
    };

    if (searchQuery) params.query = searchQuery;
    if (cuisine) params.cuisine = cuisine;
    if (diet) params.diet = diet;
    if (type) params.type = type;
    if (maxReadyTime) params.maxReadyTime = maxReadyTime;
    if (intolerances) params.intolerances = intolerances;
    if (includeIngredients) params.includeIngredients = includeIngredients;
    if (excludeIngredients) params.excludeIngredients = excludeIngredients;

    // Apply user preferences if available
    if (user?.profile) {
      if (user.profile.dietaryPreferences.length > 0 && !diet) {
        params.diet = user.profile.dietaryPreferences[0].toLowerCase();
      }
      
      if (user.profile.allergies.length > 0 && !intolerances) {
        params.intolerances = user.profile.allergies.join(',');
      }
      
      if (user.profile.preferredIngredients.length > 0 && !includeIngredients) {
        params.includeIngredients = user.profile.preferredIngredients.join(',');
      }
      
      if (user.profile.avoidedIngredients.length > 0 && !excludeIngredients) {
        params.excludeIngredients = user.profile.avoidedIngredients.join(',');
      }
    }

    const results = await spoonacularService.searchRecipes(params);
    
    // Get ratings for recipes
    if (results.results && results.results.length > 0) {
      const recipeIds = results.results.map((r: unknown) => (r as { id: number }).id);
      const ratings = await prisma.rating.groupBy({
        by: ['recipeId'],
        where: { recipeId: { in: recipeIds } },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const ratingsMap = new Map(
        ratings.map((r) => [r.recipeId, { average: r._avg.rating, count: r._count }])
      );

      results.results = results.results.map((recipe: unknown) => {
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
    console.error('Search recipes error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || 'Failed to search recipes' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const rateSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

export async function POST(
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

    const body = await request.json();
    const validated = rateSchema.parse(body);

    // Upsert rating
    const ratingRecord = await prisma.rating.upsert({
      where: {
        userId_recipeId: {
          userId: authUser.userId,
          recipeId,
        },
      },
      update: {
        rating: validated.rating,
      },
      create: {
        userId: authUser.userId,
        recipeId,
        rating: validated.rating,
      },
    });

    // Get updated average rating
    const ratingStats = await prisma.rating.groupBy({
      by: ['recipeId'],
      where: { recipeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const stats = ratingStats[0]
      ? { average: ratingStats[0]._avg.rating, count: ratingStats[0]._count }
      : { average: null, count: 0 };

    return NextResponse.json({
      rating: ratingRecord.rating,
      average: stats.average,
      count: stats.count,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Rate recipe error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || 'Failed to rate recipe' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipeId = parseInt(params.id);
    if (isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    const ratingStats = await prisma.rating.groupBy({
      by: ['recipeId'],
      where: { recipeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const stats = ratingStats[0]
      ? { average: ratingStats[0]._avg.rating, count: ratingStats[0]._count }
      : { average: null, count: 0 };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get ratings error:', error);
    return NextResponse.json(
      { error: 'Failed to get ratings' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  cookingSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  preferredIngredients: z.array(z.string()).optional(),
  avoidedIngredients: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    // Update user
    const userUpdateData: {
      name?: string;
      cookingSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
    } = {};

    if (validated.name) userUpdateData.name = validated.name;
    if (validated.cookingSkillLevel) userUpdateData.cookingSkillLevel = validated.cookingSkillLevel;

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: authUser.userId },
        data: userUpdateData,
      });
    }

    // Update or create profile
    const profileUpdateData: {
      dietaryPreferences?: string[];
      allergies?: string[];
      preferredIngredients?: string[];
      avoidedIngredients?: string[];
    } = {};

    if (validated.dietaryPreferences !== undefined) profileUpdateData.dietaryPreferences = validated.dietaryPreferences;
    if (validated.allergies !== undefined) profileUpdateData.allergies = validated.allergies;
    if (validated.preferredIngredients !== undefined) profileUpdateData.preferredIngredients = validated.preferredIngredients;
    if (validated.avoidedIngredients !== undefined) profileUpdateData.avoidedIngredients = validated.avoidedIngredients;

    if (Object.keys(profileUpdateData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: authUser.userId },
        update: profileUpdateData,
        create: {
          userId: authUser.userId,
          dietaryPreferences: validated.dietaryPreferences || [],
          allergies: validated.allergies || [],
          preferredIngredients: validated.preferredIngredients || [],
          avoidedIngredients: validated.avoidedIngredients || [],
        },
      });
    }

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { profile: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Update profile error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}


import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo user...');

  // Check if demo user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@recipe.com' },
  });

  if (existingUser) {
    console.log('Demo user already exists');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@recipe.com',
      password: hashedPassword,
      name: 'Demo User',
      cookingSkillLevel: 'intermediate',
    },
  });

  // Create demo profile
  await prisma.userProfile.create({
    data: {
      userId: user.id,
      dietaryPreferences: ['vegetarian'],
      allergies: ['peanuts'],
      preferredIngredients: ['tomatoes', 'basil', 'cheese'],
      avoidedIngredients: ['mushrooms'],
    },
  });

  console.log('Demo user created successfully!');
  console.log('Email: demo@recipe.com');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


# Recipe Management System - Next.js

A comprehensive recipe management system built with Next.js that suggests personalized recipes to users based on their dietary preferences, ingredient availability, and cooking habits.

## Features

- **User Profile Management**: Registration, dietary preferences, allergies, and cooking skill levels
- **Recipe Database Integration**: Integration with Spoonacular API with intelligent caching
- **Advanced Search & Filtering**: Search by cuisine, meal type, cooking time, dietary requirements, and ingredients
- **Rating & Reviews**: Rate and review recipes with average ratings displayed

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT-based
- **Styling**: Tailwind CSS
- **Caching**: Node-cache for API responses

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up MongoDB**:
   - **Option A: Local MongoDB**: Install MongoDB locally and ensure it's running
   - **Option B: MongoDB Atlas**: Create a free cluster at https://www.mongodb.com/cloud/atlas

3. **Set up environment variables**:

Create `.env` file in the root directory:
```
DATABASE_URL="mongodb://localhost:27017/recipe-manager"
# Or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/recipe-manager?retryWrites=true&w=majority"
JWT_SECRET="your-secret-key-change-in-production"
SPOONACULAR_API_KEY="your-spoonacular-api-key"
```

Get your Spoonacular API key from: https://spoonacular.com/food-api

4. **Initialize database**:
```bash
npx prisma generate
```

Note: MongoDB doesn't require migrations like SQL databases. The schema is applied automatically when you first run the application.

5. **Create demo user (optional)**:
```bash
npm run seed:demo
```

This will create a demo user with:
- Email: `demo@recipe.com`
- Password: `demo123`
- Pre-configured profile with sample preferences

6. **Run the application**:
```bash
npm run dev
```

The application will run on `http://localhost:3000`

## Demo Login

You can use the demo account to test the application:
- **Email**: `demo@recipe.com`
- **Password**: `demo123`

Or click the "Login as Demo User" button on the login page.

## Project Structure

```
recipe-manager-nextjs/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── users/        # User profile endpoints
│   │   └── recipes/      # Recipe endpoints
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── profile/          # User profile page
│   ├── recipes/          # Recipe pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
├── lib/                  # Utility functions
│   ├── auth.ts          # Authentication utilities
│   ├── prisma.ts        # Prisma client
│   ├── spoonacular.ts   # Spoonacular API service
│   └── cache.ts          # Caching service
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Recipes
- `GET /api/recipes/search` - Search recipes with filters
- `GET /api/recipes/[id]` - Get recipe details
- `GET /api/recipes/random` - Get random recipes

### Ratings & Reviews
- `POST /api/recipes/[id]/ratings` - Rate a recipe
- `GET /api/recipes/[id]/ratings` - Get ratings for a recipe
- `POST /api/recipes/[id]/reviews` - Add a review
- `GET /api/recipes/[id]/reviews` - Get reviews for a recipe

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio to view database

## License

MIT

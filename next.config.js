/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY,
  },
}

module.exports = nextConfig


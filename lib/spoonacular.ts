import axios from 'axios';
import { cacheService } from './cache';

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = process.env.SPOONACULAR_API_KEY;

interface RecipeSearchParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  type?: string;
  maxReadyTime?: number;
  intolerances?: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  number?: number;
  offset?: number;
}

class SpoonacularService {
  private async makeRequest(endpoint: string, params: Record<string, unknown> = {}) {
    const cacheKey = `spoonacular:${endpoint}:${JSON.stringify(params)}`;
    
    // Check cache first
    const cached = cacheService.get<unknown>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${SPOONACULAR_BASE_URL}${endpoint}`, {
        params: {
          ...params,
          apiKey: API_KEY,
        },
      });

      // Cache the response
      cacheService.set(cacheKey, response.data, 3600); // Cache for 1 hour
      
      return response.data;
    } catch (error: unknown) {
      const details = (error as { response?: { data?: unknown } })?.response?.data || (error instanceof Error ? error.message : String(error));
      console.error('Spoonacular API error:', details);
      throw new Error('Failed to fetch recipe data');
    }
  }

  async searchRecipes(params: RecipeSearchParams) {
    const searchParams = {} as Record<string, unknown>;
    
    if (params.query) searchParams.query = params.query;
    if (params.cuisine) searchParams.cuisine = params.cuisine;
    if (params.diet) searchParams.diet = params.diet;
    if (params.type) searchParams.type = params.type;
    if (params.maxReadyTime) searchParams.maxReadyTime = params.maxReadyTime;
    if (params.intolerances) searchParams.intolerances = params.intolerances;
    if (params.includeIngredients) searchParams.includeIngredients = params.includeIngredients;
    if (params.excludeIngredients) searchParams.excludeIngredients = params.excludeIngredients;
    if (params.number) searchParams.number = params.number;
    if (params.offset) searchParams.offset = params.offset;

    return this.makeRequest('/complexSearch', searchParams);
  }

  async getRecipeById(id: number, includeNutrition: boolean = true) {
    return this.makeRequest(`/${id}/information`, {
      includeNutrition: includeNutrition.toString(),
    });
  }

  async getRandomRecipes(number: number = 10, tags?: string) {
    const params = { number } as Record<string, unknown>;
    if (tags) params.tags = tags;
    return this.makeRequest('/random', params);
  }
}

export const spoonacularService = new SpoonacularService();


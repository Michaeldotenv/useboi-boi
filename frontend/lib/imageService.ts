// Image service for fetching relevant category images from Unsplash
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'your_unsplash_access_key';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export interface ImageResult {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
}

export interface CategoryImages {
  [category: string]: ImageResult[];
}

// Food-specific category mapping for better image search results
const CATEGORY_KEYWORDS: { [key: string]: string[] } = {
  'african': ['african food', 'jollof rice', 'egusi soup', 'nigerian cuisine', 'traditional african meal'],
  'chinese': ['chinese food', 'fried rice', 'chow mein', 'dim sum', 'chinese cuisine'],
  'indian': ['indian food', 'curry', 'biryani', 'naan bread', 'indian cuisine'],
  'italian': ['italian food', 'pasta', 'pizza', 'risotto', 'italian cuisine'],
  'mexican': ['mexican food', 'tacos', 'burritos', 'quesadilla', 'mexican cuisine'],
  'american': ['american food', 'burger', 'fries', 'hot dog', 'american cuisine'],
  'thai': ['thai food', 'pad thai', 'tom yum', 'green curry', 'thai cuisine'],
  'japanese': ['japanese food', 'sushi', 'ramen', 'tempura', 'japanese cuisine'],
  'korean': ['korean food', 'kimchi', 'bulgogi', 'korean bbq', 'korean cuisine'],
  'mediterranean': ['mediterranean food', 'hummus', 'falafel', 'gyros', 'mediterranean cuisine'],
  'fast food': ['fast food', 'burger', 'fries', 'chicken', 'quick meal'],
  'desserts': ['desserts', 'cake', 'ice cream', 'sweets', 'pastry'],
  'beverages': ['drinks', 'smoothie', 'juice', 'coffee', 'tea'],
  'snacks': ['snacks', 'chips', 'nuts', 'crackers', 'appetizers'],
  'healthy': ['healthy food', 'salad', 'smoothie bowl', 'vegan', 'organic'],
  'seafood': ['seafood', 'fish', 'shrimp', 'crab', 'lobster'],
  'vegetarian': ['vegetarian food', 'veggie burger', 'salad', 'vegetable curry', 'plant based'],
  'grilled': ['grilled food', 'bbq', 'grilled chicken', 'steak', 'grilled vegetables'],
  'soup': ['soup', 'broth', 'stew', 'ramen', 'pho'],
  'rice': ['rice dishes', 'fried rice', 'rice bowl', 'paella', 'risotto'],
  'noodles': ['noodles', 'pasta', 'ramen', 'udon', 'spaghetti'],
  'pizza': ['pizza', 'margherita', 'pepperoni', 'neapolitan', 'wood fired'],
  'burger': ['burger', 'cheeseburger', 'chicken burger', 'veggie burger', 'gourmet burger'],
  'sandwich': ['sandwich', 'submarine', 'panini', 'club sandwich', 'wraps'],
  'salad': ['salad', 'caesar salad', 'greek salad', 'green salad', 'fruit salad'],
  'breakfast': ['breakfast', 'pancakes', 'waffles', 'eggs', 'bacon'],
  'lunch': ['lunch', 'business lunch', 'casual dining', 'quick lunch', 'lunch special'],
  'dinner': ['dinner', 'fine dining', 'dinner plate', 'evening meal', 'dinner special']
};

// Cache for storing fetched images
const imageCache = new Map<string, ImageResult[]>();

export async function fetchCategoryImages(category: string, count: number = 5): Promise<ImageResult[]> {
  // Check cache first
  const cacheKey = `${category}_${count}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    // Get keywords for the category
    const keywords = CATEGORY_KEYWORDS[category.toLowerCase()] || [category.toLowerCase()];
    const searchQuery = keywords.join(' ');

    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`,
      {
        headers: {
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch images for category: ${category}`);
      return getDefaultImages(count);
    }

    const data = await response.json();
    const images = data.results || [];

    // Cache the results
    imageCache.set(cacheKey, images);

    return images;
  } catch (error) {
    console.warn(`Error fetching images for category ${category}:`, error);
    return getDefaultImages(count);
  }
}

export async function fetchStoreImages(storeName: string, count: number = 3): Promise<ImageResult[]> {
  const cacheKey = `store_${storeName}_${count}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    // Food-specific search terms for restaurants
    const foodTerms = ['restaurant', 'food delivery', 'dining', 'kitchen', 'chef', 'food service'];
    const searchQuery = `${storeName} ${foodTerms.join(' ')}`;
    
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`,
      {
        headers: {
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) {
      return getDefaultFoodImages(count);
    }

    const data = await response.json();
    const images = data.results || [];
    imageCache.set(cacheKey, images);

    return images;
  } catch (error) {
    console.warn(`Error fetching store images for ${storeName}:`, error);
    return getDefaultFoodImages(count);
  }
}

export async function fetchProductImages(productName: string, category: string, count: number = 3): Promise<ImageResult[]> {
  const cacheKey = `product_${productName}_${category}_${count}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    // Enhanced food-specific search
    const categoryKeywords = CATEGORY_KEYWORDS[category.toLowerCase()] || [category.toLowerCase()];
    const foodTerms = ['food', 'dish', 'meal', 'cuisine', 'delicious'];
    const searchQuery = `${productName} ${categoryKeywords.join(' ')} ${foodTerms.join(' ')}`;
    
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=square&client_id=${UNSPLASH_ACCESS_KEY}`,
      {
        headers: {
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) {
      return getDefaultFoodImages(count);
    }

    const data = await response.json();
    const images = data.results || [];
    imageCache.set(cacheKey, images);

    return images;
  } catch (error) {
    console.warn(`Error fetching product images for ${productName}:`, error);
    return getDefaultFoodImages(count);
  }
}

// Food-specific default images when API fails
function getDefaultFoodImages(count: number): ImageResult[] {
  const foodImages = [
    {
      id: 'food_1',
      urls: {
        small: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
        regular: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center',
        full: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200&h=900&fit=crop&crop=center',
        thumb: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=150&fit=crop&crop=center'
      },
      alt_description: 'Delicious food dish',
      description: 'Appetizing food presentation'
    },
    {
      id: 'food_2',
      urls: {
        small: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop&crop=center',
        regular: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop&crop=center',
        full: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=900&fit=crop&crop=center',
        thumb: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=150&fit=crop&crop=center'
      },
      alt_description: 'Fresh healthy meal',
      description: 'Fresh and healthy food'
    },
    {
      id: 'food_3',
      urls: {
        small: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&crop=center',
        regular: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop&crop=center',
        full: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=900&fit=crop&crop=center',
        thumb: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=150&fit=crop&crop=center'
      },
      alt_description: 'Gourmet restaurant dish',
      description: 'Gourmet restaurant food'
    },
    {
      id: 'food_4',
      urls: {
        small: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop&crop=center',
        regular: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800&h=600&fit=crop&crop=center',
        full: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=1200&h=900&fit=crop&crop=center',
        thumb: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=200&h=150&fit=crop&crop=center'
      },
      alt_description: 'Traditional cuisine',
      description: 'Traditional delicious food'
    },
    {
      id: 'food_5',
      urls: {
        small: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=300&fit=crop&crop=center',
        regular: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop&crop=center',
        full: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&h=900&fit=crop&crop=center',
        thumb: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=200&h=150&fit=crop&crop=center'
      },
      alt_description: 'Fast food delivery',
      description: 'Quick and tasty food'
    }
  ];

  const defaultImages: ImageResult[] = [];
  for (let i = 0; i < count; i++) {
    const imageIndex = i % foodImages.length;
    defaultImages.push(foodImages[imageIndex]);
  }
  
  return defaultImages;
}

// Legacy function for backward compatibility
function getDefaultImages(count: number): ImageResult[] {
  return getDefaultFoodImages(count);
}

// Utility function to get a random image from a category
export async function getRandomCategoryImage(category: string): Promise<ImageResult | null> {
  const images = await fetchCategoryImages(category, 10);
  if (images.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

// Utility function to get a random store image
export async function getRandomStoreImage(storeName: string): Promise<ImageResult | null> {
  const images = await fetchStoreImages(storeName, 5);
  if (images.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

// Utility function to get a random product image
export async function getRandomProductImage(productName: string, category: string): Promise<ImageResult | null> {
  const images = await fetchProductImages(productName, category, 5);
  if (images.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

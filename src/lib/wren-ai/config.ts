// WrenAI Configuration
export const WREN_AI_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_WREN_AI_URL || 'http://localhost:5555',
  endpoints: {
    ask: '/v1/asks',
    askDetails: '/v1/ask_details'
  } as const,
  defaultInstructions: [
    "Always include property_id in SELECT statements",
    "Format property links as http://localhost:3000/property/{property_id}",
    "Limit property recommendations to 5-10 results",
    "Include price, location, and key amenities",
    "Always return rating if available"
  ] as string[], // Explicitly type as mutable string array
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};

export const generateThreadId = (): string => {
  return 'thread_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
};

export const validateEnvironment = (): boolean => {
  if (!WREN_AI_CONFIG.baseUrl) {
    console.error('WrenAI base URL not configured');
    return false;
  }
  return true;
};
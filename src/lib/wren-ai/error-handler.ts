import { WrenAIError } from '@/types/wren-ai';

export class WrenAIErrorHandler {
  static handleAPIError(error: any, context: string): string {
    console.error(`WrenAI Error in ${context}:`, error);
    
    if (error.status === 500) {
      return "I'm experiencing technical difficulties. Please try again.";
    } else if (error.status === 400) {
      return "I didn't understand your request. Could you rephrase it?";
    } else if (error.status === 404) {
      return "I couldn't find any information matching your query.";
    } else if (error.status === 503) {
      return "The AI service is temporarily unavailable. Please try again in a moment.";
    }
    
    return "Something went wrong. Please try again later.";
  }

  static validateResponse(response: any): boolean {
    return response && response.query_id && typeof response.sql === 'string';
  }

  static createError(status: number, message: string, context?: string): WrenAIError {
    return {
      status,
      message,
      context
    };
  }
}
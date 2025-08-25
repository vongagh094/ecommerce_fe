import { 
  ChatbotResponse, 
  FormattedProperty, 
  PropertyResult,
  WrenAIAskRequest 
} from '@/types/wren-ai';
import { WrenAIApiClient } from './api-client';
import { WrenAIErrorHandler } from './error-handler';
import { WREN_AI_CONFIG, generateThreadId } from './config';

export class AirbnbChatbot {
  private apiClient: WrenAIApiClient;
  private currentThreadId: string;

  constructor() {
    this.apiClient = new WrenAIApiClient();
    this.currentThreadId = generateThreadId();
  }

  async processUserMessage(userMessage: string): Promise<ChatbotResponse> {
    try {
      // Step 1: Send query to WrenAI
      const askResponse = await this.askWrenAI(userMessage);

      // Step 2: Get detailed results
      const results = await this.getQueryDetails(askResponse.query_id);

      // Step 3: Format response for chatbot
      return this.formatChatbotResponse(results, askResponse);
    } catch (error: any) {
      console.error('Error processing message:', error);
      return {
        type: 'error',
        message: WrenAIErrorHandler.handleAPIError(error, 'processUserMessage')
      };
    }
  }

  private async askWrenAI(question: string) {
    const request: WrenAIAskRequest = {
      question,
      thread_id: this.currentThreadId,
      instructions: WREN_AI_CONFIG.defaultInstructions
    };

    return await this.apiClient.askQuestion(request);
  }

  private async getQueryDetails(queryId: string) {
    return await this.apiClient.getQueryDetails(queryId);
  }

  private formatChatbotResponse(
    results: any, 
    askResponse: any
  ): ChatbotResponse {
    if (results.error) {
      return {
        type: 'error',
        message: 'I couldn\'t find any properties matching your criteria.'
      };
    }

    // Format property results with links
    const properties: PropertyResult[] = results.data || [];
    const formattedProperties: FormattedProperty[] = properties.map(property => ({
      id: property.property_id,
      name: property.property_name,
      price: property.price_per_night,
      location: property.location,
      link: `${window.location.origin}/property/${property.property_id}`,
      rating: property.rating,
      imageUrl: property.image_url,
      amenities: property.amenities
    }));

    return {
      type: 'property_results',
      message: results.summary || askResponse.summary || `Found ${properties.length} properties`,
      properties: formattedProperties,
      sql_query: results.sql || askResponse.sql
    };
  }

  // Reset thread for new conversation
  resetThread(): void {
    this.currentThreadId = generateThreadId();
  }

  // Get current thread ID
  getCurrentThreadId(): string {
    return this.currentThreadId;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    return await this.apiClient.testConnection();
  }
}
import { 
  WrenAIAskRequest, 
  WrenAIAskResponse, 
  WrenAIQueryDetails,
  WrenAIError 
} from '@/types/wren-ai';
import { WREN_AI_CONFIG } from './config';
import { WrenAIErrorHandler } from './error-handler';

export class WrenAIApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = WREN_AI_CONFIG.baseUrl;
    this.timeout = WREN_AI_CONFIG.timeout;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`[WrenAI] Making request to: ${url}`);
    console.log(`[WrenAI] Request options:`, options);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      
      console.log(`[WrenAI] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[WrenAI] Error response:`, errorText);
        throw WrenAIErrorHandler.createError(
          response.status,
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
          endpoint
        );
      }

      const data = await response.json();
      console.log(`[WrenAI] Response data:`, data);
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      console.error(`[WrenAI] Request failed:`, error);
      
      if (error.name === 'AbortError') {
        throw WrenAIErrorHandler.createError(
          408,
          'Request timeout',
          endpoint
        );
      }
      
      throw error;
    }
  }

  async askQuestion(request: WrenAIAskRequest): Promise<WrenAIAskResponse> {
    return this.makeRequest<WrenAIAskResponse>(
      WREN_AI_CONFIG.endpoints.ask,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async getQueryDetails(queryId: string): Promise<WrenAIQueryDetails> {
    return this.makeRequest<WrenAIQueryDetails>(
      `${WREN_AI_CONFIG.endpoints.askDetails}/${queryId}`
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      const testQuery: WrenAIAskRequest = {
        question: "Show me available properties",
        thread_id: 'test_' + Date.now(),
        instructions: WREN_AI_CONFIG.defaultInstructions
      };

      const response = await this.askQuestion(testQuery);
      return WrenAIErrorHandler.validateResponse(response);
    } catch (error) {
      console.error('WrenAI Connection Test Failed:', error);
      return false;
    }
  }
}
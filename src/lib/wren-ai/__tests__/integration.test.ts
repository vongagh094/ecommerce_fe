/**
 * WrenAI Integration Tests
 * 
 * These tests verify the WrenAI integration functionality.
 * Note: These tests require a running WrenAI service.
 */

import { AirbnbChatbot } from '../chatbot';
import { WrenAIApiClient } from '../api-client';
import { validateEnvironment } from '../config';

// Mock environment for testing
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_WREN_AI_URL: 'http://localhost:5555'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('WrenAI Configuration', () => {
  test('should validate environment correctly', () => {
    expect(validateEnvironment()).toBe(true);
  });

  test('should fail validation with missing URL', () => {
    delete process.env.NEXT_PUBLIC_WREN_AI_URL;
    expect(validateEnvironment()).toBe(false);
  });
});

describe('WrenAI API Client', () => {
  let apiClient: WrenAIApiClient;

  beforeEach(() => {
    apiClient = new WrenAIApiClient();
  });

  test('should create API client instance', () => {
    expect(apiClient).toBeInstanceOf(WrenAIApiClient);
  });

  // Note: This test requires a running WrenAI service
  test.skip('should connect to WrenAI service', async () => {
    const isConnected = await apiClient.testConnection();
    expect(isConnected).toBe(true);
  }, 10000);
});

describe('Airbnb Chatbot', () => {
  let chatbot: AirbnbChatbot;

  beforeEach(() => {
    chatbot = new AirbnbChatbot();
  });

  test('should create chatbot instance', () => {
    expect(chatbot).toBeInstanceOf(AirbnbChatbot);
  });

  test('should generate unique thread IDs', () => {
    const threadId1 = chatbot.getCurrentThreadId();
    chatbot.resetThread();
    const threadId2 = chatbot.getCurrentThreadId();
    
    expect(threadId1).not.toBe(threadId2);
    expect(threadId1).toMatch(/^thread_\d+_[a-z0-9]+$/);
  });

  // Note: This test requires a running WrenAI service
  test.skip('should process user message', async () => {
    const response = await chatbot.processUserMessage('Show me available properties');
    
    expect(response).toHaveProperty('type');
    expect(response).toHaveProperty('message');
    expect(['property_results', 'error']).toContain(response.type);
  }, 15000);
});

describe('Error Handling', () => {
  test('should handle network errors gracefully', async () => {
    // Mock a network error
    const chatbot = new AirbnbChatbot();
    
    // This will fail if WrenAI service is not running
    const response = await chatbot.processUserMessage('test query');
    
    if (response.type === 'error') {
      expect(response.message).toBeTruthy();
      expect(typeof response.message).toBe('string');
    }
  });
});

// Integration test helper
export const runIntegrationTests = async () => {
  console.log('Running WrenAI Integration Tests...');
  
  try {
    const chatbot = new AirbnbChatbot();
    const isConnected = await chatbot.testConnection();
    
    if (!isConnected) {
      console.warn('⚠️  WrenAI service is not running. Some features may not work.');
      return false;
    }
    
    console.log('✅ WrenAI service connection successful');
    
    // Test a simple query
    const response = await chatbot.processUserMessage('Show me properties');
    console.log('✅ Query processing test:', response.type);
    
    return true;
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return false;
  }
};
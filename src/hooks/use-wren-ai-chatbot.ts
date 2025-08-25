import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatbotResponse } from '@/types/wren-ai';
import { AirbnbChatbot } from '@/lib/wren-ai/chatbot';
import { validateEnvironment } from '@/lib/wren-ai/config';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  response?: ChatbotResponse;
}

interface UseChatbotReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  resetThread: () => void;
  testConnection: () => Promise<boolean>;
}

export const useWrenAIChatbot = (): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatbotRef = useRef<AirbnbChatbot | null>(null);

  // Initialize chatbot
  useEffect(() => {
    if (!validateEnvironment()) {
      setError('WrenAI configuration is invalid');
      return;
    }

    chatbotRef.current = new AirbnbChatbot();
    
    // Test initial connection
    testConnection();
  }, []);

  const generateMessageId = (): string => {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  };

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!chatbotRef.current) return false;

    try {
      const connected = await chatbotRef.current.testConnection();
      setIsConnected(connected);
      if (connected) {
        setError(null);
      } else {
        setError('Failed to connect to WrenAI service');
      }
      return connected;
    } catch (err) {
      setIsConnected(false);
      setError('Connection test failed');
      return false;
    }
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!chatbotRef.current || !message.trim()) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatbotRef.current.processUserMessage(message.trim());
      
      const botMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        response
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'bot',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
        response: {
          type: 'error',
          message: 'Sorry, I encountered an error processing your request.'
        }
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const resetThread = useCallback(() => {
    if (chatbotRef.current) {
      chatbotRef.current.resetThread();
    }
    clearChat();
  }, [clearChat]);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    clearChat,
    resetThread,
    testConnection
  };
};
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWrenAIChatbot } from '@/hooks/use-wren-ai-chatbot';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { ConnectionStatus } from './connection-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Trash2,
  RotateCcw,
  Minimize2,
  Maximize2,
  Settings
} from 'lucide-react';
import { CompactLanguageToggle } from '@/components/ui/language-switcher';

interface WrenAIChatbotProps {
  className?: string;
  defaultMinimized?: boolean;
}

export const WrenAIChatbot: React.FC<WrenAIChatbotProps> = ({
  className = '',
  defaultMinimized = false
}) => {
  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    clearChat,
    resetThread,
    testConnection
  } = useWrenAIChatbot();

  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [isRetrying, setIsRetrying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRetryConnection = async (): Promise<boolean> => {
    setIsRetrying(true);
    const result = await testConnection();
    setIsRetrying(false);
    return result;
  };

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const suggestedQueries = [
    "Show me properties under $100 per night",
    "Find properties with high ratings in downtown",
    "What are the most expensive properties?",
    "Show me properties with pools and WiFi"
  ];

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 shadow-lg"
          size="lg"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-96 h-[600px] shadow-xl flex flex-col">
        {/* Header */}
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Property Assistant</CardTitle>
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {isConnected ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetThread}
                title="New conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Connection Status */}
        {(!isConnected || error) && (
          <div className="p-3 border-b">
            <ConnectionStatus
              isConnected={isConnected}
              error={error}
              onRetry={handleRetryConnection}
              isRetrying={isRetrying}
            />
          </div>
        )}

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 space-y-4">
              <div>
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Ask me anything about properties!</p>
              </div>

              {/* Suggested Queries */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400">Try asking:</p>
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(query)}
                    className="block w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                    disabled={!isConnected || isLoading}
                  >
                    "{query}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                type={message.type}
                content={message.content}
                timestamp={message.timestamp}
                properties={message.response?.properties}
                isError={message.response?.type === 'error'}
              />
            ))
          )}

          {isLoading && (
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Searching properties...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!isConnected}
          placeholder={
            isConnected
              ? "Ask me about properties..."
              : "Connecting to AI service..."
          }
        />
      </Card>
    </div>
  );
};
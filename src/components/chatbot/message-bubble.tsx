import React from 'react';
import { PropertyCard } from './property-card';
import { FormattedProperty } from '@/types/wren-ai';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Bot, AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  properties?: FormattedProperty[];
  isError?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  type,
  content,
  timestamp,
  properties,
  isError = false
}) => {
  const isUser = type === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-gray-600'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-3 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : isError 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-gray-100'
        }`}>
          {isError ? (
            <Alert className="border-0 p-0 bg-transparent">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {content}
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm">{content}</p>
          )}
        </div>

        {/* Properties Grid */}
        {properties && properties.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
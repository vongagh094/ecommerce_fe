# WrenAI Chatbot Integration

This document describes the integration of WrenAI natural language processing capabilities into the Airbnb property platform frontend.

## Overview

The WrenAI integration provides a conversational interface for users to search and discover properties using natural language queries. The system translates user questions into SQL queries and returns formatted property results.

## Architecture

```
Frontend (Next.js) → WrenAI API Service → Database → Formatted Results
```

### Components Structure

```
src/
├── types/wren-ai.ts                 # TypeScript definitions
├── lib/wren-ai/
│   ├── config.ts                    # Configuration and constants
│   ├── api-client.ts                # HTTP client for WrenAI API
│   ├── error-handler.ts             # Error handling utilities
│   ├── chatbot.ts                   # Main chatbot logic
│   └── index.ts                     # Exports
├── hooks/
│   └── use-wren-ai-chatbot.ts       # React hook for chatbot state
├── components/chatbot/
│   ├── wren-ai-chatbot.tsx          # Main chatbot UI component
│   ├── message-bubble.tsx           # Chat message display
│   ├── property-card.tsx            # Property result card
│   ├── chat-input.tsx               # Message input component
│   ├── connection-status.tsx        # Connection indicator
│   └── index.ts                     # Exports
└── components/providers/
    └── chatbot-provider.tsx         # Context provider
```

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# WrenAI Service URL
NEXT_PUBLIC_WREN_AI_URL=http://localhost:5555

# Database Configuration (for WrenAI backend)
DB_TYPE=pg
PG_URL=postgres://username:password@localhost:5432/airbnb_db

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key_here

# Port Configuration (to avoid conflicts)
HOST_PORT=3001
IBIS_SERVER_PORT=8001
AI_SERVICE_FORWARD_PORT=5555
```

### WrenAI Service Setup

1. **Port Configuration**: Update your WrenAI `.env` file to avoid port conflicts:
   ```bash
   HOST_PORT=3001  # Changed from 3000
   IBIS_SERVER_PORT=8001  # Changed from 8000
   ```

2. **Database Connection**: Ensure WrenAI is connected to your property database.

3. **Start Services**: Run WrenAI services before starting the frontend.

## Usage

### Basic Integration

1. **Add Provider to Layout**:
```tsx
// src/app/layout.tsx
import { ChatbotProvider } from '@/components/providers/chatbot-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ChatbotProvider>
          {children}
        </ChatbotProvider>
      </body>
    </html>
  );
}
```

2. **Add Chatbot Component**:
```tsx
// src/app/page.tsx or any page
import { WrenAIChatbot } from '@/components/chatbot';

export default function HomePage() {
  return (
    <div>
      {/* Your page content */}
      <WrenAIChatbot />
    </div>
  );
}
```

### Advanced Usage

#### Custom Hook Usage
```tsx
import { useWrenAIChatbot } from '@/hooks/use-wren-ai-chatbot';

function CustomChatInterface() {
  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    clearChat,
    resetThread
  } = useWrenAIChatbot();

  // Custom implementation
}
```

#### Direct API Usage
```tsx
import { AirbnbChatbot } from '@/lib/wren-ai';

const chatbot = new AirbnbChatbot();

async function handleQuery(question: string) {
  const response = await chatbot.processUserMessage(question);
  console.log(response);
}
```

## API Reference

### Core Classes

#### `AirbnbChatbot`
Main chatbot class that handles user interactions.

**Methods:**
- `processUserMessage(message: string): Promise<ChatbotResponse>`
- `resetThread(): void`
- `getCurrentThreadId(): string`
- `testConnection(): Promise<boolean>`

#### `WrenAIApiClient`
HTTP client for WrenAI API communication.

**Methods:**
- `askQuestion(request: WrenAIAskRequest): Promise<WrenAIAskResponse>`
- `getQueryDetails(queryId: string): Promise<WrenAIQueryDetails>`
- `testConnection(): Promise<boolean>`

### React Hook

#### `useWrenAIChatbot()`
React hook for managing chatbot state.

**Returns:**
```tsx
{
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  resetThread: () => void;
  testConnection: () => Promise<boolean>;
}
```

## Customization

### Styling
The chatbot uses Tailwind CSS classes and can be customized by:
1. Modifying the component classes
2. Using CSS custom properties
3. Extending the theme configuration

### Instructions
Modify the default instructions in `src/lib/wren-ai/config.ts`:
```tsx
defaultInstructions: [
  "Always include property_id in SELECT statements",
  "Format property links as http://localhost:3000/property/{property_id}",
  "Custom instruction for your use case"
]
```

### Property Card Display
Customize the property card in `src/components/chatbot/property-card.tsx` to match your design system.

## Error Handling

The integration includes comprehensive error handling:

- **Connection Errors**: Automatic retry with user feedback
- **API Errors**: User-friendly error messages
- **Timeout Handling**: Configurable request timeouts
- **Validation**: Input and response validation

## Performance Considerations

- **Lazy Loading**: Components are loaded only when needed
- **Debouncing**: Input debouncing to prevent excessive API calls
- **Caching**: Thread-based conversation caching
- **Optimization**: Minimal re-renders with proper state management

## Testing

### Connection Test
```tsx
import { AirbnbChatbot } from '@/lib/wren-ai';

async function testWrenAIConnection() {
  const chatbot = new AirbnbChatbot();
  const isConnected = await chatbot.testConnection();
  console.log('WrenAI Connection:', isConnected ? 'Success' : 'Failed');
}
```

### Example Queries
- "Show me properties under $100 per night"
- "Find properties with high ratings in downtown"
- "What are the most expensive properties?"
- "Show me properties with pools and WiFi"

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if WrenAI service is running on port 5555
   - Verify environment variables
   - Check network connectivity

2. **Port Conflicts**
   - Ensure WrenAI UI is not running on port 3000
   - Update HOST_PORT in WrenAI configuration

3. **Database Issues**
   - Verify database connection in WrenAI
   - Check if property schema is properly configured

4. **API Errors**
   - Check OpenAI API key configuration
   - Verify WrenAI service logs

### Debug Mode
Enable debug logging by setting:
```bash
NEXT_PUBLIC_DEBUG_WREN_AI=true
```

## Security Considerations

- **Input Validation**: All user inputs are validated
- **SQL Injection Prevention**: WrenAI handles SQL generation safely
- **Rate Limiting**: Consider implementing rate limiting for production
- **CORS Configuration**: Ensure proper CORS setup for cross-origin requests

## Production Deployment

1. **Environment Configuration**: Set production URLs and credentials
2. **SSL/TLS**: Use HTTPS for all API communications
3. **Monitoring**: Implement logging and monitoring
4. **Scaling**: Consider load balancing for high traffic
5. **Caching**: Implement response caching where appropriate

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review WrenAI documentation
3. Check component props and configuration
4. Enable debug mode for detailed logging
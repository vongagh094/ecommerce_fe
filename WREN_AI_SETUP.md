# WrenAI Chatbot Integration Setup Guide

This guide will help you integrate the WrenAI chatbot into your Airbnb property platform.

## 🚀 Quick Start

### 1. Install Dependencies

Run the installation script:
```bash
chmod +x scripts/install-wren-ai-deps.sh
./scripts/install-wren-ai-deps.sh
```

Or install manually:
```bash
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```bash
# WrenAI Service URL
NEXT_PUBLIC_WREN_AI_URL=http://localhost:5555

# Database Configuration (for WrenAI backend)
DB_TYPE=pg
PG_URL=postgres://username:password@localhost:5432/airbnb_db

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key_here
```

### 3. WrenAI Service Setup

1. **Download and Setup WrenAI**:
   ```bash
   git clone https://github.com/Canner/WrenAI.git
   cd WrenAI
   ```

2. **Configure WrenAI Environment**:
   Create a `.env` file in the WrenAI directory:
   ```bash
   # Avoid port conflicts with your frontend
   HOST_PORT=3001
   IBIS_SERVER_PORT=8001
   AI_SERVICE_FORWARD_PORT=5555
   
   # Database connection
   DB_TYPE=pg
   PG_URL=postgres://username:password@localhost:5432/airbnb_db
   
   # OpenAI configuration
   OPENAI_API_KEY=your_openai_key_here
   ```

3. **Start WrenAI Services**:
   ```bash
   docker-compose up -d
   ```

### 4. Integration

The chatbot is already integrated into your layout. You can now:

1. **Visit the demo page**: `http://localhost:3000/chatbot-demo`
2. **Use the floating chatbot**: Available on all pages
3. **Customize the integration**: See the documentation below

## 📁 Project Structure

```
src/
├── types/wren-ai.ts                 # TypeScript definitions
├── lib/wren-ai/                     # Core WrenAI integration
│   ├── config.ts                    # Configuration
│   ├── api-client.ts                # API client
│   ├── error-handler.ts             # Error handling
│   ├── chatbot.ts                   # Main chatbot logic
│   └── index.ts                     # Exports
├── hooks/use-wren-ai-chatbot.ts     # React hook
├── components/
│   ├── chatbot/                     # UI components
│   │   ├── wren-ai-chatbot.tsx      # Main chatbot UI
│   │   ├── message-bubble.tsx       # Message display
│   │   ├── property-card.tsx        # Property results
│   │   ├── chat-input.tsx           # Input component
│   │   └── connection-status.tsx    # Status indicator
│   ├── providers/chatbot-provider.tsx # Context provider
│   └── ui/                          # Base UI components
└── app/chatbot-demo/                # Demo page
```

## 🎯 Usage Examples

### Basic Usage

The chatbot is automatically available as a floating widget on all pages:

```tsx
// Already integrated in src/app/layout.tsx
import { WrenAIChatbot } from '@/components/chatbot';

<WrenAIChatbot />
```

### Custom Implementation

```tsx
import { useWrenAIChatbot } from '@/hooks/use-wren-ai-chatbot';

function CustomChatInterface() {
  const {
    messages,
    isLoading,
    sendMessage,
    isConnected
  } = useWrenAIChatbot();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.content}
        </div>
      ))}
      <input 
        onSubmit={(e) => sendMessage(e.target.value)}
        disabled={!isConnected}
      />
    </div>
  );
}
```

### Direct API Usage

```tsx
import { AirbnbChatbot } from '@/lib/wren-ai';

const chatbot = new AirbnbChatbot();

async function handleQuery(question: string) {
  const response = await chatbot.processUserMessage(question);
  
  if (response.type === 'property_results') {
    console.log('Found properties:', response.properties);
  }
}
```

## 🔧 Configuration

### Custom Instructions

Modify the AI behavior in `src/lib/wren-ai/config.ts`:

```tsx
defaultInstructions: [
  "Always include property_id in SELECT statements",
  "Format property links as http://localhost:3000/property/{property_id}",
  "Limit results to 10 properties maximum",
  "Include price, location, and rating information",
  "Custom instruction for your specific needs"
]
```

### Styling Customization

The components use Tailwind CSS. Customize by:

1. **Modifying component classes**:
   ```tsx
   <WrenAIChatbot className="custom-chatbot-styles" />
   ```

2. **Extending Tailwind configuration**:
   ```js
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           'chatbot-primary': '#your-color'
         }
       }
     }
   }
   ```

### Property Card Customization

Edit `src/components/chatbot/property-card.tsx` to match your design:

```tsx
export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <Card className="your-custom-styles">
      {/* Your custom property card layout */}
    </Card>
  );
};
```

## 🧪 Testing

### Connection Test

```tsx
import { runIntegrationTests } from '@/lib/wren-ai/__tests__/integration.test';

// Test the integration
runIntegrationTests().then(success => {
  console.log('Integration test:', success ? 'PASSED' : 'FAILED');
});
```

### Manual Testing

1. **Start your development server**: `npm run dev`
2. **Visit the demo page**: `http://localhost:3000/chatbot-demo`
3. **Try example queries**:
   - "Show me properties under $100 per night"
   - "Find properties with high ratings"
   - "What are the most expensive properties?"

## 🚨 Troubleshooting

### Common Issues

1. **Chatbot not connecting**:
   - ✅ Check if WrenAI service is running: `docker ps`
   - ✅ Verify environment variables in `.env.local`
   - ✅ Check network connectivity to `localhost:5555`

2. **Port conflicts**:
   - ✅ Ensure WrenAI UI is not using port 3000
   - ✅ Update `HOST_PORT=3001` in WrenAI `.env`
   - ✅ Restart WrenAI services after configuration changes

3. **Database connection issues**:
   - ✅ Verify database is running and accessible
   - ✅ Check database credentials in WrenAI configuration
   - ✅ Ensure property schema is properly set up

4. **API errors**:
   - ✅ Verify OpenAI API key is valid
   - ✅ Check WrenAI service logs: `docker logs wrenai_wren-ai-service_1`
   - ✅ Enable debug mode: `NEXT_PUBLIC_DEBUG_WREN_AI=true`

### Debug Mode

Enable detailed logging:

```bash
# In .env.local
NEXT_PUBLIC_DEBUG_WREN_AI=true
```

### Service Status Check

```bash
# Check WrenAI services
docker ps | grep wren

# Check service logs
docker logs wrenai_wren-ai-service_1

# Test API endpoint
curl http://localhost:5555/health
```

## 🔒 Security Considerations

### Production Setup

1. **Environment Variables**:
   ```bash
   # Use production URLs
   NEXT_PUBLIC_WREN_AI_URL=https://your-wren-ai-service.com
   
   # Secure API keys
   OPENAI_API_KEY=your_production_key
   ```

2. **CORS Configuration**:
   Ensure WrenAI service allows requests from your domain.

3. **Rate Limiting**:
   Consider implementing rate limiting for API calls.

4. **Input Validation**:
   The integration includes input validation, but review for your specific needs.

## 📚 Additional Resources

- **WrenAI Documentation**: [https://github.com/Canner/WrenAI](https://github.com/Canner/WrenAI)
- **Integration Documentation**: `docs/wren-ai-integration.md`
- **Component Documentation**: See individual component files
- **API Reference**: `src/lib/wren-ai/` directory

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the integration documentation
3. Enable debug mode for detailed logging
4. Check WrenAI service logs
5. Verify all environment variables are set correctly

## 🎉 Success!

Once everything is set up, you should have:

- ✅ A floating chatbot widget on all pages
- ✅ Natural language property search
- ✅ Real-time property results with direct links
- ✅ Error handling and connection status
- ✅ Responsive design that works on all devices

Try asking: *"Show me properties under $100 per night with good ratings"*
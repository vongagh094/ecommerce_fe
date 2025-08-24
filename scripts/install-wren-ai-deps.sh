#!/bin/bash

# Install WrenAI Integration Dependencies
echo "Installing WrenAI integration dependencies..."

# Core dependencies
npm install --save \
  @radix-ui/react-slot \
  class-variance-authority \
  clsx \
  tailwind-merge \
  lucide-react

# Development dependencies
npm install --save-dev \
  @types/node

echo "Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env.local and configure your WrenAI service URL"
echo "2. Ensure WrenAI service is running on the configured port"
echo "3. Import and use the WrenAIChatbot component in your pages"
echo ""
echo "Example usage:"
echo "import { WrenAIChatbot } from '@/components/chatbot';"
echo ""
echo "For more information, see docs/wren-ai-integration.md"
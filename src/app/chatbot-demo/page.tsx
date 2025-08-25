'use client';

import React from 'react';
import { WrenAIChatbot } from '@/components/chatbot';
import { Button } from '@/components/ui/button';
import { useChatbotContext } from '@/components/providers/chatbot-provider';

export default function ChatbotDemoPage() {
  const { toggleChatbot, isChatbotOpen } = useChatbotContext();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            WrenAI Chatbot Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Experience our AI-powered property search assistant
          </p>
          
          <Button 
            onClick={toggleChatbot}
            size="lg"
            className="mb-8"
          >
            {isChatbotOpen ? 'Close' : 'Open'} Chatbot
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Try These Queries</h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm font-medium text-blue-800">
                  "Show me properties under $100 per night"
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <p className="text-sm font-medium text-green-800">
                  "Find properties with high ratings in downtown"
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                <p className="text-sm font-medium text-purple-800">
                  "What are the most expensive properties?"
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                <p className="text-sm font-medium text-orange-800">
                  "Show me properties with pools and WiFi"
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Natural Language Processing</p>
                  <p className="text-sm text-gray-600">Ask questions in plain English</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Real-time Results</p>
                  <p className="text-sm text-gray-600">Get instant property recommendations</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Smart Filtering</p>
                  <p className="text-sm text-gray-600">AI understands your preferences</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Direct Links</p>
                  <p className="text-sm text-gray-600">Click to view property details</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Ask Your Question</h3>
              <p className="text-sm text-gray-600">Type your property search query in natural language</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">AI Processing</h3>
              <p className="text-sm text-gray-600">WrenAI converts your query into database searches</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Get Results</h3>
              <p className="text-sm text-gray-600">Receive formatted property cards with direct links</p>
            </div>
          </div>
        </div>
      </div>

      {/* The chatbot component - always rendered but controlled by context */}
      <WrenAIChatbot defaultMinimized={!isChatbotOpen} />
    </div>
  );
}
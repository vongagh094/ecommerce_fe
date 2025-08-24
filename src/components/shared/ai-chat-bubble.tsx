"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { usePropertyTranslations } from "@/hooks/use-translations"

interface Message {
  id: number
  text: string
  sender: "user" | "ai"
  timestamp: Date
}

export function AiChatBubble() {
  const t = usePropertyTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: t('aiChat.welcomeMessage'),
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newMessage])
      setInputValue("")

      // Simulate AI response after a short delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          text: t('aiChat.responseMessage'),
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-50 flex items-center justify-center"
        >
          <Image
            src="/images/chat-bubble.png"
            alt="Chat with AI"
            width={28}
            height={28}
            className="filter brightness-0 invert"
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-medium">{t('aiChat.title')}</h3>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800">
            {/* Timestamp */}
            <div className="text-center">
              <span className="text-xs text-gray-400">{formatTime(new Date())}</span>
            </div>

            {/* Messages */}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-100"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('aiChat.placeholder')}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-full pr-10 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 h-auto min-w-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

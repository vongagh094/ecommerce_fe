"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: number
  text: string
  sender: "guest" | "host"
  timestamp: Date
}

interface Contact {
  id: number
  name: string
  avatar: string
  lastMessage: string
  unread: boolean
}

const contacts: Contact[] = [
  {
    id: 1,
    name: "John D Rockefeller",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hi, I want to ask about your room!",
    unread: true,
  },
]

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi, I want to ask about your room!",
    sender: "guest",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 2,
    text: "We are A&B accommodation, please wait a bit",
    sender: "host",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
]

export function MessagingInterface() {
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: "host",
        timestamp: new Date(),
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] flex">
      {/* Left Sidebar - Contacts */}
      <div className="w-1/3 bg-white border-r flex flex-col">
        {/* Messages Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Messages</h2>
          <div className="flex space-x-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="rounded-full"
            >
              Unread
            </Button>
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {contacts
            .filter((contact) => filter === "all" || contact.unread)
            .map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedContact.id === contact.id ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                    <AvatarFallback>
                      {contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 bg-white flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-900">{selectedContact.name}</h3>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "host" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender === "host" ? "bg-gray-200 text-gray-900" : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your text here"
              className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="rounded-full bg-blue-500 hover:bg-blue-600"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

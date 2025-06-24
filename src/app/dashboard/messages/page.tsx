"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

const contacts = [
  {
    id: 1,
    name: "Ghazal, host of Adaaran Club Rannalhi, Maldives, Water Bungalows",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Bill, host of Adaaran Club Rannalhi, Maldives, Water Bungalows",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Ana, host of Adaaran Club Rannalhi, Maldives, Water Bungalows",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const messages = [
  {
    id: 1,
    text: "Can you help us to write a review?",
    sender: "contact",
    timestamp: new Date(),
  },
  {
    id: 2,
    text: "Yes, sure, please wait",
    sender: "user",
    timestamp: new Date(),
  },
]

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState(contacts[0])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [messageInput, setMessageInput] = useState("")
  const [currentMessages, setCurrentMessages] = useState(messages)

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: currentMessages.length + 1,
        text: messageInput.trim(),
        sender: "user" as const,
        timestamp: new Date(),
      }
      setCurrentMessages((prev) => [...prev, newMessage])
      setMessageInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Messages</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: "600px" }}>
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Filter Buttons */}
            <div className="p-4 border-b border-gray-200">
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
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
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
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">{contact.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">John D Rockefeller</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {currentMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your text here"
                  className="flex-1 rounded-full border-gray-300"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

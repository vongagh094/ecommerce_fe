"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  id: string
  name: string
  avatar: string
  lastMessage: string
  unread: boolean
}

interface MessagingInterfaceProps {
  preselectedGuestId?: string | null
  preselectedGuestName?: string | null
}

const allContacts: Contact[] = [
  {
    id: "1",
    name: "Balaji Nant",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hi, I want to ask about your room!",
    unread: true,
  },
  {
    id: "2",
    name: "Nithya Menon",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thank you for the booking confirmation",
    unread: false,
  },
  {
    id: "3",
    name: "Meera Gonzalez",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Is parking available?",
    unread: true,
  },
  {
    id: "4",
    name: "Karthik Subramanian",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Great place, thanks!",
    unread: false,
  },
]

const getInitialMessages = (contactId: string): Message[] => {
  const messageMap: Record<string, Message[]> = {
    "1": [
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
    ],
    "2": [
      {
        id: 1,
        text: "Thank you for the booking confirmation",
        sender: "guest",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        id: 2,
        text: "You're welcome! Looking forward to hosting you.",
        sender: "host",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
      },
    ],
    "3": [
      {
        id: 1,
        text: "Is parking available?",
        sender: "guest",
        timestamp: new Date(Date.now() - 120 * 60 * 1000),
      },
    ],
    "4": [
      {
        id: 1,
        text: "Great place, thanks!",
        sender: "guest",
        timestamp: new Date(Date.now() - 180 * 60 * 1000),
      },
      {
        id: 2,
        text: "Thank you for staying with us!",
        sender: "host",
        timestamp: new Date(Date.now() - 150 * 60 * 1000),
      },
    ],
  }

  return messageMap[contactId] || []
}

export function MessagingInterface({ preselectedGuestId, preselectedGuestName }: MessagingInterfaceProps) {
  const [contacts, setContacts] = useState<Contact[]>(allContacts)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    // If a guest is preselected from booking manager, find or create the contact
    if (preselectedGuestId && preselectedGuestName) {
      let contact = contacts.find((c) => c.id === preselectedGuestId)

      if (!contact) {
        // Create a new contact if not found
        contact = {
          id: preselectedGuestId,
          name: preselectedGuestName,
          avatar: "/placeholder.svg?height=40&width=40",
          lastMessage: "New conversation",
          unread: false,
        }
        setContacts((prev) => [contact!, ...prev])
      }

      setSelectedContact(contact)
      setMessages(getInitialMessages(preselectedGuestId))
    } else if (contacts.length > 0) {
      // Default to first contact if no preselection
      setSelectedContact(contacts[0])
      setMessages(getInitialMessages(contacts[0].id))
    }
  }, [preselectedGuestId, preselectedGuestName, contacts])

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
    setMessages(getInitialMessages(contact.id))
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: "host",
        timestamp: new Date(),
      }
      setMessages([...messages, message])
      setNewMessage("")

      // Update the last message for the contact
      setContacts((prev) =>
        prev.map((c) => (c.id === selectedContact.id ? { ...c, lastMessage: newMessage, unread: false } : c)),
      )
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const filteredContacts = contacts.filter((contact) => filter === "all" || contact.unread)

  if (!selectedContact) {
    return (
      <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    )
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
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleContactSelect(contact)}
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
                  message.sender === "host" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
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

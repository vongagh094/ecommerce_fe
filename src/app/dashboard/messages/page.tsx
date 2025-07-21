"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, CheckCircle, Circle, Search, ArrowDown } from "lucide-react"
import Pusher from "pusher-js"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Conversation, Message } from "@/types"

const temporaryUserId = Math.random() > 0.5 ? 1 : 2 // Simulating a temporary user ID for demonstration purposes

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [messageInput, setMessageInput] = useState<string>("")
  const [messagePage, setMessagePage] = useState<number>(1)
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false)
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true)
  const [visibleMessageCount, setVisibleMessageCount] = useState<number>(5)
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false)

  const pusherRef = useRef<Pusher | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  const messagesPerPage = 10
  const messagesPerRender = 5

  // Memoized visible messages to ensure re-render
  const visibleMessagesMemo = useMemo(() => {
    return visibleMessages.map((msg) => ({ ...msg }))
  }, [visibleMessages])

  useEffect(() => {
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
    console.log("Pusher initialized for user:", temporaryUserId)

    fetchConversations()

    return () => {
      console.log("Disconnecting Pusher for user:", temporaryUserId)
      pusherRef.current?.disconnect()
    }
  }, [searchParams])

  useEffect(() => {
    console.log("useEffect triggered for selectedConversation:", selectedConversation?.id, "user:", temporaryUserId)

    // Reset state when no conversation is selected
    if (!selectedConversation) {
      console.log("Resetting state due to no selectedConversation")
      setMessages([])
      setVisibleMessages([])
      setMessagePage(1)
      setHasMoreMessages(true)
      setVisibleMessageCount(messagesPerRender)
      setShowScrollButton(false)
      return
    }

    // Unsubscribe from previous channel if it exists
    if (pusherRef.current) {
      pusherRef.current.allChannels().forEach((channel) => {
        console.log("Unsubscribing from channel:", channel.name, "user:", temporaryUserId)
        channel.unbind_all()
        channel.unsubscribe()
      })
    }

    const channel = pusherRef.current?.subscribe(`conversation-${selectedConversation.id}`)
    console.log("Subscribed to channel:", `conversation-${selectedConversation.id}`, "user:", temporaryUserId)

    channel?.bind("new-message", (data: Message) => {
      console.log("Received new-message event:", data, "user:", temporaryUserId)
      setMessages((prev) => {
        if (!prev.some((msg) => msg.id === data.id)) {
          return [...prev, data]
        }
        return prev
      })
      setVisibleMessages((prev) => {
        if (!prev.some((msg) => msg.id === data.id)) {
          const updatedVisible = [...prev, data]
          if (visibleMessageCount >= messages.length) {
            return updatedVisible
          }
          return updatedVisible.slice(-visibleMessageCount)
        }
        return prev
      })
      if (!showScrollButton) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 0)
      }

      // Đánh dấu tin nhắn là đã đọc nếu đang xem cuộc trò chuyện
      if (data.sender_id !== temporaryUserId) {
        markMessageAsRead(selectedConversation.id, temporaryUserId)
      }
    })

    channel?.bind("messages-read", (updatedMessages: Message[]) => {
      console.log("Received messages-read event:", updatedMessages, "user:", temporaryUserId)
      setMessages((prev) => {
        const updated = prev.map((msg) => {
          const updatedMsg = updatedMessages.find((um) => um.id === msg.id)
          return updatedMsg ? { ...msg, is_read: updatedMsg.is_read } : msg
        })
        return [...updated]
      })
      setVisibleMessages((prev) => {
        const updatedVisible = prev.map((msg) => {
          const updatedMsg = updatedMessages.find((um) => um.id === msg.id)
          return updatedMsg ? { ...msg, is_read: updatedMsg.is_read } : msg
        })
        return [...updatedVisible]
      })
    })

    fetchMessages(selectedConversation.id, 1).then((data) => {
      if (data.length > 0) {
        setMessages(data)
        setVisibleMessages(data.slice(-messagesPerRender))
        setMessagePage(2)
        setVisibleMessageCount(messagesPerRender)
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 0)
      }
    })

    return () => {
      console.log("Cleaning up channel for conversation:", selectedConversation?.id, "user:", temporaryUserId)
      channel?.unbind_all()
      channel?.unsubscribe()
    }
  }, [selectedConversation])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollButton(!entry.isIntersecting)
      },
      { root: messagesContainerRef.current, threshold: 0.1 }
    )

    if (messagesEndRef.current) {
      observer.observe(messagesEndRef.current)
    }

    return () => {
      if (messagesEndRef.current) {
        observer.unobserve(messagesEndRef.current)
      }
    }
  }, [visibleMessages])

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/chat/conversation?userId=${temporaryUserId}`)
      if (!response.ok) throw new Error(`Lỗi khi lấy danh sách conversation: ${response.status}`)
      const data = await response.json()

      const conversationsWithUnread = await Promise.all(
        data.map(async (conv: Conversation) => {
          const messagesResponse = await fetch(
            `/api/chat/message?conversationId=${conv.id}&userId=${temporaryUserId}`
          )
          if (!messagesResponse.ok) throw new Error(`Lỗi khi lấy tin nhắn cho conversation ${conv.id}`)
          const messages = await messagesResponse.json()
          return {
            ...conv,
            has_unread: messages.some((msg: Message) => msg.sender_id !== temporaryUserId && !msg.is_read),
          }
        })
      )

      setConversations(conversationsWithUnread)
      if (conversationsWithUnread.length > 0 && !selectedConversation && !searchParams.get("conversationId")) {
        console.log("Setting initial conversation:", conversationsWithUnread[0], "user:", temporaryUserId)
        setSelectedConversation(null)
        setTimeout(() => setSelectedConversation(conversationsWithUnread[0]), 0)
      }
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách conversation:", error, "user:", temporaryUserId)
    }
  }

  const fetchMessages = async (conversationId: number, pageNum: number) => {
    try {
      setIsLoadingMessages(true)
      const response = await fetch(
        `/api/chat/message?conversationId=${conversationId}&userId=${temporaryUserId}&limit=${messagesPerPage}&offset=${(pageNum - 1) * messagesPerPage}`
      )
      if (!response.ok) throw new Error(`Lỗi khi lấy tin nhắn: ${response.status}`)
      const data = await response.json()
      if (data.length < messagesPerPage) setHasMoreMessages(false)
      return data.reverse()
    } catch (error: any) {
      console.error("Lỗi khi lấy tin nhắn:", error, "user:", temporaryUserId)
      return []
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const markMessageAsRead = async (conversationId: number, userId: number) => {
    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          userId,
          markAsRead: true,
        }),
      })
      if (!response.ok) throw new Error(`Lỗi khi đánh dấu tin nhắn là đã đọc: ${response.status}`)
    } catch (error) {
      console.error("Lỗi khi đánh dấu tin nhắn là đã đọc:", error, "user:", temporaryUserId)
    }
  }

  const handleLoadMore = async () => {
    if (!selectedConversation) return

    const newVisibleCount = visibleMessageCount + messagesPerRender
    setVisibleMessageCount(newVisibleCount)

    if (newVisibleCount <= messages.length) {
      setVisibleMessages(messages.slice(-newVisibleCount))
    } else if (hasMoreMessages) {
      const newMessages = await fetchMessages(selectedConversation.id, messagePage)
      if (newMessages.length > 0) {
        const updatedMessages = [...newMessages, ...messages]
        setMessages(updatedMessages)
        setVisibleMessages(updatedMessages.slice(-newVisibleCount))
        setMessagePage((prev) => prev + 1)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          userId: temporaryUserId,
          message_text: messageInput,
        }),
      })

      if (!response.ok) throw new Error(`Lỗi khi gửi tin nhắn: ${response.status}`)
      setMessageInput("")
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 0)
    } catch (error: any) {
      console.error("Lỗi khi gửi tin nhắn:", error, "user:", temporaryUserId)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage()
  }

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleConversationSelect = (conversation: Conversation) => {
    console.log("Selecting conversation:", conversation.id, "user:", temporaryUserId)
    setSelectedConversation(null)
    setTimeout(() => setSelectedConversation(conversation), 0)
  }

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (filter === "all" || conv.has_unread) &&
      (conv.other_user.full_name.toLowerCase().includes(searchLower) ||
        (conv.property_title && conv.property_title.toLowerCase().includes(searchLower)))
    )
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", { month: "long", day: "numeric", year: "numeric" })
  }

  const isDifferentDay = (prevMessage: Message | null, currentMessage: Message) => {
    if (!prevMessage) return true
    const prevDate = new Date(prevMessage.sent_at).toDateString()
    const currentDate = new Date(currentMessage.sent_at).toDateString()
    return prevDate !== currentDate
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Messages</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: "600px" }}>
        <div className="flex h-full">
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-2 mb-2">
                <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")} className="rounded-full">
                  All
                </Button>
                <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")} className="rounded-full">
                  Unread
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search conversations..." className="pl-8 rounded-full border-gray-300" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation?.id === conversation.id ? "bg-blue-50 border-blue-200" : ""}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">
                        {conversation.other_user.full_name}
                        {conversation.property_title && (
                          <>
                            , hosting{" "}
                            {conversation.property_id ? (
                              <Link href={`/property/${conversation.property_id}`} className="text-blue-500 hover:underline">
                                {conversation.property_title}
                              </Link>
                            ) : (
                              conversation.property_title
                            )}
                          </>
                        )}
                      </h3>
                    </div>
                    <div className="text-xs text-gray-500">
                      {conversation.last_message_at && (
                        <span>
                          {new Date(conversation.last_message_at).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          - {formatDate(conversation.last_message_at)}
                        </span>
                      )} 
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col relative">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                {selectedConversation ? selectedConversation.other_user.full_name : "Select a conversation"}
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={messagesContainerRef}>
              {hasMoreMessages && (
                <Button onClick={handleLoadMore} className="w-full mt-2 rounded-full" variant="outline" disabled={isLoadingMessages}>
                  Load More
                </Button>
              )}
              {visibleMessagesMemo.map((message, index) => (
                <div key={`${message.id}-${index}`}>
                  {isDifferentDay(visibleMessagesMemo[index - 1], message) && (
                    <div className="text-center text-xs text-gray-500 my-2">{formatDate(message.sent_at)}</div>
                  )}
                  <div className={`flex ${message.sender_id === temporaryUserId ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        message.sender_id === temporaryUserId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <div>{message.message_text}</div>
                      <div className={`text-xs mt-1 flex items-center justify-end space-x-1 ${message.sender_id === temporaryUserId ? "text-blue-200" : "text-gray-500"}`}>
                        <span>{new Date(message.sent_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                        {message.sender_id === temporaryUserId && (
                          <span>{message.is_read ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {showScrollButton && (
              <Button
                onClick={handleScrollToBottom}
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center shadow-md"
                title="Scroll to latest messages"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            )}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border-gray-300"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !selectedConversation}
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
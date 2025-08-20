"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, CheckCircle, Circle, Search, ArrowDown } from "lucide-react"
import Pusher from "pusher-js"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { Conversation, Message } from "@/types"

const useTemporaryUserId = () => {
  const searchParams = useSearchParams()
  const hostIdFromUrl = searchParams.get("hostId")
  return hostIdFromUrl ? Number.parseInt(hostIdFromUrl) : Math.random() > 0.5 ? 1 : 2
}

const apiUrl = "http://127.0.0.1:8000"

export default function MessagesPage() {
  const temporaryUserId = useTemporaryUserId()

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
  const [error, setError] = useState<string | null>(null)

  const pusherRef = useRef<Pusher | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  const messagesPerPage = 10
  const messagesPerRender = 5

  // Sort messages by sent_at in ascending order
  const sortMessages = (msgs: Message[]): Message[] => {
    return [...msgs].sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime())
  }

  // Memoized visible messages to ensure re-render
  const visibleMessagesMemo = useMemo(() => {
    return sortMessages(visibleMessages)
  }, [visibleMessages])

  // Initialize Pusher only once
  useEffect(() => {
    const initializePusher = async () => {
      if (pusherRef.current) {
        console.log("Pusher already initialized, skipping...")
        return
      }

      try {
        let appKey: string, cluster: string
        if (process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
          appKey = process.env.NEXT_PUBLIC_PUSHER_KEY
          cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
          console.log("Using Pusher environment variables:", { appKey, cluster })
        } else {
          const response = await fetch(`${apiUrl}/pusher/get`)
          if (!response.ok) {
            const errorText = await response.text()
            console.error("Pusher config fetch error:", errorText)
            throw new Error(`Failed to fetch Pusher config: ${response.status}`)
          }
          const config = await response.json()
          console.log("Pusher config response:", config)
          if (!config || !config.app_key || !config.cluster) {
            throw new Error("Invalid Pusher configuration: Missing app_key or cluster")
          }
          appKey = config.app_key
          cluster = config.cluster
        }

        // Enable Pusher logging for debugging
        Pusher.logToConsole = true
        pusherRef.current = new Pusher(appKey, {
          cluster,
          forceTLS: true,
          enabledTransports: ["ws", "wss"],
        })
        console.log("Pusher initialized for user:", temporaryUserId)

        pusherRef.current.connection.bind("connected", () => {
          console.log("Pusher connected successfully for user:", temporaryUserId)
        })
        pusherRef.current.connection.bind("error", (err: any) => {
          console.error("Pusher connection error:", JSON.stringify(err, null, 2))
          setError("Failed to connect to real-time messaging service. Please try again later.")
        })
      } catch (error: any) {
        console.error("Error initializing Pusher:", error.message)
        setError("Failed to initialize real-time messaging. Real-time updates may not work.")
      }
    }

    initializePusher()
    fetchConversations()

    // Cleanup when component unmounts
    return () => {
      console.log("Disconnecting Pusher for user:", temporaryUserId)
      if (pusherRef.current) {
        pusherRef.current.allChannels().forEach((channel) => {
          console.log("Unsubscribing from channel:", channel.name)
          channel.unbind_all()
          channel.unsubscribe()
        })
        pusherRef.current.disconnect()
        pusherRef.current = null
      }
    }
  }, [])

  // Handle conversation channel subscription
  useEffect(() => {
    if (!selectedConversation || !pusherRef.current) {
      console.log("No selected conversation or Pusher not initialized, skipping subscription")
      setMessages([])
      setVisibleMessages([])
      setMessagePage(1)
      setHasMoreMessages(true)
      setVisibleMessageCount(messagesPerRender)
      setShowScrollButton(false)
      return
    }

    const subscribeToChannel = async (conversationId: number) => {
      console.log("Subscribing to conversation:", conversationId, "user:", temporaryUserId)

      // Disconnect and reconnect Pusher to reset state
      if (pusherRef.current) {
        pusherRef.current.allChannels().forEach((channel) => {
          console.log("Unsubscribing from channel:", channel.name)
          channel.unbind_all()
          channel.unsubscribe()
        })
        pusherRef.current.disconnect()
        console.log("Pusher disconnected for reset")
        await new Promise((resolve) => setTimeout(resolve, 500))
        pusherRef.current.connect()
        console.log("Pusher reconnected for conversation:", conversationId)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      const channelName = `conversation-${conversationId}`
      // Check channel state before subscribing
      const existingChannel = pusherRef.current!.channel(channelName)
      if (existingChannel && existingChannel.subscribed) {
        console.log("Channel already subscribed:", channelName)
        return
      }
      if (existingChannel && existingChannel.subscriptionPending) {
        console.log("Channel subscription in progress, waiting:", channelName)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const channel = pusherRef.current!.subscribe(channelName)
      console.log("Initiating subscription to channel:", channelName)

      channel.bind("pusher:subscription_succeeded", () => {
        console.log("Successfully subscribed to channel:", channelName)
        channel.bind("new-message", (data: Message) => {
          console.log("Received new-message event:", data, "user:", temporaryUserId)
          setMessages((prev) => {
            if (!prev.some((msg) => msg.id === data.id)) {
              const updatedMessages = sortMessages([...prev, data])
              console.log("Updated messages:", updatedMessages.length)
              return updatedMessages
            }
            console.log("Skipping duplicate message:", data.id)
            return prev
          })
          setVisibleMessages((prev) => {
            if (!prev.some((msg) => msg.id === data.id)) {
              const updatedVisible = sortMessages([...prev, data])
              setVisibleMessageCount((count) => count + 1)
              console.log("Updated visibleMessages:", updatedVisible.length)
              return updatedVisible
            }
            return prev
          })
          setHasMoreMessages(true)
          if (!showScrollButton) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }, 100)
          }

          if (data.sender_id !== temporaryUserId) {
            markMessageAsRead(conversationId, data.id)
          }
        })

        channel.bind("messages-read", (updatedMessages: Message[]) => {
          console.log("Received messages-read event:", updatedMessages)
          setMessages((prev) => {
            const updated = prev.map((msg) => {
              const updatedMsg = updatedMessages.find((um) => um.id === msg.id)
              return updatedMsg ? { ...msg, is_read: updatedMsg.is_read } : msg
            })
            console.log("Updated messages with is_read:", updated)
            return sortMessages(updated)
          })
          setVisibleMessages((prev) => {
            const updatedVisible = prev.map((msg) => {
              const updatedMsg = updatedMessages.find((um) => um.id === msg.id)
              return updatedMsg ? { ...msg, is_read: updatedMsg.is_read } : msg
            })
            console.log("Updated visibleMessages with is_read:", updatedVisible)
            return sortMessages(updatedVisible)
          })
        })
      })

      channel.bind("pusher:subscription_error", (error: any) => {
        console.error("Subscription error for channel:", channelName, "error:", JSON.stringify(error, null, 2))
        setError(`Failed to subscribe to real-time updates for conversation ${conversationId}. Please try again.`)
      })
    }

    // Check Pusher connection state before subscribing
    if (pusherRef.current.connection.state !== "connected") {
      console.log("Pusher not connected, delaying subscription for conversation:", selectedConversation.id)
      let retryCount = 0
      const maxRetries = 10
      const retrySubscription = setInterval(async () => {
        console.log("Retry attempt:", retryCount + 1, "for conversation:", selectedConversation.id)
        if (pusherRef.current && pusherRef.current.connection.state === "connected") {
          console.log("Pusher connected, proceeding with subscription for conversation:", selectedConversation.id)
          await subscribeToChannel(selectedConversation.id)
          clearInterval(retrySubscription)
        } else if (retryCount >= maxRetries) {
          console.error("Max retries reached for Pusher connection")
          setError("Unable to connect to real-time messaging service after multiple attempts.")
          clearInterval(retrySubscription)
        }
        retryCount++
      }, 5000) // Retry interval 5 seconds
      return () => clearInterval(retrySubscription)
    }

    subscribeToChannel(selectedConversation.id).catch((error) => {
      console.error("Error subscribing to channel:", error)
      setError(`Failed to subscribe to conversation ${selectedConversation.id}. Please try again.`)
    })

    fetchMessages(selectedConversation.id, 1).then((data) => {
      if (data.length > 0) {
        const sortedMessages = sortMessages(data)
        setMessages(sortedMessages)
        setVisibleMessages(sortedMessages.slice(-messagesPerRender))
        setMessagePage(2)
        setVisibleMessageCount(messagesPerRender)
        setHasMoreMessages(data.length === messagesPerPage)
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      } else {
        setHasMoreMessages(false)
      }
    })

    return () => {
      console.log("Cleaning up channel: conversation-", selectedConversation.id)
      if (pusherRef.current) {
        const channel = pusherRef.current.channel(`conversation-${selectedConversation.id}`)
        if (channel) {
          console.log("Unsubscribing from channel during cleanup:", channel.name)
          channel.unbind_all()
          channel.unsubscribe()
          // Wait to ensure cleanup completes
          setTimeout(() => {}, 500)
        }
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollButton(!entry.isIntersecting)
      },
      { root: messagesContainerRef.current, threshold: 0.1 },
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

  useEffect(() => {
    const conversationIdFromUrl = searchParams.get("conversationId")
    if (conversationIdFromUrl && conversations.length > 0) {
      const targetConversation = conversations.find((conv) => conv.id === Number.parseInt(conversationIdFromUrl))
      if (targetConversation) {
        setSelectedConversation(targetConversation)
      }
    }
  }, [searchParams, conversations])

  const fetchConversations = async () => {
    try {
      setError(null)
      const response = await fetch(`${apiUrl}/conversations/list/${temporaryUserId}`)
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Fetch conversations error:", errorText)
        throw new Error(`Error fetching conversations: ${response.status}`)
      }
      const data = await response.json()
      console.log("Fetched conversations:", data)

      const conversationsWithUnread = await Promise.all(
        data.map(async (conv: Conversation) => {
          try {
            const messagesResponse = await fetch(
              `${apiUrl}/messages/list/${conv.id}?user_id=${temporaryUserId}&limit=10`,
            )
            if (!messagesResponse.ok) {
              const errorText = await messagesResponse.text()
              console.error("Fetch messages error for conversation", conv.id, ":", errorText)
              throw new Error(`Error fetching messages for conversation ${conv.id}`)
            }
            const messages = await messagesResponse.json()
            return {
              ...conv,
              has_unread: messages.some((msg: Message) => msg.sender_id !== temporaryUserId && !msg.is_read),
              name: conv.name || conv.other_user?.full_name || "Unknown User",
              last_message_at: conv.last_message_at || null,
            }
          } catch (error: any) {
            console.error(`Error fetching messages for conversation ${conv.id}:`, error.message)
            return {
              ...conv,
              has_unread: false,
              name: conv.other_user?.full_name || "Unknown User",
              last_message_at: null,
            }
          }
        }),
      )

      setConversations(conversationsWithUnread)
      if (conversationsWithUnread.length > 0 && !selectedConversation && !searchParams.get("conversationId")) {
        setSelectedConversation(null)
        setTimeout(() => setSelectedConversation(conversationsWithUnread[0]), 0)
      }
    } catch (error: any) {
      console.error("Error fetching conversations:", error)
      setError("Unable to load conversations. Please try again later.")
    }
  }

  const fetchMessages = async (conversationId: number, pageNum: number) => {
    try {
      setIsLoadingMessages(true)
      const response = await fetch(
        `${apiUrl}/messages/list/${conversationId}?user_id=${temporaryUserId}&limit=${messagesPerPage}&offset=${(pageNum - 1) * messagesPerPage}`,
      )
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Fetch messages error:", errorText)
        throw new Error(`Error fetching messages: ${response.status}`)
      }
      const data = await response.json()
      console.log("Fetched messages for page", pageNum, ":", data)
      return sortMessages(data)
    } catch (error: any) {
      console.error("Error fetching messages:", error)
      setError(`Unable to load messages for conversation ${conversationId}. Please try again.`)
      return []
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const markMessageAsRead = async (conversationId: number, messageId: number) => {
    try {
      console.log("Marking message as read:", { conversationId, messageId })
      const response = await fetch(`${apiUrl}/messages/update/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Mark message as read error:", errorText)
        throw new Error(`Error marking message as read: ${response.status}`)
      }
      const updatedMessage = await response.json()
      console.log("Mark message as read response:", updatedMessage)

      // Update state immediately to reflect is_read change
      setMessages((prev) => {
        const updated = prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg))
        console.log("Updated messages with is_read locally:", updated)
        return sortMessages(updated)
      })
      setVisibleMessages((prev) => {
        const updatedVisible = prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg))
        console.log("Updated visibleMessages with is_read locally:", updatedVisible)
        return sortMessages(updatedVisible)
      })

      // Trigger messages-read event to notify other clients
      await fetch(`${apiUrl}/messages/notify-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message_ids: [messageId],
        }),
      })
    } catch (error: any) {
      console.error("Error marking message as read:", error)
      setError("Unable to mark message as read. Please try again.")
    }
  }

  const handleLoadMore = async () => {
    if (!selectedConversation) return

    console.log("Loading more messages:", { messagesLength: messages.length, visibleMessageCount, hasMoreMessages })
    const newVisibleCount = visibleMessageCount + messagesPerRender
    setVisibleMessageCount(newVisibleCount)

    if (newVisibleCount <= messages.length) {
      setVisibleMessages(sortMessages(messages.slice(-newVisibleCount)))
    } else if (hasMoreMessages) {
      const newMessages = await fetchMessages(selectedConversation.id, messagePage)
      if (newMessages.length > 0) {
        const updatedMessages = sortMessages([...messages, ...newMessages])
        setMessages(updatedMessages)
        setVisibleMessages(sortMessages(updatedMessages.slice(-newVisibleCount)))
        setMessagePage((prev) => prev + 1)
        setHasMoreMessages(newMessages.length === messagesPerPage)
      } else {
        setVisibleMessages(sortMessages(messages.slice(-messages.length)))
        setHasMoreMessages(false)
      }
    } else {
      setVisibleMessages(sortMessages(messages.slice(-messages.length)))
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    try {
      const response = await fetch(`${apiUrl}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          sender_id: temporaryUserId,
          message_text: messageInput,
        }),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Send message error:", errorText)
        throw new Error(`Error sending message: ${response.status}`)
      }
      const newMessage: Message = await response.json()
      console.log("Sent message:", newMessage)
      setMessages((prev) => {
        if (!prev.some((msg) => msg.id === newMessage.id)) {
          return sortMessages([...prev, newMessage])
        }
        return prev
      })
      setVisibleMessages((prev) => {
        if (!prev.some((msg) => msg.id === newMessage.id)) {
          const updatedVisible = sortMessages([...prev, newMessage])
          setVisibleMessageCount((count) => count + 1)
          return updatedVisible
        }
        return prev
      })
      setMessageInput("")
      setHasMoreMessages(true)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error: any) {
      console.error("Error sending message:", error)
      setError("Unable to send message. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage()
  }

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleConversationSelect = (conversation: Conversation) => {
    console.log("Selecting conversation:", conversation.id)
    setSelectedConversation(null)
    setTimeout(() => setSelectedConversation(conversation), 0)
  }

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (filter === "all" || conv.has_unread) &&
      (conv.name.toLowerCase().includes(searchLower) ||
        (conv.property_title && conv.property_title.toLowerCase().includes(searchLower)))
    )
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No messages yet"
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", { month: "long", day: "numeric", year: "numeric" })
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  }

  const isDifferentDay = (prevMessage: Message | null, currentMessage: Message) => {
    if (!prevMessage) return true
    const prevDate = new Date(prevMessage.sent_at).toDateString()
    const currentDate = new Date(currentMessage.sent_at).toDateString()
    return prevDate !== currentDate
  }

  const canLoadMore = hasMoreMessages || messages.length > visibleMessageCount

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Messages</h1>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: "600px" }}>
        <div className="flex h-full">
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-2 mb-2">
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
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-8 rounded-full border-gray-300"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">
                        {conversation.name + " "}
                        <Link href={`/property/${conversation.property_id}`} className="text-blue-500 hover:underline">
                          {conversation.property_title || "Xem chi tiết phòng"}
                        </Link>
                      </h3>
                    </div>
                    <div className="text-xs text-gray-500">
                      {conversation.last_message_at && (
                        <span>
                          {formatTime(conversation.last_message_at)} - {formatDate(conversation.last_message_at)}
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
                {selectedConversation ? selectedConversation.name : "Select a conversation"}
                {selectedConversation?.property_title && (
                  <span className="text-sm text-gray-500">
                    {" - hosting "}
                    {selectedConversation.property_id ? (
                      <Link
                        href={`/property/${selectedConversation.property_id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {selectedConversation.property_title}
                      </Link>
                    ) : (
                      selectedConversation.property_title
                    )}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={messagesContainerRef}>
              {canLoadMore && (
                <Button
                  onClick={handleLoadMore}
                  className="w-full mt-2 rounded-full bg-transparent"
                  variant="outline"
                  disabled={isLoadingMessages}
                >
                  Load More
                </Button>
              )}
              {visibleMessagesMemo.map((message, index) => (
                <div key={`${message.id}-${message.sent_at}`}>
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
                      <div
                        className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
                          message.sender_id === temporaryUserId ? "text-blue-200" : "text-gray-500"
                        }`}
                      >
                        <span>
                          {new Date(message.sent_at).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.sender_id === temporaryUserId && (
                          <span>
                            {message.is_read ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                          </span>
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

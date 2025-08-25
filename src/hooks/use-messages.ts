"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Pusher from "pusher-js"
import { useSearchParams, useRouter } from "next/navigation"
import type { Conversation, Message } from "@/types"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function useMessages(user_id: number, isHost: boolean = false) {
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
  const router = useRouter()

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

  // Navigate to property page with string property_id
  const navigateToProperty = (property_id: string | null) => {
    if (!property_id) {
      console.warn("No property_id provided for navigation")
      setError("Cannot navigate: No property ID available")
      return
    }
    if (typeof property_id !== "string") {
      console.error("property_id is not a string:", property_id, "Type:", typeof property_id)
      setError("Invalid property ID format")
      return
    }
    console.log("Navigating to property with ID:", property_id, "Type:", typeof property_id)
    router.push(`/property/${property_id}`)
  }

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
          console.warn("Pusher environment variables not found, attempting to fetch from API...")
          try {
            const response = await fetch(`${apiUrl}/pusher/get`)
            if (!response.ok) {
              console.warn("Pusher config API not available, disabling real-time features")
              return
            }
            const config = await response.json()
            if (!config || !config.app_key || !config.cluster) {
              console.warn("Invalid Pusher configuration received, disabling real-time features")
              return
            }
            appKey = config.app_key
            cluster = config.cluster
          } catch (fetchError) {
            console.warn("Failed to fetch Pusher config, disabling real-time features:", fetchError)
            return
          }
        }

        try {
          pusherRef.current = new Pusher(appKey, {
            cluster,
            forceTLS: true,
            enabledTransports: ["ws", "wss"],
          })

          pusherRef.current.connection.bind("connected", () => {
            setError(null) // Clear any previous connection errors
          })

          pusherRef.current.connection.bind("error", (err: any) => {
            console.warn("Pusher connection error (non-critical):", JSON.stringify(err, null, 2))
            // Don't set error state for connection issues, just log them
          })

          pusherRef.current.connection.bind("disconnected", () => {
            console.log("Pusher disconnected")
          })

          pusherRef.current.connection.bind("unavailable", () => {
            console.warn("Pusher connection unavailable, real-time features disabled")
          })
        } catch (pusherError) {
          console.warn("Failed to initialize Pusher client:", pusherError)
          pusherRef.current = null
        }
      } catch (error: any) {
        console.warn("Pusher initialization failed, continuing without real-time features:", error.message)
        pusherRef.current = null
      }
    }

    initializePusher()
    fetchConversations()

    // Cleanup when component unmounts
    return () => {
      if (pusherRef.current) {
        try {
          pusherRef.current.allChannels().forEach((channel) => {
            console.log("Unsubscribing from channel:", channel.name)
            channel.unbind_all()
            channel.unsubscribe()
          })
          pusherRef.current.disconnect()
        } catch (cleanupError) {
          console.warn("Error during Pusher cleanup:", cleanupError)
        }
        pusherRef.current = null
      }
    }
  }, [user_id])

  // Handle conversation channel subscription
  useEffect(() => {
    if (!selectedConversation) {
      console.log("No selected conversation, skipping subscription")
      setMessages([])
      setVisibleMessages([])
      setMessagePage(1)
      setHasMoreMessages(true)
      setVisibleMessageCount(messagesPerRender)
      setShowScrollButton(false)
      return
    }

    const subscribeToChannel = async (conversationId: number) => {
      if (!pusherRef.current) {
        console.log("Pusher not available, skipping real-time subscription")
        return
      }

      // Reset channels
      pusherRef.current.allChannels().forEach((channel) => {
        channel.unbind_all()
        channel.unsubscribe()
      })
      pusherRef.current.disconnect()
      await new Promise((resolve) => setTimeout(resolve, 500))
      pusherRef.current.connect()
      await new Promise((resolve) => setTimeout(resolve, 500))

      const channelName = `conversation-${conversationId}`
      const existingChannel = pusherRef.current.channel(channelName)
      if (existingChannel && existingChannel.subscribed) return
      if (existingChannel && existingChannel.subscriptionPending) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const channel = pusherRef.current.subscribe(channelName)

      channel.bind("pusher:subscription_succeeded", () => {
        channel.bind("new-message", (data: Message) => {
          setMessages((prev) => {
            if (!prev.some((msg) => msg.id === data.id)) {
              return sortMessages([...prev, data])
            }
            return prev
          })
          setVisibleMessages((prev) => {
            if (!prev.some((msg) => msg.id === data.id)) {
              setVisibleMessageCount((count) => count + 1)
              return sortMessages([...prev, data])
            }
            return prev
          })
          setHasMoreMessages(true)
          if (!showScrollButton) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
          }
          if (data.sender_id !== user_id) {
            markMessageAsRead(conversationId, data.id)
          }
        })

        channel.bind("messages-read", (updatedMessages: Message[]) => {
          setMessages((prev) => sortMessages(prev.map((msg) => {
            const updatedMsg = updatedMessages.find((um) => um.id === msg.id)
            return updatedMsg ? { ...msg, is_read: updatedMsg.is_read } : msg
          })))
          setVisibleMessages((prev) => sortMessages(prev.map((msg) => {
            const updatedMsg = updatedMessages.find((um) => um.id === msg.id)
            return updatedMsg ? { ...msg, is_read: updatedMsg.is_read } : msg
          })))
        })
      })

      channel.bind("pusher:subscription_error", (error: any) => {
        console.error("Subscription error:", JSON.stringify(error, null, 2))
        setError(`Failed to subscribe to real-time updates for conversation ${conversationId}.`)
      })
    }

    if (pusherRef.current?.connection.state === "connected") {
      subscribeToChannel(selectedConversation.id)
    } else if (pusherRef.current) {
      let retryCount = 0
      const maxRetries = 10
      const retrySubscription = setInterval(async () => {
        if (pusherRef.current?.connection.state === "connected") {
          await subscribeToChannel(selectedConversation.id)
          clearInterval(retrySubscription)
        } else if (retryCount >= maxRetries) {
          setError("Unable to connect to real-time messaging service.")
          clearInterval(retrySubscription)
        }
        retryCount++
      }, 5000)
      return () => clearInterval(retrySubscription)
    }

    fetchMessages(selectedConversation.id, 1).then((data) => {
      if (data.length > 0) {
        const sorted = sortMessages(data)
        setMessages(sorted)
        setVisibleMessages(sorted.slice(-messagesPerRender))
        setMessagePage(2)
        setVisibleMessageCount(messagesPerRender)
        setHasMoreMessages(data.length === messagesPerPage)
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      } else {
        setHasMoreMessages(false)
      }
    })

    return () => {
      if (pusherRef.current) {
        const channel = pusherRef.current.channel(`conversation-${selectedConversation.id}`)
        if (channel) {
          channel.unbind_all()
          channel.unsubscribe()
        }
      }
    }
  }, [selectedConversation, user_id])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowScrollButton(!entry.isIntersecting),
      { root: messagesContainerRef.current, threshold: 0.1 }
    )

    if (messagesEndRef.current) observer.observe(messagesEndRef.current)

    return () => {
      if (messagesEndRef.current) observer.unobserve(messagesEndRef.current)
    }
  }, [visibleMessages])

  useEffect(() => {
    const conversationIdFromUrl = searchParams.get("conversationId")
    if (conversationIdFromUrl && conversations.length > 0) {
      const target = conversations.find((conv) => conv.id === Number.parseInt(conversationIdFromUrl))
      if (target) setSelectedConversation(target)
    }
  }, [searchParams, conversations])

  const fetchConversations = async () => {
    try {
      setError(null)
      const response = await fetch(`${apiUrl}/conversations/list/${user_id}`)
      if (!response.ok) throw new Error(`Error fetching conversations: ${response.status}`)

      // Get the raw response text
      let text = await response.text()
      console.log("fetchConversations: Raw response text:", text)

      // Preprocess the response to wrap property_id numbers in quotes
      text = text.replace(/"property_id":\s*(\d{16,})/g, '"property_id":"$1"')
      console.log("fetchConversations: Preprocessed response text:", text)

      // Parse the preprocessed text
      const data = JSON.parse(text, (key, value) => {
        if (key === "property_id" && value !== null) {
          const stringValue = String(value)
          console.log(`fetchConversations: Converting property_id: ${value} to string: ${stringValue}`)
          return stringValue
        }
        return value
      })

      // Debug parsed data
      console.log("fetchConversations: Parsed conversations data:", JSON.stringify(data, null, 2))
      if (Array.isArray(data) && data.length > 0) {
        console.log("fetchConversations: First conversation property_id:", data[0].property_id, "Type:", typeof data[0].property_id)
      }

      const conversationsWithUnread = await Promise.all(
        (Array.isArray(data) ? data : [data]).map(async (conv: Conversation) => {
          try {
            const messagesResponse = await fetch(`${apiUrl}/messages/list/${conv.id}?user_id=${user_id}&limit=10`)
            if (!messagesResponse.ok) throw new Error(`Error fetching messages for ${conv.id}`)
            const messages = await messagesResponse.json()
            return {
              ...conv,
              property_id: conv.property_id ? String(conv.property_id) : null, // Ensure string
              has_unread: messages.some((msg: Message) => msg.sender_id !== user_id && !msg.is_read),
              name: conv.name || conv.other_user?.full_name || "Unknown User",
              last_message_at: conv.last_message_at || null,
            }
          } catch {
            return {
              ...conv,
              property_id: conv.property_id ? String(conv.property_id) : null, // Ensure string
              has_unread: false,
              name: conv.other_user?.full_name || "Unknown User",
              last_message_at: null,
            }
          }
        })
      )

      // Debug final conversations state
      console.log("Conversations with unread:", JSON.stringify(conversationsWithUnread, null, 2))
      setConversations(conversationsWithUnread)
      if (conversationsWithUnread.length > 0 && !selectedConversation && !searchParams.get("conversationId")) {
        setSelectedConversation(conversationsWithUnread[0])
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
        `${apiUrl}/messages/list/${conversationId}?user_id=${user_id}&limit=${messagesPerPage}&offset=${(pageNum - 1) * messagesPerPage}`
      )
      if (!response.ok) throw new Error(`Error fetching messages: ${response.status}`)
      const data = await response.json()
      return sortMessages(data)
    } catch (error: any) {
      console.error("Error fetching messages:", error)
      setError(`Unable to load messages for conversation ${conversationId}.`)
      return []
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const markMessageAsRead = async (conversationId: number, messageId: number) => {
    try {
      const response = await fetch(`${apiUrl}/messages/update/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      })
      if (!response.ok) throw new Error(`Error marking message as read: ${response.status}`)
      const updatedMessage = await response.json()

      setMessages((prev) => sortMessages(prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg))))
      setVisibleMessages((prev) => sortMessages(prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg))))

      await fetch(`${apiUrl}/messages/notify-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId, message_ids: [messageId] }),
      })
    } catch (error: any) {
      console.error("Error marking message as read:", error)
      setError("Unable to mark message as read.")
    }
  }

  const handleLoadMore = async () => {
    if (!selectedConversation) return

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
        setVisibleMessages(sortMessages(messages))
        setHasMoreMessages(false)
      }
    } else {
      setVisibleMessages(sortMessages(messages))
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
          sender_id: user_id,
          message_text: messageInput,
        }),
      })
      if (!response.ok) throw new Error(`Error sending message: ${response.status}`)
      const newMessage: Message = await response.json()
      setMessages((prev) => {
        if (!prev.some((msg) => msg.id === newMessage.id)) {
          return sortMessages([...prev, newMessage])
        }
        return prev
      })
      setVisibleMessages((prev) => {
        if (!prev.some((msg) => msg.id === newMessage.id)) {
          setVisibleMessageCount((count) => count + 1)
          return sortMessages([...prev, newMessage])
        }
        return prev
      })
      setMessageInput("")
      setHasMoreMessages(true)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } catch (error: any) {
      console.error("Error sending message:", error)
      setError("Unable to send message.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage()
  }

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleConversationSelect = (conversation: Conversation) => {
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

  const groupedConversations = useMemo(() => {
    if (!isHost) return null

    const groups: { [key: string]: { property: { id: string; title: string }; convs: Conversation[] } } = {}
    filteredConversations.forEach((conv) => {
      if (conv.property_id) {
        if (!groups[conv.property_id]) {
          groups[conv.property_id] = {
            property: { id: conv.property_id, title: conv.property_title || "Unknown Property" },
            convs: [],
          }
        }
        groups[conv.property_id].convs.push(conv)
      }
    })
    return Object.values(groups)
  }, [filteredConversations, isHost])

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
    return new Date(prevMessage.sent_at).toDateString() !== new Date(currentMessage.sent_at).toDateString()
  }

  const canLoadMore = hasMoreMessages || messages.length > visibleMessageCount

  return {
    conversations,
    selectedConversation,
    visibleMessagesMemo,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    messageInput,
    setMessageInput,
    isLoadingMessages,
    showScrollButton,
    error,
    messagesEndRef,
    messagesContainerRef,
    filteredConversations,
    groupedConversations,
    formatDate,
    formatTime,
    isDifferentDay,
    canLoadMore,
    handleLoadMore,
    handleSendMessage,
    handleKeyPress,
    handleScrollToBottom,
    handleConversationSelect,
    navigateToProperty,
  }
}
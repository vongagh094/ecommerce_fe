"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, CheckCircle, Circle, Search, ArrowDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useMessages } from "@/hooks/use-messages"

export default function HostMessagesPage() {
  const { user } = useAuth()
  const user_id = Number(user?.id || 1)

  const {
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
  } = useMessages(user_id, true)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Host Messages</h1>
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
              {groupedConversations?.map((group) => {
                console.log(`HostMessagesPage: Rendering group for property_id: ${group.property.id}, Title: ${group.property.title}, Type: ${typeof group.property.id}`)
                return (
                  <div key={group.property.id} className="border-b border-gray-200">
                    <div className="p-2 bg-gray-100 font-semibold text-sm">
                      {group.property.id ? (
                        <span
                          onClick={() => navigateToProperty(group.property.id)}
                          className="text-blue-500 hover:underline cursor-pointer"
                        >
                          {group.property.title}
                        </span>
                      ) : (
                        <span className="text-gray-500">{group.property.title}</span>
                      )}
                    </div>
                    {group.convs.map((conversation) => {
                      console.log(`HostMessagesPage: Rendering conversation ${conversation.id}, property_id: ${conversation.property_id}, Type: ${typeof conversation.property_id}`)
                      return (
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
                                {conversation.name}
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
                      )
                    })}
                  </div>
                )
              })}
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
                      <span
                        onClick={() => {
                          console.log(`HostMessagesPage: Navigating to property_id: ${selectedConversation.property_id}, Type: ${typeof selectedConversation.property_id}`)
                          navigateToProperty(selectedConversation.property_id)
                        }}
                        className="text-blue-500 hover:underline cursor-pointer"
                      >
                        {selectedConversation.property_title}
                      </span>
                    ) : (
                      <span className="text-gray-500">{selectedConversation.property_title}</span>
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
                  <div className={`flex ${message.sender_id === user_id ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        message.sender_id === user_id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <div>{message.message_text}</div>
                      <div
                        className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
                          message.sender_id === user_id ? "text-blue-200" : "text-gray-500"
                        }`}
                      >
                        <span>
                          {new Date(message.sent_at).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.sender_id === user_id && (
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
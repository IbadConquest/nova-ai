"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "@/components/message-bubble"
import { TypingIndicator } from "@/components/typing-indicator"
import { Plus, Mic, Send, Settings } from "lucide-react"
import type { Message } from "@/lib/messages"
import type { User } from "@/lib/auth"

interface ChatInterfaceProps {
  user: User | null
  onConfigOpen: () => void
}

export function ChatInterface({ user, onConfigOpen }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load messages on mount
  useEffect(() => {
    if (user) {
      loadMessages()
    }
  }, [user])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  const loadMessages = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/messages?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading || !user) return

    const userMessage = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    // Add user message immediately
    const newUserMessage: Message = {
      id: Date.now().toString(),
      userId: user.id,
      content: userMessage,
      role: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newUserMessage])

    try {
      // Save user message
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          content: userMessage,
          role: "user",
        }),
      })

      // Show typing indicator
      setIsTyping(true)

      // Simulate AI response delay
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        userId: user.id,
        content: aiResponse,
        role: "assistant",
        timestamp: new Date().toISOString(),
      }

      // Save AI message
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          content: aiResponse,
          role: "assistant",
        }),
      })

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simple demo AI responses
    const responses = [
      "I understand you're asking about: " + userMessage + ". Let me help you with that.",
      "That's an interesting question! Based on what you've shared, I'd suggest considering a few different approaches.",
      "Thanks for reaching out! I can definitely help you with " + userMessage.toLowerCase() + ".",
      "Great question! Here's what I think about " + userMessage + "...",
      "I'd be happy to assist with that. Let me break this down for you.",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <>
      {/* Chat Header */}
      <div className="chat-header px-6 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center ring-1 ring-white/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l8.66 5v8L12 21l-8.66-5V8L12 3z" stroke="white" strokeWidth="1.6" />
            </svg>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-foreground">Assistant</h1>
            <p className="text-xs text-muted-foreground">Nova can make mistakes. Check important info.</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onConfigOpen} className="text-muted-foreground hover:text-primary">
          <Settings className="h-4 w-4 mr-2" />
          Config
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="h-[68vh] px-4 sm:px-6 py-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <path d="M12 3l8.66 5v8L12 21l-8.66-5V8L12 3z" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Welcome to Nova AI</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Start a conversation by typing a message below. I'm here to help with any questions you have.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.role === "user"}
              animate={index === messages.length - 1}
            />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Composer */}
      <div className="chat-composer px-4 sm:px-6 py-4 border-t border-border/50">
        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-2 flex items-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="min-h-[44px] max-h-[200px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
            rows={1}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Button type="submit" size="sm" className="h-10 w-10 rounded-xl" disabled={!inputValue.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  )
}

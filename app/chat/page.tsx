"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { ConfigDialog } from "@/components/config-dialog"
import { gsap } from "gsap"

export default function ChatPage() {
  const { user } = useAuth()
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const ctx = gsap.context(() => {
      // Animate chat container entrance
      gsap.fromTo(
        ".chat-container",
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" },
      )

      // Animate chat header
      gsap.fromTo(
        ".chat-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" },
      )

      // Animate composer
      gsap.fromTo(
        ".chat-composer",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: "power2.out" },
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <AuthGuard requireAuth={true}>
      <div ref={containerRef} className="min-h-screen bg-nova-gradient dark:bg-nova-gradient-dark">
        <Navigation />

        <main className="py-10 sm:py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="chat-container glass rounded-3xl overflow-hidden shadow-2xl">
              <ChatInterface user={user} onConfigOpen={() => setIsConfigOpen(true)} />
            </div>

            <p className="text-xs text-muted-foreground mt-3 text-center">
              Nova can make mistakes. Check important info.
            </p>
          </div>
        </main>

        <ConfigDialog open={isConfigOpen} onOpenChange={setIsConfigOpen} />
      </div>
    </AuthGuard>
  )
}

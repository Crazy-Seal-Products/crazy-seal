'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ChatThread, type ChatMessage } from '@/components/assistant/ChatThread'

/** The staff Assistant chat. Keeps the open chat in the URL (?chat=) and refreshes the chat list after each answer. */
export function AdminAssistant({ chatId, messages, disabledReason }: { chatId: string | null; messages: ChatMessage[]; disabledReason: string | null }) {
  const router = useRouter()
  return (
    <ChatThread
      key={chatId ?? 'new'}
      endpoint="/api/admin/assistant/chat/"
      variant="admin"
      conversationId={chatId}
      initialMessages={messages}
      autoFocus
      disabledReason={disabledReason}
      placeholder="Ask about a customer, an order, a warranty, or the products…"
      onConversation={(id) => window.history.replaceState(null, '', `/portal/admin/assistant/?chat=${id}`)}
      onTurnDone={() => router.refresh()}
      empty={
        <div className="space-y-1.5 px-1 pt-1 text-[13px] text-adm-muted">
          <p className="text-adm-text">Ask anything about customers, orders, warranties or the products. Lookups are read-only.</p>
          <p>Try: “What did john@example.com order last?” · “Is order 12345 shipped?” · “Can Crazy Seal go over EPDM?”</p>
        </div>
      }
    />
  )
}

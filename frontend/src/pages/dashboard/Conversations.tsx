"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Search,
  Filter,
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Tag,
  ShieldAlert,
  ArrowLeft,
  Send,
  Paperclip,
  Sparkles,
  Bot,
  X,
  ChevronDown,
  MoreHorizontal,
  Wand2,
  Copy,
  Check,
  MessageCircle, // WhatsApp-like (neutro)
} from "lucide-react"

/* =========================
   TYPES
========================= */

type Tab = "waiting" | "in_progress" | "done"
type Channel = "whatsapp" | "instagram" | "web"
type Priority = "high" | "medium" | "low"

type Conversation = {
  id: string
  name: string
  phone: string
  channel: Channel
  tab: Tab
  unread: number
  lastText: string
  lastAt: string
  priority: Priority
  tags: string[]
  riskScore: number
}

type MsgRole = "client" | "agent" | "system"
type Message = {
  id: string
  convId: string
  role: MsgRole
  text: string
  at: string
}

type QuickTemplate = {
  id: string
  title: string
  text: string
}

/* =========================
   CONSTANTS
========================= */

const TABS: { id: Tab; label: string }[] = [
  { id: "waiting", label: "Aguardando" },
  { id: "in_progress", label: "Em atendimento" },
  { id: "done", label: "Finalizados" },
]

const QUICK_TEMPLATES: QuickTemplate[] = [
  { id: "t1", title: "Saudação", text: "Olá! Posso te ajudar?" },
  { id: "t2", title: "Confirmar dados", text: "Pode confirmar seus dados, por favor?" },
  { id: "t3", title: "Orçamento", text: "Vou preparar um orçamento para você." },
  { id: "t4", title: "Agendamento", text: "Qual dia e horário você prefere?" },
]

/* =========================
   MOCK
========================= */

const isoMinAgo = (m: number) =>
  new Date(Date.now() - m * 60000).toISOString()

const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Edna Cunha",
    phone: "+55 11 9XXXX-1111",
    channel: "whatsapp",
    tab: "waiting",
    unread: 2,
    lastText: "Quero saber valores.",
    lastAt: isoMinAgo(9),
    priority: "high",
    tags: ["Novo lead"],
    riskScore: 78,
  },
  {
    id: "2",
    name: "Tecnologia TI",
    phone: "+55 19 9XXXX-4444",
    channel: "whatsapp",
    tab: "waiting",
    unread: 1,
    lastText: "Preciso de ajuda.",
    lastAt: isoMinAgo(65),
    priority: "high",
    tags: ["Agendamento"],
    riskScore: 82,
  },
]

const MESSAGES: Message[] = [
  { id: "m1", convId: "1", role: "client", text: "Boa noite!", at: isoMinAgo(9) },
  { id: "m2", convId: "1", role: "client", text: "Quero saber valores.", at: isoMinAgo(8) },
]

/* =========================
   PAGE
========================= */

export default function Conversations() {
  const [tab, setTab] = useState<Tab>("waiting")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileChat, setMobileChat] = useState(false)
  const [text, setText] = useState("")

  const filtered = useMemo(() => {
    return CONVERSATIONS.filter(
      (c) =>
        c.tab === tab &&
        (c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query))
    )
  }, [tab, query])

  const selected = useMemo(
    () => CONVERSATIONS.find((c) => c.id === selectedId),
    [selectedId]
  )

  const messages = useMemo(
    () => MESSAGES.filter((m) => m.convId === selectedId),
    [selectedId]
  )

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-[360px_1fr] xl:grid-cols-[360px_1fr_360px] gap-4">

      {/* ================= LIST ================= */}
      <aside className={`dash-card p-3 ${mobileChat ? "hidden md:block" : ""}`}>
        <div className="mb-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conversa..."
            className="pl-9 py-3 w-full rounded-xl bg-white/70 dark:bg-black/40"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedId(c.id)
                setMobileChat(true)
              }}
              className={`w-full text-left p-4 rounded-2xl border ${
                c.id === selectedId
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-white/60 dark:bg-black/40"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm opacity-70">{c.lastText}</p>
                </div>
                {c.unread > 0 && (
                  <span className="text-xs font-bold bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded-full">
                    {c.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ================= CHAT ================= */}
      <main className={`dash-card-blue flex flex-col ${!mobileChat ? "hidden md:flex" : "flex"}`}>
        {selected ? (
          <>
            {/* HEADER */}
            <div className="p-4 border-b flex items-center gap-3">
              <button
                className="md:hidden"
                onClick={() => setMobileChat(false)}
              >
                <ArrowLeft />
              </button>

              <MessageCircle className="opacity-70" />

              <div>
                <p className="font-semibold">{selected.name}</p>
                <p className="text-xs opacity-70">{selected.phone}</p>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[78%] px-4 py-3 rounded-3xl ${
                    m.role === "agent"
                      ? "ml-auto bg-black text-white dark:bg-white dark:text-black"
                      : "bg-white/70 dark:bg-black/40"
                  }`}
                >
                  <p>{m.text}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(m.at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* COMPOSER */}
            <div className="p-4 border-t flex gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite sua mensagem…"
                className="flex-1 rounded-xl p-3 bg-white/70 dark:bg-black/40"
              />
              <button className="btn-primary w-auto px-5">
                <Send />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-60">
            Selecione uma conversa
          </div>
        )}
      </main>

      {/* ================= DETAILS (DESKTOP) ================= */}
      <aside className="hidden xl:block dash-card p-5">
        {selected ? (
          <>
            <p className="font-semibold mb-3">Perfil do cliente</p>
            <p className="text-sm">{selected.name}</p>
            <p className="text-sm opacity-70">{selected.phone}</p>

            <div className="mt-4 space-y-2">
              <p className="text-sm">Risco: {selected.riskScore}%</p>
              <p className="text-sm">Tags: {selected.tags.join(", ")}</p>
            </div>
          </>
        ) : (
          <p className="opacity-60">Nenhuma conversa selecionada</p>
        )}
      </aside>
    </div>
  )
}

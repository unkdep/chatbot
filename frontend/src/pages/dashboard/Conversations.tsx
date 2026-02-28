import React, { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  Phone,
  ShieldAlert,
  ArrowLeft,
  Send,
  Paperclip,
  Sparkles,
  Bot,
  X,
  MoreHorizontal,
  Wand2,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react"

import wppWhite from "../../assets/images/wppwhite.jpg"
import wppDark from "../../assets/images/wppdark.jpg"
import { useTranslation } from "react-i18next"

/* ========================= TYPES ========================= */
type Tab = "waiting" | "in_progress" | "done"
type Channel = "whatsapp"
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

/* ========================= CONSTANTS ========================= */
const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: "waiting",     label: "Aguardando",     icon: <Clock className="h-3.5 w-3.5" /> },
  { id: "in_progress", label: "Em atendimento", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { id: "done",        label: "Finalizados",    icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
]

const QUICK_TEMPLATES: QuickTemplate[] = [
  { id: "t1", title: "Saudação",        text: "Olá! 😊 Posso te ajudar com o que você precisa hoje?" },
  { id: "t2", title: "Confirmar dados", text: "Perfeito. Você pode confirmar seu nome e a melhor forma de contato?" },
  { id: "t3", title: "Orçamento",       text: "Posso te enviar um orçamento rápido. Qual opção/serviço você busca?" },
  { id: "t4", title: "Agendamento",     text: "Vamos agendar. Qual dia e horário você prefere?" },
  { id: "t5", title: "Retorno",         text: "Vou verificar aqui e já te retorno em alguns minutos, combinado?" },
  { id: "t6", title: "Encerramento",    text: "Consegui te ajudar? Se precisar de algo, fico à disposição." },
]

function isoMinAgo(min: number) {
  return new Date(Date.now() - min * 60 * 1000).toISOString()
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Edna Cunha",
    phone: "+55 11 9XXXX-1111",
    channel: "whatsapp",
    tab: "waiting",
    unread: 2,
    lastText: "Boa noite! Quero saber valores.",
    lastAt: isoMinAgo(8),
    priority: "high",
    tags: ["Novo lead", "Orçamento"],
    riskScore: 78,
  },
  {
    id: "c2",
    name: "Tecnologia da Informação",
    phone: "+55 19 9XXXX-4444",
    channel: "whatsapp",
    tab: "waiting",
    unread: 1,
    lastText: "Preciso de ajuda com agendamento.",
    lastAt: isoMinAgo(65),
    priority: "high",
    tags: ["Agendamento"],
    riskScore: 82,
  },
  {
    id: "c3",
    name: "Cliente 2272554438",
    phone: "+55 11 9XXXX-5555",
    channel: "whatsapp",
    tab: "waiting",
    unread: 0,
    lastText: "Quero saber como funciona.",
    lastAt: isoMinAgo(12),
    priority: "medium",
    tags: ["Dúvida"],
    riskScore: 55,
  },
]

const MOCK_MESSAGES: Message[] = [
  { id: "m1",  convId: "c1", role: "client", text: "Boa noite! Quero saber valores.",          at: isoMinAgo(8) },
  { id: "m2",  convId: "c1", role: "system", text: "Cliente aguardando atendimento.",           at: isoMinAgo(8) },
  { id: "m3",  convId: "c2", role: "client", text: "Preciso de ajuda com agendamento.",         at: isoMinAgo(65) },
  { id: "m4",  convId: "c2", role: "client", text: "Tem horário amanhã?",                       at: isoMinAgo(63) },
  { id: "m10", convId: "c3", role: "client", text: "Quero saber como funciona.",                at: isoMinAgo(12) },
]

/* ========================= THEME HOOK ========================= */
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false
    return document.documentElement.classList.contains("dark")
  })
  useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() => setIsDark(el.classList.contains("dark")))
    obs.observe(el, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])
  return isDark
}

/* ========================= AVATAR COLOR ========================= */
const AVATAR_COLORS: Array<[string, string]> = [
  ["#dbeafe", "#1d4ed8"],
  ["#dcfce7", "#15803d"],
  ["#fce7f3", "#be185d"],
  ["#fef3c7", "#b45309"],
  ["#ede9fe", "#6d28d9"],
  ["#ffedd5", "#c2410c"],
]
function getAvatarColor(name: string): [string, string] {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?"
}

/* ========================= PAGE ========================= */
type MobileView  = "list" | "chat" | "filters"
type ExtraFilter = "none" | "risk"

export default function Conversations() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab,           setTab]           = useState<Tab>("waiting")
  const [query,         setQuery]         = useState("")
  const [extraFilter,   setExtraFilter]   = useState<ExtraFilter>("none")
  const [selectedId,    setSelectedId]    = useState<string>(MOCK_CONVERSATIONS[0]?.id ?? "")
  const [mobileView,    setMobileView]    = useState<MobileView>("list")
  const [text,          setText]          = useState("")
  const [aiAssist,      setAiAssist]      = useState(true)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [copiedId,      setCopiedId]      = useState<string | null>(null)

  const isDark = useIsDarkMode()

  const [localConvs, setLocalConvs] = useState(MOCK_CONVERSATIONS)
  const [localMsgs,  setLocalMsgs]  = useState(MOCK_MESSAGES)

  const tabParam    = (searchParams.get("tab")    || "").toLowerCase()
  const openParam   = (searchParams.get("open")   || "").trim()
  const filterParam = (searchParams.get("filter") || "").toLowerCase()

  useEffect(() => {
    if (tabParam === "waiting" || tabParam === "in_progress" || tabParam === "done")
      setTab(tabParam as Tab)
    if (filterParam === "risk") { setExtraFilter("risk"); setTab("waiting") }
    else setExtraFilter("none")
    if (openParam) {
      const exists = localConvs.some((c) => c.id === openParam)
      if (exists) { setSelectedId(openParam); setMobileView("chat") }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam, openParam, filterParam])

  function patchParams(patch: Record<string, string | null | undefined>) {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(patch)) {
      if (!v) next.delete(k); else next.set(k, v)
    }
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true })
  }

  function setTabAndUrl(nextTab: Tab) {
    setTab(nextTab)
    patchParams({ tab: nextTab, open: null })
    setMobileView("list")
    setTemplatesOpen(false)
  }

  function setRiskFilter(on: boolean) {
    setExtraFilter(on ? "risk" : "none")
    patchParams({ filter: on ? "risk" : null, tab: on ? "waiting" : tab, open: null })
    if (on) setTab("waiting")
    setMobileView("list")
    setTemplatesOpen(false)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return localConvs
      .filter((c) => c.tab === tab)
      .filter((c) => (extraFilter === "risk" ? c.riskScore >= 75 : true))
      .filter((c) => {
        if (!q) return true
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.lastText.toLowerCase().includes(q) ||
          c.tags.some((tg) => tg.toLowerCase().includes(q))
        )
      })
      .sort(
        (a, b) =>
          priorityWeight(b.priority) - priorityWeight(a.priority) ||
          new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
      )
  }, [localConvs, tab, query, extraFilter])

  const selected = useMemo(() => {
    const found = localConvs.find((c) => c.id === selectedId)
    return found ?? filtered[0] ?? localConvs[0]
  }, [localConvs, filtered, selectedId])

  const messages = useMemo(
    () => localMsgs.filter((m) => m.convId === selected?.id),
    [localMsgs, selected?.id]
  )

  const counts = useMemo(() => ({
    waiting:    localConvs.filter((c) => c.tab === "waiting").length,
    inProgress: localConvs.filter((c) => c.tab === "in_progress").length,
    done:       localConvs.filter((c) => c.tab === "done").length,
    riskHigh:   localConvs.filter((c) => c.riskScore >= 75).length,
  }), [localConvs])

  const bottomRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selected?.id, messages.length])

  function openConv(id: string) {
    setSelectedId(id)
    setTemplatesOpen(false)
    setMobileView("chat")
    setLocalConvs((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
    patchParams({ open: id })
  }

  function backToList() {
    setMobileView("list")
    setTemplatesOpen(false)
    patchParams({ open: null })
  }

  function acceptConv() {
    if (!selected) return
    setLocalConvs((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, tab: "in_progress" } : c))
    )
    setTabAndUrl("in_progress")
  }

  function finishConv() {
    if (!selected) return
    setLocalConvs((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, tab: "done" } : c))
    )
    setTabAndUrl("done")
  }

  function sendMessage() {
    if (!selected) return
    const v = text.trim()
    if (!v) return
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      convId: selected.id,
      role: "agent",
      text: v,
      at: new Date().toISOString(),
    }
    setLocalMsgs((prev) => [...prev, newMsg])
    setLocalConvs((prev) =>
      prev.map((c) =>
        c.id === selected.id ? { ...c, lastText: v, lastAt: newMsg.at } : c
      )
    )
    setText("")
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }))
  }

  function useTemplate(tmpl: QuickTemplate) {
    setText((p) => (p ? `${p}\n\n${tmpl.text}` : tmpl.text))
    setTemplatesOpen(false)
  }

  async function copyTemplate(tmpl: QuickTemplate) {
    try {
      await navigator.clipboard.writeText(tmpl.text)
      setCopiedId(tmpl.id)
      setTimeout(() => setCopiedId(null), 900)
    } catch { /* ignore */ }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col w-full h-full text-[rgb(var(--text-1))] overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 w-full mx-auto max-w-[1560px] 2xl:max-w-[1720px] px-4 md:px-8 pt-4 md:pt-6 pb-4 md:pb-6">

        <TopHeader
          t={t}
          counts={counts}
          tab={tab}
          setTab={setTabAndUrl}
          query={query}
          setQuery={setQuery}
          extraFilter={extraFilter}
          setRiskFilter={setRiskFilter}
          mobileView={mobileView}
          setMobileView={setMobileView}
        />

        {/* ── Main grid ── */}
        <section className="flex-1 min-h-0 mt-4 md:mt-5 flex gap-4 md:gap-5 items-stretch">

          {/* LIST PANEL */}
          <div
            className={[
              "flex flex-col min-h-0 shrink-0 h-full",
              "w-full md:w-[300px] lg:w-[320px]",
              "rounded-2xl overflow-hidden",
              "border border-[rgb(var(--border))]",
              "bg-[rgb(var(--bg-surface-1))]",
              "shadow-sm",
              mobileView === "chat"    ? "hidden md:flex" : "flex",
              mobileView === "filters" ? "hidden"         : "",
            ].join(" ")}
          >
            {/* List header */}
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border))] shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">{t("conversations.s_86d0e6f3")}</p>
                  <p className="text-xs text-[rgb(var(--text-3))] mt-0.5">
                    {filtered.length} {filtered.length === 1 ? "encontrada" : "encontradas"}
                  </p>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-[rgb(var(--bg-surface-2))] hover:opacity-80 transition"
                  aria-label={t("conversations.s_d52646bf")}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-3))]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("conversations.s_6a00ffdc")}
                  className={[
                    "w-full pl-8 pr-3 py-1.5 text-sm rounded-lg",
                    "bg-[rgb(var(--bg-surface-2))]",
                    "border border-[rgb(var(--border))]",
                    "placeholder:text-[rgb(var(--text-3))]",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
                    "transition",
                  ].join(" ")}
                />
              </div>

              {/* Tab pills */}
              <div className="flex gap-1">
                {TABS.map((tabItem) => {
                  const active = tabItem.id === tab
                  const count  = tabItem.id === "waiting" ? counts.waiting : tabItem.id === "in_progress" ? counts.inProgress : counts.done
                  return (
                    <button
                      key={tabItem.id}
                      type="button"
                      onClick={() => setTabAndUrl(tabItem.id)}
                      className={[
                        "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition",
                        active
                          ? "bg-[rgb(var(--accent)/0.14)] text-[rgb(var(--text-1))]"
                          : "text-[rgb(var(--text-2))] hover:bg-[rgb(var(--bg-surface-2))]",
                      ].join(" ")}
                    >
                      {tabItem.icon}
                      <span className="hidden lg:inline">{tabItem.label}</span>
                      {count > 0 && (
                        <span className={[
                          "ml-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
                          active
                            ? "bg-[rgb(var(--accent)/0.25)] text-[rgb(var(--text-1))]"
                            : "bg-[rgb(var(--bg-surface-2))] text-[rgb(var(--text-2))]",
                        ].join(" ")}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cards scroll area */}
            <div className="overflow-y-auto flex-1 min-h-0 p-2 space-y-1">
              {filtered.map((c) => (
                <ConversationCard
                  key={c.id}
                  c={c}
                  active={c.id === selected?.id}
                  onOpen={() => openConv(c.id)}
                />
              ))}
              {filtered.length === 0 && (
                <EmptyState
                  title={t("conversations.s_ed415f02")}
                  text="Tente mudar a aba ou remover os filtros."
                />
              )}
            </div>
          </div>

          {/* CHAT DESKTOP */}
          <div className="hidden md:flex flex-1 min-h-0 items-stretch justify-center">
            <div
              className={[
                "flex flex-col min-h-0 h-full w-full max-w-[820px]",
                "rounded-2xl overflow-hidden",
                "border border-[rgb(var(--border))]",
                "bg-[rgb(var(--bg-surface-1))]",
                "shadow-sm",
              ].join(" ")}
            >
              <ChatHeaderDesktop t={t} selected={selected} aiAssist={aiAssist} onAccept={acceptConv} onFinish={finishConv} />
              <ChatBody t={t} messages={messages} bottomRef={bottomRef} isDark={isDark} />
              <ChatComposer
                t={t}
                text={text}
                setText={setText}
                sendMessage={sendMessage}
                handleKeyDown={handleKeyDown}
                templatesOpen={templatesOpen}
                setTemplatesOpen={setTemplatesOpen}
                aiAssist={aiAssist}
                setAiAssist={setAiAssist}
                copiedId={copiedId}
                copyTemplate={copyTemplate}
                useTemplate={useTemplate}
              />
            </div>
          </div>
        </section>
      </div>

      {/* ── Mobile: chat overlay ── */}
      <div
        className={[
          "md:hidden",
          mobileView === "chat" ? "fixed inset-0 z-[999] w-screen overflow-hidden box-border" : "hidden",
        ].join(" ")}
        style={{
          paddingLeft:   "calc(8px + env(safe-area-inset-left))",
          paddingRight:  "calc(8px + env(safe-area-inset-right))",
          paddingTop:    "calc(18px + env(safe-area-inset-top))",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        <div className="h-full w-full max-w-[720px] mx-auto rounded-2xl overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))] shadow-2xl flex flex-col">
          <ChatHeaderMobile
            t={t}
            selected={selected}
            aiAssist={aiAssist}
            onBack={backToList}
            onAccept={acceptConv}
            onFinish={finishConv}
          />
          <ChatBody t={t} messages={messages} bottomRef={bottomRef} isDark={isDark} />
          <ChatComposer
            t={t}
            text={text}
            setText={setText}
            sendMessage={sendMessage}
            handleKeyDown={handleKeyDown}
            templatesOpen={templatesOpen}
            setTemplatesOpen={setTemplatesOpen}
            aiAssist={aiAssist}
            setAiAssist={setAiAssist}
            copiedId={copiedId}
            copyTemplate={copyTemplate}
            useTemplate={useTemplate}
          />
        </div>
      </div>

      {/* ── Mobile: filters overlay ── */}
      <div
        className={[
          "md:hidden fixed inset-0 z-[1000]",
          mobileView === "filters" ? "block" : "hidden",
        ].join(" ")}
        style={{
          paddingLeft:   "calc(8px + env(safe-area-inset-left))",
          paddingRight:  "calc(8px + env(safe-area-inset-right))",
          paddingTop:    "calc(18px + env(safe-area-inset-top))",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        <MobileFilters
          t={t}
          tab={tab}
          setTab={setTabAndUrl}
          extraFilter={extraFilter}
          setRiskFilter={setRiskFilter}
          query={query}
          setQuery={setQuery}
          onBack={() => setMobileView("list")}
        />
      </div>
    </div>
  )
}

/* ========================= MOBILE FILTERS ========================= */
function MobileFilters({
  t, tab, setTab, extraFilter, setRiskFilter, query, setQuery, onBack,
}: {
  t: (key: string) => string
  tab: Tab; setTab: (tVal: Tab) => void
  extraFilter: ExtraFilter; setRiskFilter: (on: boolean) => void
  query: string; setQuery: (v: string) => void
  onBack: () => void
}) {
  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))]">
      <div className="p-4 border-b border-[rgb(var(--border))] shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 rounded-xl bg-[rgb(var(--bg-surface-2))] hover:opacity-80 transition"
            onClick={onBack}
            aria-label={t("conversations.s_6e8df5eb")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-semibold text-base">{t("conversations.s_dbcf4f73")}</h2>
            <p className="text-xs text-[rgb(var(--text-2))]">{t("conversations.s_33c18dae")}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-5">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[rgb(var(--text-2))] uppercase tracking-wide">{t("conversations.s_a62405e2")}</label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-3))]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("conversations.s_c0c2a463")}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.16)]"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[rgb(var(--text-2))] uppercase tracking-wide">{t("conversations.s_13a169f3")}</label>
          {TABS.map((tabItem) => {
            const active = tabItem.id === tab
            return (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setTab(tabItem.id)}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition",
                  active
                    ? "bg-[rgb(var(--accent)/0.12)] font-semibold"
                    : "bg-[rgb(var(--bg-surface-2))] hover:opacity-90",
                ].join(" ")}
              >
                {tabItem.icon}
                <span className="flex-1">{tabItem.label}</span>
                {active && <Check className="h-4 w-4 shrink-0 opacity-60" />}
              </button>
            )
          })}
        </div>

        {/* Risk filter */}
        <button
          type="button"
          onClick={() => setRiskFilter(extraFilter !== "risk")}
          className={[
            "w-full flex items-center gap-3 p-3 rounded-xl transition",
            extraFilter === "risk"
              ? "bg-red-500/10 border border-red-200 dark:border-red-900"
              : "bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] hover:opacity-90",
          ].join(" ")}
        >
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">{t("conversations.s_0b9621a8")}</p>
            <p className="text-xs text-[rgb(var(--text-2))] mt-0.5">
              {extraFilter === "risk" ? "Ativo — risco ≥ 75%" : "Desativado"}
            </p>
          </div>
          {extraFilter === "risk" && <Check className="h-4 w-4 text-red-500 shrink-0" />}
        </button>
      </div>
    </div>
  )
}

/* ========================= TOP HEADER ========================= */
function TopHeader({
  t, counts, tab, setTab, query, setQuery, extraFilter, setRiskFilter, mobileView, setMobileView,
}: {
  t: (key: string) => string
  counts: { waiting: number; inProgress: number; done: number; riskHigh: number }
  tab: Tab; setTab: (tVal: Tab) => void
  query: string; setQuery: (v: string) => void
  extraFilter: ExtraFilter; setRiskFilter: (on: boolean) => void
  mobileView: MobileView; setMobileView: (v: MobileView) => void
}) {
  return (
    <section aria-label={t("conversations.s_1e3adf31")} className="shrink-0">
      <div className="flex flex-col gap-3">

        {/* Row 1: title + stat pills */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))]">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate leading-tight">{t("conversations.s_2132daa4")}</h1>
              <p className="text-xs text-[rgb(var(--text-2))]">{t("conversations.s_57ce0c6e")}</p>
            </div>
          </div>

          {/* Mobile mini-pills */}
          <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto pb-0.5">
            <MiniPill icon={<Clock className="h-3 w-3" />}        label={t("conversations.s_086a48e0")}       value={counts.waiting}    />
            <MiniPill icon={<MessageSquare className="h-3 w-3" />} label={t("conversations.s_5751f19f")}  value={counts.inProgress} />
            <MiniPill icon={<ShieldAlert className="h-3 w-3" />}   label={t("conversations.s_c5ddc1a9")}      value={counts.riskHigh}   danger />
          </div>

          {/* Desktop stat pills */}
          <div className="hidden sm:flex items-center gap-2">
            <StatPill icon={<Clock className="h-3.5 w-3.5" />}        label={t("conversations.s_3aa040dc")}     value={counts.waiting}    />
            <StatPill icon={<MessageSquare className="h-3.5 w-3.5" />} label={t("conversations.s_50d75ae9")} value={counts.inProgress} />
            <StatPill icon={<ShieldAlert className="h-3.5 w-3.5" />}   label={t("conversations.s_9b98f6ca")}     value={counts.riskHigh}   danger />
          </div>
        </div>

        {/* Mobile action bar */}
        <div className="md:hidden flex items-center gap-2 p-3 rounded-2xl bg-[rgb(var(--bg-surface-1))] border border-[rgb(var(--border))]">
          <button
            type="button"
            className="flex-1 h-10 rounded-xl text-sm font-medium bg-[rgb(var(--accent)/0.12)] hover:opacity-90 transition"
            onClick={() => setMobileView("filters")}
          >
            Filtros {extraFilter === "risk" && "· Risco"}
          </button>
          <button
            type="button"
            className="p-2.5 rounded-xl bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] hover:opacity-90 transition"
            onClick={() => setMobileView("list")}
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>

        {/* Desktop filter bar */}
        <div className="hidden md:block rounded-2xl px-4 py-3 bg-[rgb(var(--bg-surface-1))] border border-[rgb(var(--border))] shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Tab switcher */}
            <div className="inline-flex rounded-xl p-1 bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))]">
              {TABS.map((tabItem) => {
                const active = tabItem.id === tab
                return (
                  <button
                    key={tabItem.id}
                    type="button"
                    onClick={() => setTab(tabItem.id)}
                    className={[
                      "flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition",
                      "inline-flex items-center justify-center gap-1.5",
                      "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.16)]",
                      active
                        ? "bg-[rgb(var(--bg-surface-1))] shadow-sm text-[rgb(var(--text-1))]"
                        : "text-[rgb(var(--text-2))] hover:text-[rgb(var(--text-1))]",
                    ].join(" ")}
                    aria-selected={active}
                    role="tab"
                  >
                    {tabItem.icon}
                    <span>{tabItem.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Search + risk filter */}
            <div className="flex items-center gap-2 w-full lg:w-auto lg:min-w-[440px]">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-3))]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("conversations.s_feb449a9")}
                  className={[
                    "w-full pl-8 pr-3 py-2 text-sm rounded-xl",
                    "bg-[rgb(var(--bg-surface-2))]",
                    "border border-[rgb(var(--border))]",
                    "placeholder:text-[rgb(var(--text-3))]",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
                    "transition",
                  ].join(" ")}
                />
              </div>

              <button
                type="button"
                onClick={() => setRiskFilter(extraFilter !== "risk")}
                className={[
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition",
                  extraFilter === "risk"
                    ? "bg-red-500/10 text-red-600 border border-red-200 dark:border-red-900"
                    : "bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] text-[rgb(var(--text-2))] hover:text-[rgb(var(--text-1))]",
                ].join(" ")}
                aria-pressed={extraFilter === "risk"}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{t("conversations.s_9b98f6ca")}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

/* ========================= CONVERSATION CARD ========================= */
function ConversationCard({
  c, active, onOpen,
}: {
  c: Conversation; active: boolean; onOpen: () => void
}) {
  const [bg, fg] = getAvatarColor(c.name)
  const prioColor = c.priority === "high" ? "bg-red-400" : c.priority === "medium" ? "bg-amber-400" : "bg-slate-300"

  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        "w-full text-left rounded-xl px-3 py-2.5 transition group",
        "border",
        active
          ? "bg-[rgb(var(--accent)/0.08)] border-[rgb(var(--accent)/0.20)]"
          : "bg-transparent border-transparent hover:bg-[rgb(var(--bg-surface-2))] hover:border-[rgb(var(--border))]",
      ].join(" ")}
    >
      <div className="flex items-start gap-2.5">
        {/* Priority stripe */}
        <div className={`w-0.5 self-stretch rounded-full mt-1 ${prioColor} shrink-0`} />

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ background: bg, color: fg }}
        >
          {getInitials(c.name)}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="font-semibold text-sm truncate leading-tight">{c.name}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-[rgb(var(--text-3))]">{formatRelativeTime(c.lastAt)}</span>
              {c.unread > 0 && (
                <span className="min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-[rgb(var(--text-1))] text-[rgb(var(--bg-base))]">
                  {c.unread}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-[rgb(var(--text-2))] line-clamp-1 mb-1.5">{c.lastText}</p>

          <div className="flex flex-wrap items-center gap-1">
            <SmallTag text={priorityLabel(c.priority)} variant={c.priority} />
            {c.riskScore >= 75 && <SmallTag text={`⚠ ${c.riskScore}%`} variant="risk" />}
            {c.tags.slice(0, 2).map((tag) => (
              <SmallTag key={tag} text={tag} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile respond button */}
      <div className="mt-2 md:hidden">
        <span className="block w-full text-center py-1.5 rounded-lg text-xs font-semibold bg-[rgb(var(--accent)/0.12)] text-[rgb(var(--text-1))]">
          Responder
        </span>
      </div>
    </button>
  )
}

/* ========================= CHAT HEADER DESKTOP ========================= */
function ChatHeaderDesktop({
  t, selected, aiAssist, onAccept, onFinish,
}: {
  t: (key: string) => string
  selected?: Conversation; aiAssist: boolean
  onAccept: () => void; onFinish: () => void
}) {
  const [bg, fg] = selected ? getAvatarColor(selected.name) : ["#f1f5f9", "#64748b"]

  return (
    <div className="px-4 py-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))] shrink-0">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ background: bg, color: fg }}
        >
          {selected ? getInitials(selected.name) : <MessageCircle className="h-4 w-4" />}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate leading-tight">
            {selected?.name ?? "Selecione uma conversa"}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {selected?.phone && (
              <span className="text-xs text-[rgb(var(--text-3))] inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {selected.phone}
              </span>
            )}
            {selected?.priority && (
              <SmallTag text={priorityLabel(selected.priority)} variant={selected.priority} />
            )}
            {selected?.riskScore && selected.riskScore >= 75 && (
              <SmallTag text={`⚠ Risco ${selected.riskScore}%`} variant="risk" />
            )}
            <SmallTag text={aiAssist ? "IA ativa" : "IA desligada"} variant="ai" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] hover:opacity-80 transition"
          >
            <Check className="h-3.5 w-3.5" />
            Aceitar
          </button>
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 border border-red-200 dark:border-red-900 hover:bg-red-500/15 transition"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Finalizar
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] hover:opacity-80 transition"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ========================= CHAT HEADER MOBILE ========================= */
function ChatHeaderMobile({
  t, selected, aiAssist, onBack, onAccept, onFinish,
}: {
  t: (key: string) => string
  selected?: Conversation; aiAssist: boolean
  onBack: () => void; onAccept: () => void; onFinish: () => void
}) {
  const [bg, fg] = selected ? getAvatarColor(selected.name) : ["#f1f5f9", "#64748b"]

  return (
    <div className="p-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))] shrink-0">
      <div className="flex items-center gap-2 mb-2.5">
        <button
          type="button"
          className="p-2 rounded-xl bg-[rgb(var(--bg-surface-2))] hover:opacity-80 transition"
          onClick={onBack}
          aria-label={t("conversations.s_6da1db5a")}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ background: bg, color: fg }}
        >
          {selected ? getInitials(selected.name) : "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{selected?.name ?? "—"}</p>
          <p className="text-xs text-[rgb(var(--text-3))] truncate">{selected?.phone ?? "—"}</p>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-lg bg-[rgb(var(--bg-surface-2))] hover:opacity-80 transition"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="h-9 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] hover:opacity-80 transition"
          onClick={onAccept}
        >
          <Check className="h-3.5 w-3.5" /> Aceitar
        </button>
        <button
          type="button"
          className="h-9 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-600 border border-red-200 dark:border-red-900 hover:bg-red-500/15 transition"
          onClick={onFinish}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Finalizar
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {selected?.priority && <SmallTag text={priorityLabel(selected.priority)} variant={selected.priority} />}
        {selected?.riskScore && selected.riskScore >= 75 && (
          <SmallTag text={`⚠ ${selected.riskScore}%`} variant="risk" />
        )}
        <SmallTag text={aiAssist ? "IA ativa" : "IA desligada"} variant="ai" />
      </div>
    </div>
  )
}

/* ========================= CHAT BODY ========================= */
function ChatBody({
  t, messages, bottomRef, isDark,
}: {
  t: (key: string) => string
  messages: Message[]
  bottomRef: React.RefObject<HTMLDivElement | null>
  isDark: boolean
}) {
  const bgUrl = isDark ? wppDark : wppWhite
  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto px-3 md:px-4 py-3 md:py-4 space-y-1"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundRepeat: "repeat",
        backgroundPosition: "center",
        backgroundSize: "420px",
        scrollPaddingBottom: "80px",
      }}
    >
      {messages.length === 0 ? (
        <EmptyState title={t("conversations.s_74041f41")} text="Quando chegarem novas mensagens, elas aparecerão aqui." />
      ) : (
        groupMessagesByDay(messages).map((block) => (
          <div key={block.day} className="space-y-1">
            <div className="flex items-center justify-center my-3">
              <span className="text-[11px] px-3 py-1 rounded-full bg-[rgb(var(--bg-surface-1)/0.85)] backdrop-blur-sm border border-[rgb(var(--border))] text-[rgb(var(--text-2))] font-medium shadow-sm">
                {block.day}
              </span>
            </div>
            {block.items.map((m) => (
              <MessageBubble key={m.id} role={m.role} at={m.at} text={m.text} />
            ))}
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  )
}

/* ========================= CHAT COMPOSER ========================= */
function ChatComposer({
  t, text, setText, sendMessage, handleKeyDown,
  templatesOpen, setTemplatesOpen,
  aiAssist, setAiAssist,
  copiedId, copyTemplate, useTemplate,
}: {
  t: (key: string) => string
  text: string; setText: (v: string) => void
  sendMessage: () => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  templatesOpen: boolean; setTemplatesOpen: (v: boolean) => void
  aiAssist: boolean; setAiAssist: (v: boolean) => void
  copiedId: string | null
  copyTemplate: (tmpl: QuickTemplate) => void
  useTemplate: (tmpl: QuickTemplate) => void
}) {
  const taRef = useRef<HTMLTextAreaElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }

  return (
    <div className="px-3 md:px-4 pt-2 pb-3 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))] shrink-0">

      {/* Templates panel */}
      {templatesOpen && (
        <div className="mb-2.5 p-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-2))] max-h-52 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[rgb(var(--text-2))]">{t("conversations.s_0065c187")}</p>
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-[rgb(var(--bg-surface-1))] transition"
              onClick={() => setTemplatesOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {QUICK_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="flex items-start gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))] p-2.5 hover:border-[rgb(var(--border-strong,var(--border)))] transition"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold line-clamp-1 mb-0.5">{tmpl.title}</p>
                  <p className="text-[11px] text-[rgb(var(--text-2))] line-clamp-2 leading-relaxed">{tmpl.text}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    title={t("conversations.s_742ea952")}
                    className="p-1 rounded bg-[rgb(var(--bg-surface-2))] hover:opacity-80 transition"
                    onClick={() => useTemplate(tmpl)}
                  >
                    <Send className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title={t("conversations.s_88541077")}
                    className="p-1 rounded bg-[rgb(var(--bg-surface-2))] hover:opacity-80 transition"
                    onClick={() => copyTemplate(tmpl)}
                  >
                    {copiedId === tmpl.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTemplatesOpen(!templatesOpen)}
            className={[
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition",
              templatesOpen
                ? "bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--text-1))]"
                : "bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] text-[rgb(var(--text-2))] hover:text-[rgb(var(--text-1))]",
            ].join(" ")}
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>{t("conversations.s_e58bf074")}</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] text-[rgb(var(--text-2))] hover:text-[rgb(var(--text-1))] transition"
            onClick={() => alert("Sugestão IA — conecte o modelo aqui.")}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("conversations.s_99fc899c")}</span>
          </button>
        </div>

        {/* AI toggle */}
        <label className="inline-flex items-center gap-2 text-xs font-medium text-[rgb(var(--text-2))] cursor-pointer select-none">
          <Bot className="h-3.5 w-3.5" />
          <span>{t("conversations.s_d41daf59")}</span>
          <button
            type="button"
            role="switch"
            aria-checked={aiAssist}
            onClick={() => setAiAssist(!aiAssist)}
            className={[
              "relative w-8 h-4 rounded-full transition-colors duration-200",
              aiAssist ? "bg-[rgb(var(--accent)/0.7)]" : "bg-[rgb(var(--border))]",
            ].join(" ")}
          >
            <span
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200"
              style={{ left: aiAssist ? "calc(100% - 14px)" : "2px" }}
            />
          </button>
        </label>
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <button
          type="button"
          className="p-2 rounded-xl bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] hover:opacity-80 transition shrink-0"
          aria-label={t("conversations.s_0e4f2d7f")}
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0 relative">
          <textarea
            ref={taRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={t("conversations.s_18213944")}
            rows={1}
            className={[
              "w-full resize-none rounded-xl px-3 py-2 text-sm leading-relaxed",
              "bg-[rgb(var(--bg-surface-2))]",
              "border border-[rgb(var(--border))]",
              "placeholder:text-[rgb(var(--text-3))]",
              "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
              "transition overflow-hidden",
              "min-h-[38px] max-h-[120px]",
            ].join(" ")}
            style={{ height: "38px" }}
          />
        </div>

        <button
          type="button"
          onClick={sendMessage}
          disabled={!text.trim()}
          className={[
            "shrink-0 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 h-[38px] text-xs font-semibold transition",
            text.trim()
              ? "bg-[rgb(var(--accent)/0.85)] text-white hover:opacity-90 shadow-sm"
              : "bg-[rgb(var(--bg-surface-2))] text-[rgb(var(--text-3))] border border-[rgb(var(--border))] cursor-not-allowed",
          ].join(" ")}
          aria-label={t("conversations.s_87ae45ef")}
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("conversations.s_a91a9551")}</span>
        </button>
      </div>
    </div>
  )
}

/* ========================= SMALL PIECES ========================= */
function MiniPill({ icon, label, value, danger }: {
  icon: React.ReactNode; label: string; value: number; danger?: boolean
}) {
  return (
    <div className={[
      "inline-flex items-center gap-1 rounded-lg px-2 py-1 shrink-0",
      "border border-[rgb(var(--border))]",
      danger ? "bg-red-500/08 border-red-200 dark:border-red-900" : "bg-[rgb(var(--bg-surface-2))]",
    ].join(" ")}>
      <span className="opacity-60">{icon}</span>
      <span className="text-[10px] text-[rgb(var(--text-2))]">{label}</span>
      <span className="text-[10px] font-bold">{value}</span>
    </div>
  )
}

function StatPill({ icon, label, value, danger }: {
  icon: React.ReactNode; label: string; value: number; danger?: boolean
}) {
  return (
    <div className={[
      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
      "border border-[rgb(var(--border))]",
      danger ? "bg-red-500/08 border-red-200 dark:border-red-900" : "bg-[rgb(var(--bg-surface-2))]",
    ].join(" ")}>
      <span className="opacity-70">{icon}</span>
      <span className="text-xs text-[rgb(var(--text-2))]">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  )
}

type TagVariant = "default" | "high" | "medium" | "low" | "risk" | "ai"

function SmallTag({ text, variant = "default" }: { text: string; variant?: TagVariant }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border border-transparent whitespace-nowrap"
  const map: Record<TagVariant, string> = {
    default: "bg-[rgb(var(--bg-surface-2))] text-[rgb(var(--text-2))]",
    high:    "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900",
    medium:  "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900",
    low:     "bg-[rgb(var(--bg-surface-2))] text-[rgb(var(--text-3))]",
    risk:    "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900",
    ai:      "bg-[rgb(var(--accent)/0.12)] text-[rgb(var(--text-1))]",
  }
  return (
    <span className={`${base} ${map[variant]}`}>
      {variant === "ai" && <AiSpinner />}
      {text}
    </span>
  )
}

function AiSpinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2.5 w-2.5 rounded-full border border-[rgb(var(--accent)/0.5)] border-t-transparent animate-spin"
    />
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto mt-8 max-w-[220px] text-center p-5 rounded-2xl bg-[rgb(var(--bg-surface-1)/0.80)] backdrop-blur-sm border border-[rgb(var(--border))]">
      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-[rgb(var(--text-2))] mt-1 leading-relaxed">{text}</p>
    </div>
  )
}

function MessageBubble({ role, text, at }: { role: MsgRole; text: string; at: string }) {
  if (role === "system") {
    return (
      <div className="flex justify-center my-1">
        <span className="text-[11px] px-3 py-1 rounded-full bg-[rgb(var(--bg-surface-1)/0.75)] backdrop-blur-sm border border-[rgb(var(--border))] text-[rgb(var(--text-2))] max-w-[85%] text-center shadow-sm">
          {text}
        </span>
      </div>
    )
  }

  const mine = role === "agent"
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-0.5`}>
      <div
        className={[
          "max-w-[78%] md:max-w-[68%] px-3 py-2 shadow-sm",
          mine
            ? "bg-[rgb(var(--accent)/0.18)] dark:bg-[rgb(var(--accent)/0.28)] rounded-2xl rounded-br-sm"
            : "bg-white/90 dark:bg-[rgb(var(--bg-surface-1)/0.82)] border border-[rgb(var(--border))] rounded-2xl rounded-bl-sm",
        ].join(" ")}
      >
        <p className="text-sm leading-relaxed">{text}</p>
        <p className="text-[10px] mt-1 text-right text-[rgb(var(--text-3))]">{formatTime(at)}</p>
      </div>
    </div>
  )
}

/* ========================= HELPERS ========================= */
function priorityWeight(p: Priority) {
  return p === "high" ? 3 : p === "medium" ? 2 : 1
}

function priorityLabel(p: Priority) {
  return p === "high" ? "Alta" : p === "medium" ? "Média" : "Baixa"
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diffMs)) return "—"
  const min = Math.round(diffMs / 60000)
  if (min < 1)  return "agora"
  if (min < 60) return `${min}min`
  const h = Math.round(min / 60)
  if (h < 24)   return `${h}h`
  return `${Math.round(h / 24)}d`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  try {
    return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(d)
  } catch {
    return d.toLocaleTimeString()
  }
}

function formatDay(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const today     = new Date()
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString())     return "Hoje"
  if (d.toDateString() === yesterday.toDateString()) return "Ontem"
  try {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d)
  } catch {
    return d.toLocaleDateString()
  }
}

function groupMessagesByDay(msgs: Message[]) {
  const sorted = [...msgs].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
  const map    = new Map<string, Message[]>()
  for (const m of sorted) {
    const day = formatDay(m.at)
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(m)
  }
  return Array.from(map.entries()).map(([day, items]) => ({ day, items }))
}
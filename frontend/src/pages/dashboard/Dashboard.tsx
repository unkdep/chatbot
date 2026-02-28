"use client"

import React, { type ReactNode, useMemo, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  MessageSquare,
  Users,
  Database,
  Timer,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Bot,
  Activity,
  BadgeCheck,
  FileText,
  Filter,
  ChevronRight,
  Send,
  Check,
  Zap,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

import { useDashboardNav } from "../../layouts/DashboardNavContext"
import { useTranslation } from "react-i18next"

/* ─────────────────────────── Types ─────────────────────────── */

type MessagePoint      = { label: string; value: number }
type ChurnClient       = { name: string; phone: string; lastMessageAt: string; daysInactive: number }
type TopClient         = { name: string; phone: string; messages: number }
type ConversationPreview = {
  id: string; name: string; phone: string; lastText: string
  channel: "whatsapp" | "instagram" | "web"
  status: "waiting" | "in_progress" | "done"
  lastAt: string; unread: number
}
type DashboardMetrics = {
  crescimentoPct: number; emRisco: number; pendentes: number
  mensagensHoje: number; clientesAtivos30d: number; totalClientes: number; ultimaMensagemAt: string
  ativos7d: number; ativos30d: number; inativos90d: number
  seriesMensagens: MessagePoint[]
  churn: ChurnClient[]; topClientes: TopClient[]; conversations: ConversationPreview[]
}

/* ─────────────────────────── Mock Data ─────────────────────────── */

const DEFAULT_DATA: DashboardMetrics = {
  crescimentoPct: 12, emRisco: 5, pendentes: 18,
  mensagensHoje: 32, clientesAtivos30d: 128, totalClientes: 980,
  ultimaMensagemAt: new Date(Date.now() - 1000 * 60 * 13).toISOString(),
  ativos7d: 64, ativos30d: 128, inativos90d: 42,
  seriesMensagens: [
    { label: "Seg", value: 18 }, { label: "Ter", value: 22 }, { label: "Qua", value: 15 },
    { label: "Qui", value: 28 }, { label: "Sex", value: 31 }, { label: "Sáb", value: 19 }, { label: "Dom", value: 26 },
  ],
  churn: [
    { name: "Maria S.",  phone: "+55 11 9XXXX-1234", lastMessageAt: "2026-01-22T10:20:00Z", daysInactive: 19 },
    { name: "José R.",   phone: "+55 21 9XXXX-5678", lastMessageAt: "2026-01-15T14:05:00Z", daysInactive: 26 },
    { name: "Ana P.",    phone: "+55 31 9XXXX-9999", lastMessageAt: "2026-01-10T09:12:00Z", daysInactive: 31 },
  ],
  topClientes: [
    { name: "Carlos A.",  phone: "+55 11 9XXXX-2222", messages: 48 },
    { name: "Juliana M.", phone: "+55 11 9XXXX-3333", messages: 39 },
    { name: "Roberto L.", phone: "+55 19 9XXXX-4444", messages: 33 },
  ],
  conversations: [
    { id:"c1", name:"Edna Cunha",    phone:"+55 11 9XXXX-1111", lastText:"Boa noite! Quero saber valores.",       channel:"whatsapp",  status:"waiting",     lastAt:new Date(Date.now()-1000*60*8).toISOString(),     unread:2 },
    { id:"c2", name:"Re9 Care",      phone:"+55 21 9XXXX-2222", lastText:"Pode me enviar as opções?",             channel:"whatsapp",  status:"in_progress", lastAt:new Date(Date.now()-1000*60*21).toISOString(),    unread:0 },
    { id:"c3", name:"Aventureiros",  phone:"+55 31 9XXXX-3333", lastText:"Ok, obrigado!",                         channel:"instagram", status:"done",        lastAt:new Date(Date.now()-1000*60*60*5).toISOString(),  unread:0 },
    { id:"c4", name:"Tecnologia D.", phone:"+55 19 9XXXX-4444", lastText:"Preciso de ajuda com agendamento.",     channel:"web",       status:"waiting",     lastAt:new Date(Date.now()-1000*60*60*10).toISOString(), unread:1 },
  ],
}

/* ─────────────────────────── Period ─────────────────────────── */

type Period = "today" | "7d" | "30d"
const PERIODS: Array<{ id: Period; label: string }> = [
  { id: "today", label: "Hoje" },
  { id: "7d",    label: "7 dias" },
  { id: "30d",   label: "30 dias" },
]

/* ─────────────────────────── Avatar helpers ─────────────────────────── */

const AVA_COLORS: Array<[string, string]> = [
  ["#dbeafe","#1d4ed8"], ["#dcfce7","#15803d"], ["#fce7f3","#be185d"],
  ["#fef3c7","#b45309"], ["#ede9fe","#6d28d9"], ["#ffedd5","#c2410c"],
]
function avaColor(name: string): [string, string] {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffff
  return AVA_COLORS[Math.abs(h) % AVA_COLORS.length]
}
function initials(name: string) {
  const p = name.trim().split(" ").filter(Boolean)
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?"
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function Dashboard({ data = DEFAULT_DATA }: { data?: DashboardMetrics }) {
  const { t } = useTranslation()
  const { setScreen } = useDashboardNav()
  const [period, setPeriod] = useState<Period>("7d")

  const safeOuter: React.CSSProperties = useMemo(() => ({
    paddingLeft:  "calc(10px + env(safe-area-inset-left))",
    paddingRight: "calc(10px + env(safe-area-inset-right))",
  }), [])

  const go = () => setScreen("conversations")

  /* derived */
  const lastMessageText  = useMemo(() => formatRelativeTime(data.ultimaMensagemAt), [data.ultimaMensagemAt])
  const responseRate     = useMemo(() => Math.max(70, Math.min(99, 92 - Math.round(data.pendentes / 2))), [data.pendentes])
  const aiHealth         = useMemo(() => {
    const score = Math.max(72, Math.min(98, 96 - data.pendentes))
    return { score, label: score >= 92 ? "Excelente" : score >= 85 ? "Boa" : "Atenção" }
  }, [data.pendentes])
  const activityNow2h    = useMemo(() => Math.max(4, Math.min(60, Math.round(data.mensagensHoje / 2))),    [data.mensagensHoje])
  const dataCaptured     = useMemo(() => Math.max(3, Math.min(40, Math.round(data.mensagensHoje / 3))),     [data.mensagensHoje])
  const heroSubtitle     = useMemo(() => {
    if (data.emRisco >= 10) return "Atenção: muitos clientes em risco. Priorize reengajamento hoje."
    if (data.emRisco >= 5)  return "Alguns clientes em risco. Reengajar agora pode reduzir churn."
    return "Tudo sob controle. Continue acompanhando as conversas."
  }, [data.emRisco])

  const pieData = useMemo(() => {
    const a = Math.max(0, data.ativos30d), i = Math.max(0, data.inativos90d), t = (a + i) || 1
    return [
      { name: "Ativos",   value: a, pct: Math.round(a / t * 100) },
      { name: "Inativos", value: i, pct: Math.round(i / t * 100) },
    ]
  }, [data.ativos30d, data.inativos90d])

  /* mini sparklines */
  const sparkMsgs    = useMemo(() => data.seriesMensagens.map(d => ({ v: d.value })),  [data.seriesMensagens])
  const sparkAtivos  = useMemo(() => [88,95,102,110,119,124,128].map(v => ({ v })),    [])
  const sparkTotal   = useMemo(() => [900,920,940,955,962,975,980].map(v => ({ v })),  [])

  return (
    <div className="w-full bg-transparent" style={safeOuter}>
      <div className="mx-auto w-full max-w-[1560px] 2xl:max-w-[1720px]">
        <div className="space-y-6 md:space-y-8">

          {/* ── Period filter ── */}
          <div className="relative rounded-[2.25rem] px-4 py-3.5 sm:px-5 sm:py-4 border border-black/10 dark:border-white/15 bg-zinc-50/70 dark:bg-zinc-950/35 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,.06)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="dash-icon !w-8 !h-8"><Filter className="h-3.5 w-3.5" /></div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{t("dashboard.s_9d2b2bb8")}</p>
                  <p className="text-xs opacity-55 mt-0.5">{t("dashboard.s_18a94d48")}</p>
                </div>
              </div>
              <div
                className="inline-flex w-full sm:w-auto rounded-full p-1 border border-black/10 dark:border-white/15 bg-white/70 dark:bg-zinc-950/35 backdrop-blur-xl shadow-sm"
                role="tablist"
              >
                {PERIODS.map((p) => {
                  const active = p.id === period
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPeriod(p.id)}
                      className={[
                        "flex-1 sm:flex-none px-4 py-1.5 rounded-full text-sm font-medium transition",
                        "focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30",
                        active
                          ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                          : "opacity-60 hover:opacity-90",
                      ].join(" ")}
                      role="tab" aria-selected={active}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── HERO ── */}
          <section aria-label={t("dashboard.s_e6e40a16")} className="dash-card-blue dash-hover p-5 sm:p-8 relative overflow-hidden">
            {/* decorative glow */}
            <div
              className="pointer-events-none absolute -top-28 -right-28 w-80 h-80 rounded-full opacity-[0.15] blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(56,189,248,1) 0%, transparent 70%)" }}
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-5">
              {/* title row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="dash-icon shrink-0"><Bot className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold truncate">{t("dashboard.s_38572673")}</h2>
                    <p className="text-sm opacity-70 mt-0.5 leading-relaxed">{heroSubtitle}</p>
                  </div>
                </div>

                {/* live badge */}
                <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-full bg-white/15 dark:bg-black/20 border border-white/20 dark:border-white/10 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ao vivo
                </div>
              </div>

              {/* status pills */}
              <div className="flex flex-wrap gap-2">
                <HeroPill icon={<Sparkles className="h-3.5 w-3.5" />}     text="IA Online" />
                <HeroPill icon={<BadgeCheck className="h-3.5 w-3.5" />}   text={`Resposta: ${responseRate}%`} />
                <HeroPill icon={<Activity className="h-3.5 w-3.5" />}     text={`Saúde: ${aiHealth.label} · ${aiHealth.score}%`} />
                <HeroPill icon={<MessageSquare className="h-3.5 w-3.5" />} text={`${activityNow2h} msg (2h)`} />
                <HeroPill icon={<FileText className="h-3.5 w-3.5" />}     text={`${dataCaptured} capturas hoje`} />
              </div>

              {/* CTA row */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button" onClick={go}
                  className="dash-btn dash-hover w-full justify-center focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
                >
                  <MessageSquare className="h-4 w-4" />
                  Abrir conversas
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  type="button" onClick={go}
                  className="dash-btn dash-hover w-full justify-center focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Clientes em risco
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {/* ── Quick stats ── */}
          <section aria-label={t("dashboard.s_60a93b5a")}>
            <div className="grid gap-3 sm:gap-4 grid-cols-3">
              <QuickStat
                icon={<TrendingUp className="h-5 w-5" />}
                label={t("dashboard.s_d810a94b")}
                value={`${data.crescimentoPct >= 0 ? "+" : ""}${data.crescimentoPct}%`}
                hint={t("dashboard.s_b5b21b72")}
                trend="up"
              />
              <QuickStat
                icon={<ShieldAlert className="h-5 w-5" />}
                label={t("dashboard.s_b232683f")}
                value={String(data.emRisco)}
                hint={t("dashboard.s_badd44b6")}
                trend="down"
              />
              <QuickStat
                icon={<Clock className="h-5 w-5" />}
                label={t("dashboard.s_020db685")}
                value={String(data.pendentes)}
                hint={t("dashboard.s_33a34bb2")}
              />
            </div>
          </section>

          {/* ── KPIs com sparklines ── */}
          <section aria-label={t("dashboard.s_f67d89be")}>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title={t("dashboard.s_866a9504")}
                value={formatNumber(data.mensagensHoje)}
                delta="+8% vs ontem"
                trend="up"
                icon={<MessageSquare className="h-4 w-4" />}
                spark={sparkMsgs}
                variant="soft"
              />
              <KpiCard
                title={t("dashboard.s_cfd07bdc")}
                value={formatNumber(data.clientesAtivos30d)}
                delta="+4% (30d)"
                trend="up"
                icon={<Users className="h-4 w-4" />}
                spark={sparkAtivos}
                variant="default"
              />
              <KpiCard
                title={t("dashboard.s_d5742ab6")}
                value={formatNumber(data.totalClientes)}
                delta="Base completa"
                icon={<Database className="h-4 w-4" />}
                spark={sparkTotal}
                variant="dark"
              />
              <KpiCard
                title={t("dashboard.s_d440146a")}
                value={lastMessageText}
                delta="Última interação"
                icon={<Timer className="h-4 w-4" />}
                isText
                variant="blue"
              />
            </div>
          </section>

          {/* ── Ações + Conversas ── */}
          <section
            aria-label={t("dashboard.s_6fc4af9f")}
            className="grid gap-4 sm:gap-6 xl:grid-cols-2 items-stretch"
          >
            {/* Ações */}
            <Panel
              variant="blue"
              title={t("dashboard.s_65d4b4bf")}
              subtitle={t("dashboard.s_e8956ef4")}
              className="h-full flex flex-col"
              rightSlot={
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 dark:bg-black/20 border border-white/20 dark:border-white/10 opacity-80">
                  {PERIODS.find(p => p.id === period)?.label}
                </span>
              }
            >
              <div className="grid gap-2.5 flex-1">
                <ActionRow
                  icon={<Send className="h-4 w-4" />}
                  title={t("dashboard.s_69550037")}
                  description={`${data.pendentes} clientes aguardando na fila.`}
                  badge={String(data.pendentes)}
                  danger={data.pendentes > 10}
                  onClick={go}
                />
                <ActionRow
                  icon={<ShieldAlert className="h-4 w-4" />}
                  title={t("dashboard.s_a636ab48")}
                  description={`${data.emRisco} contatos com possível churn detectado.`}
                  badge={String(data.emRisco)}
                  danger
                  onClick={go}
                />

                {/* Churn list */}
                {data.churn.length > 0 && (
                  <div className="mt-1">
                    <p className="text-xs font-semibold opacity-50 uppercase tracking-wider mb-2 px-1">{t("dashboard.s_a8d1464e")}</p>
                    <div className="space-y-1.5">
                      {data.churn.slice(0, 3).map(c => {
                        const [bg, fg] = avaColor(c.name)
                        return (
                          <button
                            key={c.phone}
                            type="button"
                            onClick={go}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left dash-card dash-card-soft dash-hover focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: bg, color: fg }}>
                                {initials(c.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{c.name}</p>
                                <p className="text-xs opacity-55 truncate">{c.phone}</p>
                              </div>
                            </div>
                            <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                              {c.daysInactive}d inativo
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Panel>

            {/* Conversas */}
            <Panel
              variant="default"
              title={t("dashboard.s_5f9c1638")}
              subtitle={t("dashboard.s_884aecee")}
              className="h-full flex flex-col"
              rightSlot={
                <button
                  type="button" onClick={go}
                  className="dash-btn dash-hover text-xs focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
                >
                  Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              }
            >
              <div className="space-y-1.5 flex-1">
                {data.conversations.slice(0, 5).map(c => {
                  const [bg, fg] = avaColor(c.name)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={go}
                      className="w-full text-left dash-card dash-card-soft dash-hover p-3 sm:p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* colored avatar */}
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm" style={{ background: bg, color: fg }}>
                          {initials(c.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="font-semibold text-sm truncate">{c.name}</p>
                            <span className="text-[10px] opacity-50 shrink-0">{formatRelativeTime(c.lastAt)}</span>
                          </div>
                          <p className="text-xs opacity-65 line-clamp-1 mb-1.5">{c.lastText}</p>
                          <div className="flex items-center gap-1.5">
                            <SmallTag text={channelLabel(c.channel)} />
                            <SmallTag text={statusLabel(c.status)} variant={c.status} />
                          </div>
                        </div>

                        <div className="shrink-0">
                          {c.unread > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black">
                              {c.unread}
                            </span>
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 opacity-25" />
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
                {data.conversations.length === 0 && (
                  <EmptyState title={t("dashboard.s_864e46d7")} text="Quando chegarem novas mensagens, elas aparecerão aqui." />
                )}
              </div>
            </Panel>
          </section>

          {/* ── Charts ── */}
          <section aria-label={t("dashboard.s_0e5fbea3")} className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Area chart */}
            <Panel
              variant="blue"
              className="lg:col-span-2"
              title={t("dashboard.s_de7a7d26")}
              subtitle={t("dashboard.s_ba1abf0d")}
              rightSlot={
                <div className="flex items-center gap-1.5 text-xs opacity-65 font-medium">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {data.seriesMensagens.at(-1)?.value ?? 0} hoje
                </div>
              }
            >
              <div className="h-52 sm:h-60 mt-2 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.seriesMensagens} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="rgba(56,189,248,0.50)" />
                        <stop offset="100%" stopColor="rgba(56,189,248,0.02)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 6" opacity={0.13} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickMargin={8} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickMargin={8} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<SoftTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="rgba(56,189,248,0.95)"
                      fill="url(#areaBlue)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Donut */}
            <Panel
              variant="soft"
              title={t("dashboard.s_e7864a12")}
              subtitle={t("dashboard.s_ce1850da")}
            >
              <div className="h-40 sm:h-48 flex items-center -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<SoftTooltip />} />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="60%"
                      outerRadius="82%"
                      paddingAngle={5}
                      stroke="none"
                    >
                      <Cell fill="rgba(56,189,248,0.55)" />
                      <Cell fill="rgba(148,163,184,0.28)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="dash-card dash-card-soft dash-hover p-3.5 rounded-2xl">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: i === 0 ? "rgba(56,189,248,.9)" : "rgba(148,163,184,.65)" }} />
                      <p className="text-xs opacity-60 truncate">{d.name}</p>
                    </div>
                    <p className="text-2xl font-bold">{formatNumber(d.value)}</p>
                    <p className="text-xs opacity-45 mt-0.5">{d.pct}% do total</p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          {/* ── Top clients ── */}
          {data.topClientes.length > 0 && (
            <section aria-label={t("dashboard.s_9c2ecd00")}>
              <Panel
                variant="default"
                title={t("dashboard.s_9c2ecd00")}
                subtitle={t("dashboard.s_9a228ad5")}
                rightSlot={
                  <span className="text-xs opacity-45 font-medium">Top {data.topClientes.length}</span>
                }
              >
                <div className="space-y-3 mt-1">
                  {data.topClientes.map((c, i) => {
                    const [bg, fg] = avaColor(c.name)
                    const max = data.topClientes[0]?.messages ?? 1
                    const pct = Math.round(c.messages / max * 100)
                    return (
                      <div key={c.phone} className="flex items-center gap-3">
                        <span className="text-xs font-bold opacity-35 w-4 shrink-0 text-right">{i + 1}</span>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: bg, color: fg }}>
                          {initials(c.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p className="text-sm font-semibold truncate">{c.name}</p>
                            <span className="text-xs font-bold shrink-0 opacity-70">{c.messages} msg</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden bg-[rgb(var(--bg-surface-2))]">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: "rgba(56,189,248,0.7)", transition: "width .4s ease" }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Panel>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function HeroPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border border-black/10 dark:border-white/20 bg-white/55 dark:bg-black/25 backdrop-blur-xl shadow-sm">
      <span aria-hidden="true">{icon}</span>
      {text}
    </div>
  )
}

function QuickStat({ icon, label, value, hint, trend }: {
  icon: ReactNode; label: string; value: string; hint?: string; trend?: "up" | "down"
}) {
  return (
    <div className={[
      "dash-card dash-hover rounded-[2rem] p-4 sm:p-5 flex flex-col gap-1",
      trend === "down" ? "bg-red-500/08 border border-red-200/60 dark:border-red-900/60 dash-card" : "dash-card-soft",
    ].join(" ")}>
      <div className="flex items-center justify-between mb-1">
        <div className={[
          "dash-icon !w-8 !h-8",
          trend === "up"   ? "text-emerald-500" : "",
          trend === "down" ? "text-red-500"     : "",
        ].join(" ")}>{icon}</div>
        {trend === "up"   && <TrendingUp   className="h-3.5 w-3.5 text-emerald-500 opacity-75" />}
        {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500 opacity-75"    />}
      </div>
      <p className="text-xs opacity-55 leading-tight">{label}</p>
      <p className={[
        "text-2xl sm:text-3xl font-bold leading-none",
        trend === "up"   ? "text-emerald-600 dark:text-emerald-400" : "",
        trend === "down" ? "text-red-600 dark:text-red-400"         : "",
      ].join(" ")}>{value}</p>
      {hint && <p className="text-xs opacity-45 mt-0.5">{hint}</p>}
    </div>
  )
}

function KpiCard({ title, value, delta, icon, spark, isText, trend, variant = "default" }: {
  title: string; value: string; delta?: string
  icon: ReactNode; spark?: Array<{ v: number }>
  isText?: boolean; trend?: "up" | "down"; variant?: CardVariant
}) {
  return (
    <div className={`${cardClass(variant)} dash-hover p-4 sm:p-5 rounded-[2rem] flex flex-col gap-2.5`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold opacity-55 uppercase tracking-wide">{title}</p>
        <div className="dash-icon !w-7 !h-7 !rounded-lg">{icon}</div>
      </div>
      <div>
        <p className={isText ? "text-xl font-bold" : "text-3xl sm:text-4xl font-bold"}>{value}</p>
        {delta && (
          <p className={[
            "text-xs mt-1 flex items-center gap-1",
            trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "opacity-45",
          ].join(" ")}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {delta}
          </p>
        )}
      </div>
      {spark && spark.length > 1 && (
        <div className="h-9 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Line
                type="monotone" dataKey="v"
                stroke={trend === "up" ? "rgba(52,211,153,0.75)" : "rgba(56,189,248,0.65)"}
                strokeWidth={1.5} dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function ActionRow({ icon, title, description, badge, danger, onClick }: {
  icon: ReactNode; title: string; description: string
  badge?: string; danger?: boolean; onClick: () => void
}) {
  return (
    <button
      type="button" onClick={onClick}
      className="w-full text-left dash-card dash-card-soft dash-hover p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="dash-icon !w-8 !h-8 shrink-0">{icon}</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug">{title}</p>
            <p className="text-xs opacity-65 mt-0.5 leading-relaxed">{description}</p>
          </div>
        </div>
        {badge && (
          <span className={[
            "shrink-0 inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-sm font-bold",
            danger
              ? "bg-red-500/12 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900"
              : "bg-black text-white dark:bg-white dark:text-black",
          ].join(" ")}>
            {badge}
          </span>
        )}
      </div>
    </button>
  )
}

function Panel({ title, subtitle, rightSlot, children, className = "", variant = "default" }: {
  title: string; subtitle?: string; rightSlot?: ReactNode
  children: ReactNode; className?: string; variant?: CardVariant
}) {
  return (
    <div className={`${cardClass(variant)} dash-hover p-5 sm:p-7 rounded-[2rem] ${className}`} role="region" aria-label={title}>
      <div className="flex items-start justify-between gap-4 mb-4 min-w-0">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold">{title}</h3>
          {subtitle && <p className="text-xs opacity-55 mt-0.5">{subtitle}</p>}
        </div>
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>
      {children}
    </div>
  )
}

function SmallTag({ text, variant }: { text: string; variant?: "waiting" | "in_progress" | "done" }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border backdrop-blur-xl"
  const map = {
    waiting:     "border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/15",
    in_progress: "border-sky-500/20  bg-sky-500/10  dark:bg-sky-500/15",
    done:        "border-emerald-500/20 bg-emerald-500/08 dark:bg-emerald-500/12",
    default:     "border-black/10 dark:border-white/20 bg-white/60 dark:bg-black/35",
  }
  return <span className={`${base} ${variant ? map[variant] : map.default}`}>{text}</span>
}

function SoftTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; payload?: any }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const name  = payload[0]?.name ?? payload[0]?.payload?.name ?? label ?? "Valor"
  const value = payload[0]?.value ?? payload[0]?.payload?.value ?? 0
  return (
    <div className="rounded-xl px-3 py-2 border border-black/10 dark:border-white/20 bg-white/90 dark:bg-black/75 backdrop-blur-xl shadow-xl text-black dark:text-white">
      <p className="text-xs font-semibold">{String(name)}</p>
      <p className="text-sm font-bold">{formatNumber(Number(value) || 0)}</p>
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="dash-card dash-card-soft p-6 text-center rounded-2xl">
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs opacity-60 mt-1">{text}</p>
    </div>
  )
}

/* ─────────────────────────── Card class helper ─────────────────────────── */

type CardVariant = "default" | "soft" | "dark" | "blue" | "neutral"

function cardClass(v: CardVariant) {
  if (v === "blue")    return "dash-card-blue"
  if (v === "dark")    return "dash-card dash-card-dark"
  if (v === "soft")    return "dash-card dash-card-soft"
  if (v === "neutral") return "dash-card bg-[rgba(var(--text-1),.12)] dark:bg-[rgba(255,255,255,.08)] border border-[rgba(var(--text-1),.18)] dark:border-white/18"
  return "dash-card"
}

/* ─────────────────────────── Helpers ─────────────────────────── */

function formatNumber(n: number) {
  try { return new Intl.NumberFormat("pt-BR").format(n) } catch { return String(n) }
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diffMs)) return "—"
  const min = Math.round(diffMs / 60000)
  if (min < 1)  return "agora"
  if (min < 60) return `${min} min atrás`
  const h = Math.round(min / 60)
  if (h < 24)   return `${h}h atrás`
  return `${Math.round(h / 24)}d atrás`
}

function channelLabel(ch: ConversationPreview["channel"]) {
  return ch === "whatsapp" ? "WhatsApp" : ch === "instagram" ? "Instagram" : "Web"
}

function statusLabel(s: ConversationPreview["status"]) {
  return s === "waiting" ? "Aguardando" : s === "in_progress" ? "Em atendimento" : "Finalizado"
}
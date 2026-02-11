"use client"

import React, { type ReactNode, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  TrendingUp,
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
  ChevronDown,
  Send,
  PhoneCall,
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
} from "recharts"

/* ------------------------------ Types ------------------------------ */

type MessagePoint = { label: string; value: number }

type ChurnClient = {
  name: string
  phone: string
  lastMessageAt: string
  daysInactive: number
}

type TopClient = { name: string; phone: string; messages: number }

type ConversationPreview = {
  id: string
  name: string
  phone: string
  lastText: string
  channel: "whatsapp" | "instagram" | "web"
  status: "waiting" | "in_progress" | "done"
  lastAt: string // ISO
  unread: number
}

type DashboardMetrics = {
  crescimentoPct: number
  emRisco: number
  pendentes: number

  mensagensHoje: number
  clientesAtivos30d: number
  totalClientes: number
  ultimaMensagemAt: string

  ativos7d: number
  ativos30d: number
  inativos90d: number

  seriesMensagens: MessagePoint[]
  churn: ChurnClient[]
  topClientes: TopClient[]

  conversations: ConversationPreview[]
}

/* ------------------------------ Mock Data ------------------------------ */

const DEFAULT_DATA: DashboardMetrics = {
  crescimentoPct: 12,
  emRisco: 5,
  pendentes: 18,

  mensagensHoje: 32,
  clientesAtivos30d: 128,
  totalClientes: 980,
  ultimaMensagemAt: new Date(Date.now() - 1000 * 60 * 13).toISOString(),

  ativos7d: 64,
  ativos30d: 128,
  inativos90d: 42,

  seriesMensagens: [
    { label: "Seg", value: 18 },
    { label: "Ter", value: 22 },
    { label: "Qua", value: 15 },
    { label: "Qui", value: 28 },
    { label: "Sex", value: 31 },
    { label: "Sáb", value: 19 },
    { label: "Dom", value: 26 },
  ],
  churn: [
    { name: "Maria S.", phone: "+55 11 9XXXX-1234", lastMessageAt: "2026-01-22T10:20:00.000Z", daysInactive: 19 },
    { name: "José R.", phone: "+55 21 9XXXX-5678", lastMessageAt: "2026-01-15T14:05:00.000Z", daysInactive: 26 },
    { name: "Ana P.", phone: "+55 31 9XXXX-9999", lastMessageAt: "2026-01-10T09:12:00.000Z", daysInactive: 31 },
  ],
  topClientes: [
    { name: "Carlos A.", phone: "+55 11 9XXXX-2222", messages: 48 },
    { name: "Juliana M.", phone: "+55 11 9XXXX-3333", messages: 39 },
    { name: "Roberto L.", phone: "+55 19 9XXXX-4444", messages: 33 },
  ],
  conversations: [
    {
      id: "c1",
      name: "Edna Cunha",
      phone: "+55 11 9XXXX-1111",
      lastText: "Boa noite! Quero saber valores.",
      channel: "whatsapp",
      status: "waiting",
      lastAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      unread: 2,
    },
    {
      id: "c2",
      name: "Re9 Care",
      phone: "+55 21 9XXXX-2222",
      lastText: "Pode me enviar as opções?",
      channel: "whatsapp",
      status: "in_progress",
      lastAt: new Date(Date.now() - 1000 * 60 * 21).toISOString(),
      unread: 0,
    },
    {
      id: "c3",
      name: "Aventureiros",
      phone: "+55 31 9XXXX-3333",
      lastText: "Ok, obrigado!",
      channel: "instagram",
      status: "done",
      lastAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      unread: 0,
    },
    {
      id: "c4",
      name: "Tecnologia D.",
      phone: "+55 19 9XXXX-4444",
      lastText: "Preciso de ajuda com agendamento.",
      channel: "web",
      status: "waiting",
      lastAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      unread: 1,
    },
  ],
}

/* ------------------------------ Period Filter ------------------------------ */

type Period = "today" | "7d" | "30d"

const PERIODS: Array<{ id: Period; label: string }> = [
  { id: "today", label: "Hoje" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
]

/* ------------------------------ Component ------------------------------ */

export default function DashboardContent({ data = DEFAULT_DATA }: { data?: DashboardMetrics }) {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>("7d")

  // helper: navegação para conversas
  function goConversations(params?: Record<string, string>) {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : ""
    navigate(`/dashboard/conversations${qs}`)
  }

  const lastMessageText = useMemo(() => formatRelativeTime(data.ultimaMensagemAt), [data.ultimaMensagemAt])

  const pieData = useMemo(() => {
    const ativos = Math.max(0, data.ativos30d)
    const inativos = Math.max(0, data.inativos90d)
    const total = ativos + inativos || 1
    return [
      { name: "Ativos", value: ativos, pct: Math.round((ativos / total) * 100) },
      { name: "Inativos", value: inativos, pct: Math.round((inativos / total) * 100) },
    ]
  }, [data.ativos30d, data.inativos90d])

  // Heurísticas (mock)
  const responseRate = useMemo(() => Math.max(70, Math.min(99, 92 - Math.round(data.pendentes / 2))), [data.pendentes])

  const aiHealth = useMemo(() => {
    const score = Math.max(72, Math.min(98, 96 - data.pendentes))
    const label = score >= 92 ? "Excelente" : score >= 85 ? "Boa" : "Atenção"
    return { score, label }
  }, [data.pendentes])

  const activityNow2h = useMemo(() => Math.max(4, Math.min(60, Math.round(data.mensagensHoje / 2))), [data.mensagensHoje])
  const dataCapturedToday = useMemo(() => Math.max(3, Math.min(40, Math.round(data.mensagensHoje / 3))), [data.mensagensHoje])

  const heroSubtitle = useMemo(() => {
    const risk = data.emRisco
    if (risk >= 10) return "Atenção: muitos clientes em risco. Priorize reengajamento hoje."
    if (risk >= 5) return "Alguns clientes em risco. Reengajar agora pode reduzir churn."
    return "Tudo sob controle. Continue acompanhando as conversas."
  }, [data.emRisco])

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Top: period filter + stronger blue aurora background */}
      <div className="relative">
        <div
          className="
            pointer-events-none absolute -inset-x-6 -top-14 h-56 rounded-[3rem] blur-3xl
            opacity-90 dark:opacity-75
            bg-[radial-gradient(1000px_280px_at_18%_0%,rgba(56,189,248,.42),transparent_60%),radial-gradient(900px_260px_at_82%_0%,rgba(59,130,246,.34),transparent_60%),radial-gradient(700px_220px_at_50%_20%,rgba(186,230,253,.35),transparent_62%)]
          "
        />

        <div
          className="
            relative
            rounded-[2.25rem]
            p-4 sm:p-5
            border border-black/10 dark:border-white/20
            bg-white/55 dark:bg-black/35
            backdrop-blur-2xl
            shadow-[0_18px_70px_rgba(0,0,0,.10)]
          "
        >
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="dash-icon">
                <Filter className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Período</p>
                <p className="text-sm opacity-70">Selecione para filtrar métricas e relatórios</p>
              </div>
            </div>

            <div
              className="
                inline-flex w-full sm:w-auto
                rounded-full p-1
                border border-black/10 dark:border-white/20
                bg-white/60 dark:bg-black/35
                backdrop-blur-xl
                shadow-sm
              "
              role="tablist"
              aria-label="Filtro de período"
            >
              {PERIODS.map((p) => {
                const active = p.id === period
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriod(p.id)}
                    className={[
                      "flex-1 sm:flex-none",
                      "px-4 py-2 rounded-full text-sm font-medium transition",
                      "focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40",
                      active
                        ? "bg-black text-white dark:bg-white dark:text-black shadow"
                        : "opacity-80 hover:opacity-100",
                    ].join(" ")}
                    role="tab"
                    aria-selected={active}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section aria-label="Visão geral do assistente" className="dash-card-blue dash-hover p-5 sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="dash-icon shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-semibold truncate">Painel do Chatbot</h2>
                <p className="text-sm sm:text-base opacity-75 mt-1 leading-relaxed">{heroSubtitle}</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 opacity-80">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill icon={<Sparkles className="h-4 w-4" />} text="IA Online" />
            <Pill icon={<BadgeCheck className="h-4 w-4" />} text={`Taxa de resposta: ${responseRate}%`} />
            <Pill icon={<Activity className="h-4 w-4" />} text={`Saúde da IA: ${aiHealth.label} (${aiHealth.score}%)`} />
            <Pill icon={<MessageSquare className="h-4 w-4" />} text={`Atividade agora: ${activityNow2h} msg (2h)`} />
            <Pill icon={<FileText className="h-4 w-4" />} text={`Dados capturados hoje: ${dataCapturedToday}`} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => goConversations()}
              className="
                dash-btn dash-hover w-full justify-center
                focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40
              "
            >
              <MessageSquare className="h-4 w-4" />
              Abrir conversas
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => goConversations({ filter: "risk" })}
              className="
                dash-btn dash-hover w-full justify-center
                focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40
              "
            >
              <ShieldAlert className="h-4 w-4" />
              Ver clientes em risco
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section aria-label="Resumo rápido">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <MiniStat
            variant="soft"
            icon={<TrendingUp className="h-5 w-5" />}
            label="Crescimento"
            value={`${data.crescimentoPct >= 0 ? "+" : ""}${data.crescimentoPct}%`}
            hint="Comparado ao período anterior"
          />
          <MiniStat
            variant="dark"
            icon={<AlertCircle className="h-5 w-5" />}
            label="Em risco"
            value={`${data.emRisco}`}
            hint="Possível churn detectado"
          />
          <MiniStat
            variant="soft"
            icon={<Clock className="h-5 w-5" />}
            label="Pendentes"
            value={`${data.pendentes}`}
            hint="Itens aguardando ação"
          />
        </div>
      </section>

      {/* AÇÕES + ÚLTIMAS */}
      <section className="grid gap-4 sm:gap-6 xl:grid-cols-2" aria-label="Atalhos e conversas recentes">
        <Panel
          variant="blue"
          title="Ações recomendadas"
          subtitle="Atalhos rápidos para manter o atendimento em dia"
          rightSlot={
            <div className="hidden sm:flex items-center gap-2 opacity-70 text-sm">
              <span>Período:</span>
              <span className="font-semibold">{PERIODS.find((p) => p.id === period)?.label}</span>
            </div>
          }
        >
          <div className="grid gap-3">
            <ActionRow
              icon={<Send className="h-5 w-5" />}
              title="Responder pendências"
              description="Abra a fila e responda clientes aguardando."
              badge={`${data.pendentes}`}
              onClick={() => goConversations({ tab: "waiting" })}
            />

            <ActionRow
              icon={<ShieldAlert className="h-5 w-5" />}
              title="Reengajar clientes em risco"
              description="Envie uma mensagem curta para reduzir churn."
              badge={`${data.emRisco}`}
              onClick={() => goConversations({ filter: "risk" })}
            />

            <ActionRow
              icon={<PhoneCall className="h-5 w-5" />}
              title="Criar campanha rápida"
              description="Dispare uma atualização para clientes (promo/aviso)."
              onClick={() => goConversations({ action: "campaign" })}
            />
          </div>

          <p className="mt-4 text-sm opacity-70 leading-relaxed">
            Dica: empresários gostam de ver “o que fazer agora”. Esses 3 botões viram seu diferencial.
          </p>
        </Panel>

        <Panel
          variant="default"
          title="Últimas conversas"
          subtitle="Prévia rápida para abrir e continuar"
          rightSlot={
            <button
              type="button"
              onClick={() => goConversations()}
              className="dash-btn dash-hover focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40"
              aria-label="Ver todas as conversas"
            >
              <MessageSquare className="h-4 w-4" />
              Ver todas
              <ArrowUpRight className="h-4 w-4" />
            </button>
          }
        >
          <div className="space-y-2">
            {data.conversations.slice(0, 5).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => goConversations({ open: c.id })}
                className="
                  w-full text-left
                  dash-card dash-card-soft dash-hover
                  p-4 rounded-2xl
                  focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40
                "
                aria-label={`Abrir conversa com ${c.name}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <AvatarBadge name={c.name} />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-semibold truncate">{c.name}</p>
                        <span className="text-xs opacity-70 hidden sm:inline truncate">{c.phone}</span>
                      </div>

                      <p className="text-sm opacity-75 mt-1 line-clamp-2">{c.lastText}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <SmallTag text={channelLabel(c.channel)} />
                        <SmallTag text={statusLabel(c.status)} variant={c.status} />
                        <span className="text-xs opacity-70 flex items-center gap-1">
                          <Timer className="h-3.5 w-3.5" />
                          {formatRelativeTime(c.lastAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {c.unread > 0 ? (
                      <span
                        className="
                          inline-flex items-center justify-center
                          min-w-6 h-6 px-2 rounded-full text-xs font-semibold
                          bg-black text-white
                          dark:bg-white dark:text-black
                        "
                        aria-label={`${c.unread} mensagens não lidas`}
                      >
                        {c.unread}
                      </span>
                    ) : (
                      <span className="text-xs opacity-50">—</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {data.conversations.length === 0 && (
            <EmptyState title="Sem conversas recentes" text="Quando chegarem novas mensagens, elas aparecerão aqui." />
          )}
        </Panel>
      </section>

      {/* KPIs */}
      <section aria-label="Indicadores principais">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
          <KpiCard
            variant="soft"
            title="Mensagens hoje"
            value={formatNumber(data.mensagensHoje)}
            icon={<MessageSquare className="h-5 w-5" />}
            footer="Total recebido nas últimas 24h"
          />
          <KpiCard
            variant="default"
            title="Clientes ativos"
            value={formatNumber(data.clientesAtivos30d)}
            icon={<Users className="h-5 w-5" />}
            footer="Atividade nos últimos 30 dias"
          />
          <KpiCard
            variant="dark"
            title="Total de clientes"
            value={formatNumber(data.totalClientes)}
            icon={<Database className="h-5 w-5" />}
            footer="Base completa cadastrada"
          />
          <KpiCard
            variant="blue"
            title="Última mensagem"
            value={lastMessageText}
            icon={<Timer className="h-5 w-5" />}
            footer="Última interação recebida"
            isTextValue
          />
        </div>
      </section>

      {/* Insight IA */}
      <section aria-label="Insights da IA">
        <IACard
          variant="blue"
          title="Insights da IA"
          text={`${data.churn.length} clientes com risco de churn detectado. Considere reengajar com uma mensagem curta e objetiva.`}
        />
      </section>

      {/* Charts */}
      <section aria-label="Relatórios essenciais" className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Panel variant="blue" className="lg:col-span-2" title="Evolução de mensagens" subtitle="Quantidade por dia (semana atual)">
          <div className="h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.seriesMensagens} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 6" opacity={0.18} />
                <XAxis dataKey="label" tickMargin={10} />
                <YAxis tickMargin={10} width={40} />
                <Tooltip content={<SoftTooltip />} />
                <defs>
                  <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.42)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.03)" />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="rgba(56,189,248,0.95)"
                  fill="url(#areaBlue)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-4 text-sm opacity-70">
            Dica: quedas constantes aqui normalmente indicam perda de interesse ou problema no atendimento.
          </p>
        </Panel>

        <Panel variant="soft" title="Clientes ativos x inativos" subtitle="Visão geral (30d vs 90d)">
          <div className="h-56 md:h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<SoftTooltip />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="85%"
                  paddingAngle={4}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={2}
                >
                  <Cell fill="rgba(56,189,248,0.34)" />
                  <Cell fill="rgba(148,163,184,0.26)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {pieData.map((d) => (
              <div
                key={d.name}
                className="dash-card dash-card-soft dash-hover p-4 rounded-2xl"
                role="group"
                aria-label={`${d.name}: ${d.value} clientes (${d.pct}%)`}
              >
                <p className="text-sm opacity-70">{d.name}</p>
                <p className="text-2xl font-semibold">{formatNumber(d.value)}</p>
                <p className="text-sm opacity-70">{d.pct}%</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {/* Lists */}
      <section aria-label="Ações e listas" className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <Panel
          variant="default"
          title="Clientes que pararam de falar (churn)"
          subtitle="Priorize recontato"
          rightSlot={
            <button
              className="dash-btn dash-hover focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40"
              aria-label="Ver relatório completo de churn"
              type="button"
              onClick={() => goConversations({ filter: "churn" })}
            >
              <ShieldAlert className="h-4 w-4" />
              Ver todos
              <ArrowUpRight className="h-4 w-4" />
            </button>
          }
        >
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {data.churn.slice(0, 6).map((c) => (
              <li key={c.phone} className="py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-sm opacity-70 truncate">{c.phone}</p>
                  <p className="text-sm opacity-70 mt-1">
                    Última mensagem: <span className="opacity-90">{formatDateTime(c.lastMessageAt)}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm opacity-70">Inativo há</p>
                  <p className="text-2xl font-semibold">{c.daysInactive}d</p>
                </div>
              </li>
            ))}
          </ul>

          {data.churn.length === 0 && (
            <EmptyState title="Nenhum churn detectado" text="Ótimo sinal: não há clientes inativos recentes." />
          )}
        </Panel>

        <Panel
          variant="dark"
          title="Clientes mais ativos"
          subtitle="Ranking por volume de mensagens"
          rightSlot={
            <button
              className="dash-btn dash-hover focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40"
              aria-label="Ver ranking completo"
              type="button"
              onClick={() => goConversations({ filter: "top" })}
            >
              <Users className="h-4 w-4" />
              Ver ranking
              <ArrowUpRight className="h-4 w-4" />
            </button>
          }
        >
          <ol className="space-y-3">
            {data.topClientes.slice(0, 6).map((c, idx) => (
              <li
                key={c.phone}
                className="dash-card dash-card-soft dash-hover p-4 rounded-2xl flex items-center justify-between gap-4"
                aria-label={`Posição ${idx + 1}: ${c.name} com ${c.messages} mensagens`}
              >
                <div className="min-w-0">
                  <p className="text-sm opacity-70">#{idx + 1}</p>
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-sm opacity-70 truncate">{c.phone}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm opacity-70">Mensagens</p>
                  <p className="text-3xl font-bold">{formatNumber(c.messages)}</p>
                </div>
              </li>
            ))}
          </ol>

          {data.topClientes.length === 0 && (
            <EmptyState title="Sem dados suficientes" text="Ainda não há mensagens para montar um ranking." />
          )}
        </Panel>
      </section>
    </div>
  )
}

/* ------------------------------ UI Blocks ------------------------------ */

type CardVariant = "default" | "soft" | "dark" | "blue"

function Pill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm
      border border-black/10 dark:border-white/20
      bg-white/65 dark:bg-black/35 backdrop-blur-xl
      shadow-sm"
      role="status"
      aria-label={text}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="font-medium">{text}</span>
    </div>
  )
}

function ActionRow({
  icon,
  title,
  description,
  badge,
  onClick,
}: {
  icon: ReactNode
  title: string
  description: string
  badge?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full text-left
        dash-card dash-card-soft dash-hover
        p-4 sm:p-5 rounded-2xl
        focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40
      "
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="dash-icon">{icon}</div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{title}</p>
            <p className="text-sm opacity-75 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {badge ? (
          <span
            className="
              shrink-0
              inline-flex items-center justify-center
              min-w-10 h-8 px-3 rounded-full text-sm font-semibold
              bg-black text-white
              dark:bg-white dark:text-black
            "
            aria-label={`Quantidade: ${badge}`}
          >
            {badge}
          </span>
        ) : (
          <ChevronDown className="h-4 w-4 opacity-40 mt-2 shrink-0" aria-hidden="true" />
        )}
      </div>
    </button>
  )
}

function AvatarBadge({ name }: { name: string }) {
  const initials = useMemo(() => {
    const parts = name.trim().split(" ").filter(Boolean)
    const a = parts[0]?.[0] ?? "C"
    const b = parts[1]?.[0] ?? ""
    return (a + b).toUpperCase()
  }, [name])

  return (
    <div
      className="
        w-11 h-11 rounded-2xl
        border border-black/10 dark:border-white/20
        bg-white/70 dark:bg-black/35
        backdrop-blur-xl
        flex items-center justify-center
        shadow-sm
        shrink-0
      "
      aria-hidden="true"
      title={name}
    >
      <span className="font-semibold text-sm">{initials}</span>
    </div>
  )
}

function SmallTag({
  text,
  variant,
}: {
  text: string
  variant?: "waiting" | "in_progress" | "done"
}) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border backdrop-blur-xl"
  const normal = "border-black/10 dark:border-white/20 bg-white/60 dark:bg-black/35"
  const waiting = "border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/15"
  const progress = "border-sky-500/20 bg-sky-500/10 dark:bg-sky-500/15"
  const done = "border-emerald-500/15 bg-emerald-500/8 dark:bg-emerald-500/12"

  const cls =
    variant === "waiting" ? waiting : variant === "in_progress" ? progress : variant === "done" ? done : normal

  return <span className={`${base} ${cls}`}>{text}</span>
}

function SoftTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; payload?: any }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  const name = payload[0]?.name ?? payload[0]?.payload?.name ?? label ?? "Valor"
  const value = payload[0]?.value ?? payload[0]?.payload?.value ?? 0

  return (
    <div
      className="
        rounded-2xl px-4 py-3
        border border-black/10 dark:border-white/20
        bg-white/85 dark:bg-black/70
        backdrop-blur-xl shadow-2xl
        text-black dark:text-white
      "
      role="tooltip"
      aria-label={`${String(name)}: ${value}`}
    >
      <p className="text-sm font-semibold">{String(name)}</p>
      <p className="text-sm opacity-80">{formatNumber(Number(value) || 0)}</p>
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value,
  hint,
  variant = "default",
}: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  variant?: CardVariant
}) {
  return (
    <div className={`${cardClass(variant)} dash-hover p-5 sm:p-6 rounded-[2rem] flex items-center gap-4`} role="group" aria-label={`${label}: ${value}`}>
      <div className="dash-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm opacity-70 truncate">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {hint ? <p className="text-xs sm:text-sm opacity-60 mt-1 truncate">{hint}</p> : null}
      </div>
    </div>
  )
}

function KpiCard({
  title,
  value,
  footer,
  icon,
  isTextValue,
  variant = "default",
}: {
  title: string
  value: string
  footer: string
  icon: ReactNode
  isTextValue?: boolean
  variant?: CardVariant
}) {
  return (
    <div className={`${cardClass(variant)} dash-hover p-6 sm:p-7`} role="group" aria-label={`${title}: ${value}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm opacity-70">{title}</p>
        <div className="dash-icon" aria-hidden="true">
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <p className={isTextValue ? "text-2xl sm:text-3xl font-bold" : "text-4xl sm:text-5xl font-bold"}>
          {value}
        </p>
        <p className="mt-2 text-sm opacity-70">{footer}</p>
      </div>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  rightSlot,
  children,
  className = "",
  variant = "default",
}: {
  title: string
  subtitle?: string
  rightSlot?: ReactNode
  children: ReactNode
  className?: string
  variant?: CardVariant
}) {
  return (
    <div className={`${cardClass(variant)} dash-hover p-6 sm:p-8 ${className}`} role="region" aria-label={title}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
          {subtitle ? <p className="text-sm opacity-70 mt-1">{subtitle}</p> : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      {children}
    </div>
  )
}

function IACard({ title, text, variant = "default" }: { title: string; text: string; variant?: CardVariant }) {
  return (
    <div className={`${cardClass(variant)} dash-hover p-6 sm:p-8`} role="region" aria-label={title}>
      <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm sm:text-base opacity-80 leading-relaxed">{text}</p>
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="dash-card dash-card-soft p-6 text-center rounded-2xl">
      <p className="font-semibold">{title}</p>
      <p className="text-sm opacity-70 mt-1">{text}</p>
    </div>
  )
}

function cardClass(v: CardVariant) {
  if (v === "blue") return "dash-card-blue"
  if (v === "dark") return "dash-card dash-card-dark"
  if (v === "soft") return "dash-card dash-card-soft"
  return "dash-card"
}

/* ------------------------------ Helpers ------------------------------ */

function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat("pt-BR").format(n)
  } catch {
    return String(n)
  }
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  } catch {
    return d.toLocaleString()
  }
}

function formatRelativeTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  if (Number.isNaN(diffMs)) return "—"

  const min = Math.round(diffMs / (1000 * 60))
  if (min < 1) return "agora"
  if (min < 60) return `${min} min atrás`

  const h = Math.round(min / 60)
  if (h < 24) return `${h} h atrás`

  const days = Math.round(h / 24)
  return `${days} d atrás`
}

function channelLabel(ch: ConversationPreview["channel"]) {
  if (ch === "whatsapp") return "WhatsApp"
  if (ch === "instagram") return "Instagram"
  return "Web"
}

function statusLabel(s: ConversationPreview["status"]) {
  if (s === "waiting") return "Aguardando"
  if (s === "in_progress") return "Em atendimento"
  return "Finalizado"
}

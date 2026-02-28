import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  FileText,
  Download,
  Users,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronDown,
  Check,
  Search,
  X,
  Plus,
  Minus,
  ArrowRight,
  Database,
  BarChart2,
  Filter,
} from "lucide-react"

/* ========================= TYPES ========================= */
type ReportType = "all" | "not_started" | "completed" | "stage_x"
type ColumnKey =
  | "id" | "name" | "phone" | "email" | "createdAt" | "updatedAt"
  | "status" | "stage" | "utmSource" | "utmCampaign"
  | "lastMessageAt" | "tags" | "owner" | "city" | "state" | "country"
type ColumnGroup = "Sistema" | "Identificação" | "Contato" | "Marketing" | "Atendimento" | "Localização"

type ColumnDef = { key: ColumnKey; label: string; hint?: string; group: ColumnGroup }

/* ========================= DATA ========================= */
const ALL_COLUMNS: ColumnDef[] = [
  { key: "id",            label: "ID",               hint: "Identificador único",        group: "Sistema" },
  { key: "createdAt",     label: "Criado em",         hint: "Data de criação",            group: "Sistema" },
  { key: "updatedAt",     label: "Atualizado em",     hint: "Última atualização",         group: "Sistema" },
  { key: "name",          label: "Nome",                                                  group: "Identificação" },
  { key: "status",        label: "Status",            hint: "Lead / Cliente / Inativo",   group: "Identificação" },
  { key: "stage",         label: "Etapa",             hint: "Etapa atual do funil",       group: "Identificação" },
  { key: "owner",         label: "Responsável",       hint: "Operador / time",            group: "Identificação" },
  { key: "phone",         label: "Telefone",                                              group: "Contato" },
  { key: "email",         label: "E-mail",                                                group: "Contato" },
  { key: "utmSource",     label: "UTM Source",                                            group: "Marketing" },
  { key: "utmCampaign",   label: "UTM Campaign",                                          group: "Marketing" },
  { key: "lastMessageAt", label: "Última mensagem",   hint: "Data da última interação",   group: "Atendimento" },
  { key: "tags",          label: "Tags",              hint: "Orçamento, Agendamento…",    group: "Atendimento" },
  { key: "city",          label: "Cidade",                                                group: "Localização" },
  { key: "state",         label: "Estado",                                                group: "Localização" },
  { key: "country",       label: "País",                                                  group: "Localização" },
]

const DEFAULT_COLS: ColumnKey[] = ["name","phone","email","status","stage","lastMessageAt","createdAt"]

const STAGES = [
  { id: 1, label: "Etapa 1 — Primeiro contato" },
  { id: 2, label: "Etapa 2 — Qualificação" },
  { id: 3, label: "Etapa 3 — Coleta de dados" },
  { id: 4, label: "Etapa 4 — Proposta" },
  { id: 5, label: "Etapa 5 — Conclusão" },
]

const REPORTS: Array<{
  id: ReportType
  title: string
  description: string
  icon: React.ReactNode
  color: string
  count: string
}> = [
  {
    id: "all",
    title: "Todos os clientes",
    description: "Exportar a base completa de clientes cadastrados.",
    icon: <Users className="h-5 w-5" />,
    color: "blue",
    count: "3.842",
  },
  {
    id: "not_started",
    title: "Não avançaram da 1ª etapa",
    description: "Clientes que entraram mas não progrediram no funil.",
    icon: <AlertCircle className="h-5 w-5" />,
    color: "orange",
    count: "1.204",
  },
  {
    id: "completed",
    title: "Concluíram todas as etapas",
    description: "Clientes que finalizaram o preenchimento completo.",
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: "green",
    count: "987",
  },
  {
    id: "stage_x",
    title: "Até a etapa X",
    description: "Filtrar clientes que chegaram até uma etapa específica.",
    icon: <Layers className="h-5 w-5" />,
    color: "purple",
    count: "—",
  },
]

const COLUMN_GROUPS = ["Sistema","Identificação","Contato","Marketing","Atendimento","Localização"] as ColumnGroup[]

const GROUP_ICONS: Record<ColumnGroup, React.ReactNode> = {
  Sistema:        <Database className="h-4 w-4" />,
  Identificação:  <Users className="h-4 w-4" />,
  Contato:        <FileText className="h-4 w-4" />,
  Marketing:      <BarChart2 className="h-4 w-4" />,
  Atendimento:    <CheckCircle2 className="h-4 w-4" />,
  Localização:    <Filter className="h-4 w-4" />,
}

/* ========================= PAGE ========================= */
export default function Reports() {
  const { t } = useTranslation()
  const [activeReport, setActiveReport] = useState<ReportType>("all")
  const [stageX, setStageX] = useState(3)
  const [selectedCols, setSelectedCols] = useState<ColumnKey[]>(DEFAULT_COLS)
  const [colPanelOpen, setColPanelOpen] = useState(false)
  const [searchQ, setSearchQ] = useState("")
  const [openGroups, setOpenGroups] = useState<Record<ColumnGroup, boolean>>({
    Sistema: false, Identificação: true, Contato: true,
    Marketing: false, Atendimento: true, Localização: false,
  })

  const grouped = useMemo(() => {
    const map: Record<ColumnGroup, ColumnDef[]> = {} as any
    for (const g of COLUMN_GROUPS) map[g] = []
    for (const c of ALL_COLUMNS) map[c.group].push(c)
    return map
  }, [])

  const filteredGrouped = useMemo(() => {
    const q = searchQ.trim().toLowerCase()
    if (!q) return grouped
    const out: Record<ColumnGroup, ColumnDef[]> = {} as any
    for (const g of COLUMN_GROUPS) {
      const cols = grouped[g].filter(c =>
        `${c.label} ${c.hint ?? ""} ${c.key}`.toLowerCase().includes(q)
      )
      if (cols.length) out[g] = cols
    }
    return out
  }, [grouped, searchQ])

  const colLabelMap = useMemo(() => new Map(ALL_COLUMNS.map(c => [c.key, c.label])), [])
  const activeR = REPORTS.find(r => r.id === activeReport)!

  function toggleCol(k: ColumnKey) {
    setSelectedCols(prev => {
      const next = prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]
      return next.length ? next : ["name"]
    })
  }
  function removeCol(k: ColumnKey) {
    setSelectedCols(prev => { const n = prev.filter(x => x !== k); return n.length ? n : ["name"] })
  }
  function toggleGroup(g: ColumnGroup) {
    setOpenGroups(p => ({ ...p, [g]: !p[g] }))
  }
  function selectAll() { setSelectedCols(ALL_COLUMNS.map(c => c.key)) }
  function resetDefault() { setSelectedCols(DEFAULT_COLS) }
  function selectGroup(g: ColumnGroup) {
    setSelectedCols(prev => Array.from(new Set([...prev, ...grouped[g].map(c => c.key)])))
  }
  function clearGroup(g: ColumnGroup) {
    const keys = new Set(grouped[g].map(c => c.key))
    setSelectedCols(prev => { const n = prev.filter(k => !keys.has(k)); return n.length ? n : ["name"] })
  }

  function downloadCSV() {
    const headers = selectedCols.map(k => colLabelMap.get(k) ?? k).join(",")
    const iso = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")
    const name = `relatorio-${activeReport}${activeReport==="stage_x"?`-etapa${stageX}`:""}-${iso}.csv`
    const blob = new Blob([headers+"\n"], { type:"text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement("a"), { href: url, download: name })
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    blue:   { bg:"bg-blue-50 dark:bg-blue-950/30",   border:"border-blue-200 dark:border-blue-800",   text:"text-blue-700 dark:text-blue-300",   icon:"bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300" },
    orange: { bg:"bg-orange-50 dark:bg-orange-950/30",border:"border-orange-200 dark:border-orange-800",text:"text-orange-700 dark:text-orange-300",icon:"bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300" },
    green:  { bg:"bg-green-50 dark:bg-green-950/30",  border:"border-green-200 dark:border-green-800", text:"text-green-700 dark:text-green-300",  icon:"bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300" },
    purple: { bg:"bg-purple-50 dark:bg-purple-950/30",border:"border-purple-200 dark:border-purple-800",text:"text-purple-700 dark:text-purple-300",icon:"bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300" },
  }

  return (
    <div className="min-h-full w-full px-4 md:px-8 py-6 md:py-8 text-[rgb(var(--text-1))]">
      <div className="mx-auto max-w-[960px] space-y-6 md:space-y-8">

        {/* ── PAGE HEADER ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-2xl bg-[rgb(var(--accent)/0.12)] border border-[rgb(var(--accent)/0.20)] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[rgb(var(--accent))]" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{t("reports.s_a7a1ebe8")}</h1>
            </div>
            <p className="text-sm text-[rgb(var(--text-2))] ml-12">
              Selecione o tipo de exportação e as colunas desejadas.
            </p>
          </div>
        </div>

        {/* ── STEP 1: CHOOSE REPORT TYPE ── */}
        <Step number={1} title={t("reports.s_4e93d8ea")}>
          <div className="grid gap-3 sm:grid-cols-2">
            {REPORTS.map(r => {
              const active = r.id === activeReport
              const c = colorMap[r.color]
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveReport(r.id)}
                  className={cx(
                    "group relative w-full text-left rounded-2xl p-4 border transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.3)]",
                    active
                      ? cx(c.bg, c.border, "shadow-sm")
                      : "bg-[rgb(var(--bg-surface-1))] border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))] hover:shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", active ? c.icon : "bg-[rgb(var(--bg-surface-2))] text-[rgb(var(--text-2))]")}>
                      {r.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm leading-tight">{r.title}</p>
                        {active && <Check className={cx("h-4 w-4 shrink-0", c.text)} />}
                      </div>
                      <p className="text-xs text-[rgb(var(--text-2))] mt-1 leading-relaxed">{r.description}</p>
                      {r.count !== "—" && (
                        <p className={cx("text-xs font-semibold mt-2", active ? c.text : "text-[rgb(var(--text-3))]")}>
                          ~{r.count} registros
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Stage selector — only when stage_x is selected */}
          {activeReport === "stage_x" && (
            <div className="mt-4 p-4 rounded-2xl bg-[rgb(var(--bg-surface-1))] border border-[rgb(var(--border))] shadow-sm">
              <p className="text-sm font-semibold mb-2">{t("reports.s_d439aca3")}</p>
              <div className="relative">
                <select
                  value={stageX}
                  onChange={e => setStageX(Number(e.target.value))}
                  className={cx(
                    "w-full appearance-none rounded-xl pl-4 pr-10 py-3 text-sm",
                    "bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))]",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.25)]",
                    "text-[rgb(var(--text-1))]"
                  )}
                >
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-3))] pointer-events-none" />
              </div>
            </div>
          )}
        </Step>

        {/* ── STEP 2: CHOOSE COLUMNS ── */}
        <Step number={2} title={t("reports.s_43ccc585")}>
          {/* Summary chips of selected */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm text-[rgb(var(--text-2))]">
                <span className="font-semibold text-[rgb(var(--text-1))]">{selectedCols.length}</span> coluna{selectedCols.length !== 1 ? "s" : ""} selecionada{selectedCols.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <SmBtn onClick={resetDefault}>{t("reports.s_d8e00743")}</SmBtn>
                <SmBtn onClick={selectAll}>{t("reports.s_8a3c3440")}</SmBtn>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedCols.map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => removeCol(k)}
                  className="group w-full inline-flex items-center justify-between gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-[rgb(var(--accent)/0.10)] border border-[rgb(var(--accent)/0.20)] text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent)/0.16)] transition"
                >
                  <span className="truncate">{colLabelMap.get(k) ?? k}</span>
                  <X className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          {/* Toggle column picker */}
          <button
            type="button"
            onClick={() => setColPanelOpen(v => !v)}
            className={cx(
              "w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold border transition",
              colPanelOpen
                ? "bg-[rgb(var(--accent)/0.08)] border-[rgb(var(--accent)/0.22)] text-[rgb(var(--accent))]"
                : "bg-[rgb(var(--bg-surface-1))] border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]"
            )}
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Personalizar colunas
            </span>
            <ChevronDown className={cx("h-4 w-4 transition-transform", colPanelOpen ? "rotate-180" : "")} />
          </button>

          {/* Column picker panel */}
          {colPanelOpen && (
            <div className="mt-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))] overflow-hidden shadow-sm">
              {/* Search */}
              <div className="p-3 border-b border-[rgb(var(--border))]">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-3))]" />
                  <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder={t("reports.s_79f867a6")}
                    className={cx(
                      "w-full pl-9 pr-9 py-2 rounded-xl text-sm",
                      "bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))]",
                      "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.2)]",
                      "placeholder:text-[rgb(var(--text-3))]"
                    )}
                  />
                  {searchQ && (
                    <button type="button" onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-3))] hover:text-[rgb(var(--text-1))]">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Groups */}
              <div className="divide-y divide-[rgb(var(--border))]">
                {(Object.keys(filteredGrouped) as ColumnGroup[]).length === 0 ? (
                  <div className="p-6 text-center text-sm text-[rgb(var(--text-2))]">
                    Nenhuma coluna encontrada para <span className="font-semibold">"{searchQ}"</span>
                  </div>
                ) : (
                  (Object.keys(filteredGrouped) as ColumnGroup[]).map(group => {
                    const cols = filteredGrouped[group]
                    const selectedInGroup = cols.filter(c => selectedCols.includes(c.key)).length
                    const isOpen = !!openGroups[group]
                    return (
                      <div key={group}>
                        {/* Group header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[rgb(var(--bg-surface-2)/0.5)]">
                          <button
                            type="button"
                            onClick={() => toggleGroup(group)}
                            className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition"
                          >
                            <span className="text-[rgb(var(--text-3))]">{GROUP_ICONS[group]}</span>
                            <span className="text-sm font-semibold">{group}</span>
                            <span className="text-xs text-[rgb(var(--text-3))] ml-1">
                              ({selectedInGroup}/{cols.length})
                            </span>
                            <ChevronDown className={cx("h-3.5 w-3.5 text-[rgb(var(--text-3))] ml-auto mr-2 transition-transform", isOpen ? "rotate-180" : "")} />
                          </button>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <SmBtn onClick={() => selectGroup(group)}>
                              <Plus className="h-3 w-3" />
                            </SmBtn>
                            <SmBtn onClick={() => clearGroup(group)}>
                              <Minus className="h-3 w-3" />
                            </SmBtn>
                          </div>
                        </div>

                        {/* Columns */}
                        {isOpen && (
                          <div className="px-4 py-2 grid gap-1">
                            {cols.map(c => {
                              const checked = selectedCols.includes(c.key)
                              return (
                                <label
                                  key={c.key}
                                  className={cx(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition",
                                    checked
                                      ? "bg-[rgb(var(--accent)/0.08)]"
                                      : "hover:bg-[rgb(var(--bg-surface-2))]"
                                  )}
                                >
                                  <div className={cx(
                                    "w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition",
                                    checked
                                      ? "bg-[rgb(var(--accent))] border-[rgb(var(--accent))]"
                                      : "border-[rgb(var(--border-strong))] bg-transparent"
                                  )}>
                                    {checked && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleCol(c.key)}
                                    className="sr-only"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium">{c.label}</p>
                                    {c.hint && <p className="text-xs text-[rgb(var(--text-3))] mt-0.5">{c.hint}</p>}
                                  </div>
                                </label>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </Step>

        {/* ── STEP 3: DOWNLOAD ── */}
        <Step number={3} title={t("reports.s_6756030a")}>
          <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))] overflow-hidden shadow-sm">
            {/* Summary */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold truncate">{activeR.title}</p>
                <p className="text-sm text-[rgb(var(--text-2))] mt-0.5">
                  {selectedCols.length} colunas selecionadas
                  {activeReport === "stage_x" && ` • Até ${STAGES.find(s => s.id === stageX)?.label}`}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedCols.slice(0, 6).map(k => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-[rgb(var(--bg-surface-2))] text-[rgb(var(--text-2))] border border-[rgb(var(--border))]">
                      {colLabelMap.get(k) ?? k}
                    </span>
                  ))}
                  {selectedCols.length > 6 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgb(var(--bg-surface-2))] text-[rgb(var(--text-3))] border border-[rgb(var(--border))]">
                      +{selectedCols.length - 6} mais
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={downloadCSV}
                className={cx(
                  "shrink-0 inline-flex items-center justify-center gap-2",
                  "rounded-2xl px-6 py-3 font-semibold text-sm",
                  "bg-[rgb(var(--accent))] text-white",
                  "hover:opacity-90 active:opacity-80 transition",
                  "shadow-[0_4px_20px_rgb(var(--accent)/0.35)]",
                  "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.4)]",
                  "w-full sm:w-auto"
                )}
              >
                <Download className="h-4 w-4" />
                Baixar CSV
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Step>

      </div>
    </div>
  )
}

/* ========================= COMPONENTS ========================= */

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 rounded-full bg-[rgb(var(--accent))] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgb(var(--accent)/0.35)]">
          {number}
        </div>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="ml-0 sm:ml-10">
        {children}
      </div>
    </div>
  )
}

function SmBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium",
        "bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))]",
        "text-[rgb(var(--text-2))] hover:text-[rgb(var(--text-1))] hover:border-[rgb(var(--border-strong))] transition"
      )}
    >
      {children}
    </button>
  )
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}
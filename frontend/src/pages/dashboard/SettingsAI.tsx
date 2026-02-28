import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  Building2,
  Mic2,
  ListChecks,
  Target,
  CheckCircle2,
  ShoppingCart,
  ClipboardList,
  Plus,
  X,
  Save,
  Zap,
  Bot,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react"

/* ========================= TYPES ========================= */
type ToneId   = "profissional" | "formal" | "amigavel" | "jovem"
type SectionId = "identidade" | "tom" | "objetivo" | "limites" | "fluxos" | "coleta"
type FlowTab   = "compra" | "existente" | "reclamacao" | "transferir"

// FIX 1: Declaração única com todos os campos necessários
type CollectOption = {
  id: string
  label?: string
  labelKey?: string
  checked: boolean
}

/* ========================= DATA ========================= */
const TONE_KEYS: Array<{ id: ToneId; titleKey: string; subtitleKey: string; idealForKey: string; charsKey: string; exampleKey: string }> = [
  { id: "profissional", titleKey: "ai.tone_prof_title",    subtitleKey: "ai.tone_prof_subtitle",    idealForKey: "ai.tone_prof_idealFor",    charsKey: "ai.tone_prof_chars",    exampleKey: "ai.tone_prof_example"    },
  { id: "formal",       titleKey: "ai.tone_formal_title",  subtitleKey: "ai.tone_formal_subtitle",  idealForKey: "ai.tone_formal_idealFor",  charsKey: "ai.tone_formal_chars",  exampleKey: "ai.tone_formal_example"  },
  { id: "amigavel",     titleKey: "ai.tone_friendly_title",subtitleKey: "ai.tone_friendly_subtitle",idealForKey: "ai.tone_friendly_idealFor",charsKey: "ai.tone_friendly_chars",exampleKey: "ai.tone_friendly_example"},
  { id: "jovem",        titleKey: "ai.tone_young_title",   subtitleKey: "ai.tone_young_subtitle",   idealForKey: "ai.tone_young_idealFor",   charsKey: "ai.tone_young_chars",   exampleKey: "ai.tone_young_example"   },
]

const SECTION_KEYS: Array<{ id: SectionId; icon: React.ReactNode; labelKey: string; descKey: string }> = [
  { id: "identidade", icon: <Building2 className="h-5 w-5" />,     labelKey: "ai.sec_identity_label", descKey: "ai.sec_identity_desc" },
  { id: "tom",        icon: <Mic2 className="h-5 w-5" />,          labelKey: "ai.sec_tone_label",     descKey: "ai.sec_tone_desc"     },
  { id: "objetivo",   icon: <Target className="h-5 w-5" />,        labelKey: "ai.sec_goal_label",     descKey: "ai.sec_goal_desc"     },
  { id: "limites",    icon: <ListChecks className="h-5 w-5" />,    labelKey: "ai.sec_limits_label",   descKey: "ai.sec_limits_desc"   },
  { id: "fluxos",     icon: <ShoppingCart className="h-5 w-5" />,  labelKey: "ai.sec_flows_label",    descKey: "ai.sec_flows_desc"    },
  { id: "coleta",     icon: <ClipboardList className="h-5 w-5" />, labelKey: "ai.sec_collect_label",  descKey: "ai.sec_collect_desc"  },
]

const FLOW_TAB_KEYS: Array<{ id: FlowTab; labelKey: string; descKey: string }> = [
  { id: "compra",     labelKey: "ai.flow_buy_label",       descKey: "ai.flow_buy_desc"       },
  { id: "existente",  labelKey: "ai.flow_existing_label",  descKey: "ai.flow_existing_desc"  },
  { id: "reclamacao", labelKey: "ai.flow_complaint_label", descKey: "ai.flow_complaint_desc" },
  { id: "transferir", labelKey: "ai.flow_transfer_label",  descKey: "ai.flow_transfer_desc"  },
]

const DEFAULT_RULES = [
  "Responder de forma clara, objetiva e profissional.",
  "Evitar gírias e abreviações informais.",
  "Sempre confirmar dados antes de qualquer alteração cadastral.",
  "Priorizar soluções rápidas e práticas.",
  "Manter postura institucional e cordial.",
  "Nunca discutir com o cliente.",
  "Usar linguagem simples e acessível.",
]
const DEFAULT_SUCCESS = [
  "Redução do tempo médio de atendimento.",
  "Aumento na conversão de vendas de planos.",
  "Alta taxa de resolução no primeiro contato.",
  "Redução de encaminhamentos para atendimento humano.",
]
const DEFAULT_CAN = [
  "Consultar planos móveis, fibra e TV.",
  "Informar valores e benefícios.",
  "Verificar cobertura por CEP.",
  "Gerar segunda via de boleto.",
  "Gerar link de pagamento.",
  "Abrir protocolo de atendimento.",
  "Agendar visita técnica.",
  "Coletar dados para contratação de plano.",
  "Ofertar upgrade de plano.",
]
const DEFAULT_CANNOT = [
  "Conceder descontos personalizados.",
  "Cancelar contrato sem autenticação.",
  "Negociar dívidas manualmente.",
  "Alterar titularidade sem validação.",
  "Fornecer dados sensíveis sem confirmação de identidade.",
]
const DEFAULT_BUY = [
  "Perguntar se o cliente deseja plano móvel ou internet fibra.",
  "Solicitar CEP para verificar cobertura.",
  "Apresentar até 3 melhores planos disponíveis.",
  "Coletar nome completo, CPF, data de nascimento e endereço.",
  "Confirmar dados com o cliente.",
  "Enviar resumo do plano escolhido.",
  "Gerar protocolo de contratação.",
]
const DEFAULT_EXISTING = [
  "Solicitar CPF ou número do contrato.",
  "Validar data de nascimento.",
  "Identificar a solicitação (financeiro, técnico, plano).",
  "Resolver automaticamente quando possível.",
  "Caso não seja possível, abrir protocolo ou encaminhar.",
]
const DEFAULT_COMPLAINT = [
  "Solicitar número do cliente ou CPF.",
  "Identificar tipo de problema (internet, sinal, cobrança).",
  "Executar diagnóstico automático.",
  "Orientar testes básicos.",
  "Se necessário, agendar visita técnica.",
  "Gerar protocolo e informar prazo.",
]
const DEFAULT_TRANSFER = [
  "Cliente solicitar cancelamento definitivo.",
  "Cliente mencionar processo judicial ou PROCON.",
  "Problema técnico persistir após duas tentativas.",
  "Erro sistêmico.",
  "Solicitação fora do escopo da IA.",
  "Cliente pedir atendente humano explicitamente.",
]

const DEFAULT_COLLECT: CollectOption[] = [
  { id: "nome",       labelKey: "ai.collect_nome",       checked: true  },
  { id: "cpf",        labelKey: "ai.collect_cpf",        checked: true  },
  { id: "nascimento", labelKey: "ai.collect_nascimento", checked: true  },
  { id: "telefone",   labelKey: "ai.collect_telefone",   checked: true  },
  { id: "email",      labelKey: "ai.collect_email",      checked: true  },
  { id: "cep",        labelKey: "ai.collect_cep",        checked: true  },
  { id: "endereco",   labelKey: "ai.collect_endereco",   checked: true  },
  { id: "contrato",   labelKey: "ai.collect_contrato",   checked: true  },
  { id: "cidade",     labelKey: "ai.collect_cidade",     checked: false },
  { id: "bairro",     labelKey: "ai.collect_bairro",     checked: false },
  { id: "horario",    labelKey: "ai.collect_horario",    checked: false },
  { id: "motivo",     labelKey: "ai.collect_motivo",     checked: false },
  { id: "empresa",    labelKey: "ai.collect_empresa",    checked: false },
  { id: "cnpj",       labelKey: "ai.collect_cnpj",       checked: false },
]

function uid() { return Math.random().toString(36).slice(2, 9) }

/* ========================= HOOKS ========================= */
function useIsMobile(breakpointPx = 640) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    if (mq.addEventListener) mq.addEventListener("change", update)
    else mq.addListener(update)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update)
      else mq.removeListener(update)
    }
  }, [breakpointPx])

  return isMobile
}

/* ========================= PAGE ========================= */
export default function SettingsAI() {
  const { t } = useTranslation()
  const [section,   setSection]   = useState<SectionId>("identidade")
  const [saved,     setSaved]     = useState(false)
  const [empresa,   setEmpresa]   = useState("")
  const [ramo,      setRamo]      = useState("Telecomunicações — Telefonia móvel, Internet Fibra e TV por assinatura")
  const [secretaria,setSecretaria]= useState("")
  const [tone,      setTone]      = useState<ToneId>("profissional")
  const [rules,     setRules]     = useState(DEFAULT_RULES)
  const [objetivo,  setObjetivo]  = useState("")
  const [success,   setSuccess]   = useState(DEFAULT_SUCCESS)
  const [canDo,     setCanDo]     = useState(DEFAULT_CAN)
  const [cannotDo,  setCannotDo]  = useState(DEFAULT_CANNOT)
  const [flowTab,   setFlowTab]   = useState<FlowTab>("compra")
  const [buyFlow,   setBuyFlow]   = useState(DEFAULT_BUY)
  const [existing,  setExisting]  = useState(DEFAULT_EXISTING)
  const [complaint, setComplaint] = useState(DEFAULT_COMPLAINT)
  const [transfer,  setTransfer]  = useState(DEFAULT_TRANSFER)
  const [collect,   setCollect]   = useState(DEFAULT_COLLECT)

  const activeTone   = useMemo(() => TONE_KEYS.find(tn => tn.id === tone)!, [tone])
  const currentIdx   = SECTION_KEYS.findIndex(s => s.id === section)
  const isFirst      = currentIdx === 0
  const isLast       = currentIdx === SECTION_KEYS.length - 1
  const currentSection = SECTION_KEYS[currentIdx]

  function go(dir: 1 | -1) {
    const next = SECTION_KEYS[currentIdx + dir]
    if (next) setSection(next.id)
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const isMobile = useIsMobile(640)

  const shared = {
    section, setSection,
    saved, save,
    empresa, setEmpresa,
    ramo, setRamo,
    secretaria, setSecretaria,
    tone, setTone,
    rules, setRules,
    objetivo, setObjetivo,
    success, setSuccess,
    canDo, setCanDo,
    cannotDo, setCannotDo,
    flowTab, setFlowTab,
    buyFlow, setBuyFlow,
    existing, setExisting,
    complaint, setComplaint,
    transfer, setTransfer,
    collect, setCollect,
    currentIdx, isFirst, isLast, currentSection,
    go,
    activeTone,
  }

  return isMobile ? <MobileView {...shared} /> : <DesktopView {...shared} />
}

/* ========================= MOBILE VIEW ========================= */
function MobileView(props: any) {
  // FIX 3: useTranslation dentro do componente para ter acesso ao `t`
  const { t } = useTranslation()

  const {
    section, setSection,
    saved, save,
    empresa, setEmpresa,
    ramo, setRamo,
    secretaria, setSecretaria,
    tone, setTone,
    rules, setRules,
    objetivo, setObjetivo,
    success, setSuccess,
    canDo, setCanDo,
    cannotDo, setCannotDo,
    flowTab, setFlowTab,
    buyFlow, setBuyFlow,
    existing, setExisting,
    complaint, setComplaint,
    transfer, setTransfer,
    collect, setCollect,
    currentIdx, isFirst, isLast, currentSection,
    go,
  } = props

  return (
    <div className="w-full min-h-full text-[rgb(var(--text-1))] bg-transparent">
      <div className="w-full max-w-[860px] mx-auto px-3 py-3 box-border">

        {/* Header compacto */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[rgb(var(--accent)/0.10)] border border-[rgb(var(--accent)/0.20)] flex items-center justify-center shrink-0">
              <Bot className="h-6 w-6 text-[rgb(var(--accent))]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight truncate">{t("ai.s_78d0e4a2")}</h1>
              <p className="text-xs text-[rgb(var(--text-2))] mt-0.5 leading-snug truncate">
                {t("ai.s_a0b395db")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={save}
            className={cx(saveBtnCls(saved), "px-3 py-2")}
            aria-label={t("ai.s_93bf2d32")}
          >
            {saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          </button>
        </div>

        {/* Seletor de seção */}
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))] overflow-hidden shadow-[0_2px_24px_rgb(0_0_0_/_.07)] dark:shadow-[0_4px_32px_rgb(0_0_0_/_.25)]">

          <div className="px-4 py-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-2)/0.5)]">
            <p className="text-xs font-semibold text-[rgb(var(--text-3))] uppercase tracking-wide mb-2">
              {t("ai.stepLabel")} {currentIdx + 1} {t("ai.stepOf")} {SECTION_KEYS.length}
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[rgb(var(--accent)/0.10)] border border-[rgb(var(--accent)/0.18)] flex items-center justify-center text-[rgb(var(--accent))] shrink-0">
                {currentSection.icon}
              </div>

              <div className="flex-1 min-w-0">
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as SectionId)}
                  className={cx(
                    "w-full rounded-xl px-3 py-2.5 text-sm font-semibold border border-[rgb(var(--border))]",
                    "bg-[rgb(var(--bg-surface-1))] text-[rgb(var(--text-1))]",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.22)] focus:border-[rgb(var(--accent)/0.40)] transition"
                  )}
                >
                  {SECTION_KEYS.map(s => (
                    <option key={s.id} value={s.id}>{t(s.labelKey)}</option>
                  ))}
                </select>
                <p className="text-xs text-[rgb(var(--text-2))] mt-1 truncate">
                  {t(currentSection.descKey)}
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="px-4 py-4 space-y-5">

            {/* IDENTIDADE */}
            {section === "identidade" && <>
              <Field
                label={t("ai.s_bd63d0a5")}
                hint={t("ai.s_efed2192")}
              >
                <input
                  value={empresa}
                  onChange={e => setEmpresa(e.target.value)}
                  placeholder={t("ai.s_dce878c6")}
                  className={inp}
                />
              </Field>

              <Field
                label={t("ai.s_1a1869d9")}
                hint={t("ai.s_6f5482c8")}
              >
                <textarea value={ramo} onChange={e => setRamo(e.target.value)} rows={4} className={ta} />
              </Field>

              <Field
                label={t("ai.s_06fa98ff")}
                hint={t("ai.s_0620f9c1")}
              >
                <input
                  value={secretaria}
                  onChange={e => setSecretaria(e.target.value)}
                  placeholder={t("ai.s_fb6a75a1")}
                  className={inp}
                />
              </Field>
            </>}

            {/* TOM */}
            {section === "tom" && <>
              <Field
                label={t("ai.s_0cc800dc")}
                hint={t("ai.s_5e077cb6")}
              >
                <div className="grid gap-2">
                  {TONE_KEYS.map(tn => {
                    const active = tn.id === tone
                    return (
                      <button
                        key={tn.id}
                        type="button"
                        onClick={() => setTone(tn.id)}
                        className={cx(
                          "w-full text-left rounded-2xl p-4 border-2 transition",
                          "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.25)]",
                          active
                            ? "bg-[rgb(var(--accent)/0.08)] border-[rgb(var(--accent)/0.40)]"
                            : "bg-[rgb(var(--bg-surface-2)/0.5)] border-[rgb(var(--border))]"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cx(
                            "w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition",
                            active
                              ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]"
                              : "border-[rgb(var(--border-strong))] bg-transparent"
                          )}>
                            {active && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <div className="min-w-0">
                            {/* FIX: usar tn.titleKey e tn.subtitleKey com t() */}
                            <p className="text-base font-bold">{t(tn.titleKey)}</p>
                            <p className="text-sm text-[rgb(var(--text-2))]">{t(tn.subtitleKey)}</p>
                            {active && (
                              <div className="mt-3 rounded-xl bg-[rgb(var(--bg-surface-1))] border border-[rgb(var(--border))] px-4 py-3">
                                <p className="text-xs font-semibold text-[rgb(var(--text-3))] uppercase tracking-wide mb-1">{t("ai.s_6fbc0aa5")}</p>
                                <p className="text-sm italic text-[rgb(var(--text-2))] leading-relaxed">{t(tn.exampleKey)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field
                label={t("ai.s_0c092a04")}
                hint={t("ai.s_9e160e22")}
              >
                <LineList
                  value={rules}
                  onChange={setRules}
                  placeholder={t("ai.s_cacc14a4")}
                />
              </Field>
            </>}

            {/* OBJETIVO */}
            {section === "objetivo" && <>
              <Field
                label={t("ai.s_42244347")}
                hint={t("ai.s_a7d85fda")}
              >
                <textarea
                  value={objetivo}
                  onChange={e => setObjetivo(e.target.value)}
                  rows={6}
                  placeholder={t("ai.s_c1a56a1b")}
                  className={ta}
                />
              </Field>

              <Field
                label={t("ai.s_2db55666")}
                hint={t("ai.s_8493d027")}
              >
                <LineList
                  value={success}
                  onChange={setSuccess}
                  placeholder={t("ai.s_4d4fcf52")}
                />
              </Field>
            </>}

            {/* LIMITES */}
            {section === "limites" && <>
              <Field
                label={t("ai.s_ec9d98a4")}
                hint={t("ai.s_91b97dcc")}
              >
                <LineList
                  value={canDo}
                  onChange={setCanDo}
                  placeholder={t("ai.s_df09aa75")}
                  bulletColor="green"
                />
              </Field>

              <div className="h-px bg-[rgb(var(--border))]" />

              <Field
                label={t("ai.s_90aee63a")}
                hint={t("ai.s_fb22cbc0")}
              >
                <LineList
                  value={cannotDo}
                  onChange={setCannotDo}
                  placeholder={t("ai.s_a2feb403")}
                  bulletColor="red"
                />
              </Field>
            </>}

            {/* FLUXOS */}
            {section === "fluxos" && <>
              <Field
                label={t("ai.s_8d547be2")}
                hint={t("ai.s_6bf63681")}
              >
                <select
                  value={flowTab}
                  onChange={(e) => setFlowTab(e.target.value as FlowTab)}
                  className={cx(
                    "w-full rounded-xl px-3 py-2.5 text-sm font-semibold border border-[rgb(var(--border))]",
                    "bg-[rgb(var(--bg-surface-2)/0.5)] text-[rgb(var(--text-1))]",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.22)] focus:border-[rgb(var(--accent)/0.40)] transition"
                  )}
                >
                  {FLOW_TAB_KEYS.map(f => (
                    <option key={f.id} value={f.id}>{t(f.labelKey)}</option>
                  ))}
                </select>

                <div className="mt-3 rounded-2xl border border-[rgb(var(--border))] overflow-hidden">
                  <div className="px-4 py-3 bg-[rgb(var(--bg-surface-2)/0.5)] border-b border-[rgb(var(--border))]">
                    <p className="font-semibold text-sm">{t(FLOW_TAB_KEYS.find(f => f.id === flowTab)?.labelKey ?? '')}</p>
                    <p className="text-xs text-[rgb(var(--text-2))] mt-0.5">
                      {t(FLOW_TAB_KEYS.find(f => f.id === flowTab)?.descKey ?? '')}
                    </p>
                  </div>
                  <div className="p-3">
                    {flowTab === "compra"     && <LineList value={buyFlow}   onChange={setBuyFlow}   numbered placeholder={t("ai.s_89fb36b8")} />}
                    {flowTab === "existente"  && <LineList value={existing}  onChange={setExisting}  numbered placeholder={t("ai.s_89fb36b8")} />}
                    {flowTab === "reclamacao" && <LineList value={complaint} onChange={setComplaint} numbered placeholder={t("ai.s_89fb36b8")} />}
                    {flowTab === "transferir" && <LineList value={transfer}  onChange={setTransfer}  placeholder={t("ai.s_eb1012d1")} bulletColor="orange" />}
                  </div>
                </div>
              </Field>
            </>}

            {/* COLETA */}
            {section === "coleta" && <>
              <Field
                label={t("ai.s_5bf7d57a")}
                hint={t("ai.s_41612039")}
              >
                <div className="grid grid-cols-1 gap-2 w-full">
                  {collect.map((o: CollectOption) => (
                    <label
                      key={o.id}
                      className={cx(
                        "flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer border-2 transition select-none",
                        o.checked
                          ? "bg-[rgb(var(--accent)/0.07)] border-[rgb(var(--accent)/0.30)]"
                          : "bg-[rgb(var(--bg-surface-2)/0.5)] border-[rgb(var(--border))]"
                      )}
                    >
                      <div
                        onClick={() => setCollect((prev: CollectOption[]) => prev.map(x => x.id === o.id ? { ...x, checked: !x.checked } : x))}
                        className={cx(
                          "w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition",
                          o.checked
                            ? "bg-[rgb(var(--accent))] border-[rgb(var(--accent))]"
                            : "border-[rgb(var(--border-strong))] bg-[rgb(var(--bg-surface-1))]"
                        )}
                      >
                        {o.checked && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <input type="checkbox" checked={o.checked} onChange={() => {}} className="sr-only" />
                      <span className="text-sm flex-1 leading-snug">{o.labelKey ? t(o.labelKey) : (o.label ?? "")}</span>

                      {o.id.startsWith("custom_") && (
                        <button
                          type="button"
                          onClick={e => { e.preventDefault(); setCollect((p: CollectOption[]) => p.filter(x => x.id !== o.id)) }}
                          className="text-[rgb(var(--text-3))] hover:text-red-500 transition p-1"
                          aria-label={t("ai.s_4bd4ea83")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </label>
                  ))}
                </div>
              </Field>

              <Field
                label={t("ai.s_57475fca")}
                hint={t("ai.s_63a5b4be")}
              >
                <CollectAdd onAdd={(label) => setCollect((p: CollectOption[]) => [...p, { id: `custom_${uid()}`, label, checked: true }])} />
              </Field>
            </>}
          </div>

          {/* Footer sticky no mobile */}
          <div className="sticky bottom-0 left-0 right-0 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))]">
            <div className="px-3 py-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={isFirst}
                className={cx(
                  "flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold border transition",
                  "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.25)]",
                  isFirst
                    ? "opacity-30 cursor-not-allowed border-[rgb(var(--border))] bg-transparent text-[rgb(var(--text-2))]"
                    : "border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-2))]"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
                {t("ai.btn_previous")}
              </button>

              {!isLast ? (
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold bg-[rgb(var(--accent))] text-white hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.35)]"
                >
                  {t("ai.btn_next")}
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  className={cx(
                    "flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.35)]",
                    saved ? "bg-green-500 text-white" : "bg-[rgb(var(--accent))] text-white hover:opacity-90"
                  )}
                >
                  {saved ? <CheckCircle2 className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                  {saved ? t("ai.btn_savedShort") : t("common.save")}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ========================= DESKTOP VIEW ========================= */
function DesktopView(props: any) {
  // FIX 3: useTranslation dentro do componente para ter acesso ao `t`
  const { t } = useTranslation()

  const {
    section, setSection,
    saved, save,
    empresa, setEmpresa,
    ramo, setRamo,
    secretaria, setSecretaria,
    tone, setTone,
    rules, setRules,
    objetivo, setObjetivo,
    success, setSuccess,
    canDo, setCanDo,
    cannotDo, setCannotDo,
    flowTab, setFlowTab,
    buyFlow, setBuyFlow,
    existing, setExisting,
    complaint, setComplaint,
    transfer, setTransfer,
    collect, setCollect,
    currentIdx, isFirst, isLast, currentSection,
    go,
  } = props

  return (
    <div className="w-full min-h-full text-[rgb(var(--text-1))] bg-transparent overflow-x-hidden">
      <div className="w-full max-w-[860px] mx-auto px-3 py-4 box-border">

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgb(var(--accent)/0.10)] border border-[rgb(var(--accent)/0.20)] flex items-center justify-center shrink-0">
              <Bot className="h-6 w-6 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">{t("ai.s_78d0e4a2")}</h1>
              <p className="text-xs text-[rgb(var(--text-2))] mt-0.5 leading-snug">{t("ai.s_a0b395db")}</p>
            </div>
          </div>

          <button type="button" onClick={save} className={cx(saveBtnCls(saved), "shrink-0")}>
            {saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
            <span className="hidden sm:inline">{saved ? t("ai.btn_savedShort") : t("common.save")}</span>
          </button>
        </div>

        {/* ── SECTION TABS ── */}
        <div className="overflow-x-auto pb-1.5 mb-4 no-scrollbar">
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
            {SECTION_KEYS.map((s, i) => {
              const active = s.id === section
              const done   = i < currentIdx
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 border transition",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.25)]",
                    active
                      ? "bg-[rgb(var(--accent)/0.10)] border-[rgb(var(--accent)/0.30)] text-[rgb(var(--text-1))]"
                      : done
                        ? "bg-[rgb(var(--bg-surface-2))] border-[rgb(var(--border))] text-[rgb(var(--text-2))]"
                        : "bg-[rgb(var(--bg-surface-1))] border-[rgb(var(--border))] text-[rgb(var(--text-2))] hover:border-[rgb(var(--border-strong))] hover:text-[rgb(var(--text-1))]"
                  )}
                >
                  <span className={active ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--text-3))]"}>
                    {s.icon}
                  </span>
                  <span className="text-xs font-semibold whitespace-nowrap">{t(s.labelKey)}</span>
                  {done && <Check className="h-3.5 w-3.5 text-[rgb(var(--text-3))]" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── MAIN CARD ── */}
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-1))] overflow-hidden w-full shadow-[0_2px_24px_rgb(0_0_0_/_.07)] dark:shadow-[0_4px_32px_rgb(0_0_0_/_.25)]">

          {/* Card header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-2)/0.5)]">
            <div className="w-11 h-11 rounded-2xl bg-[rgb(var(--accent)/0.10)] border border-[rgb(var(--accent)/0.18)] flex items-center justify-center text-[rgb(var(--accent))] shrink-0">
              {currentSection.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold leading-tight">{t(currentSection.labelKey)}</h2>
              <p className="text-xs text-[rgb(var(--text-2))] mt-0.5 truncate">{t(currentSection.descKey)}</p>
            </div>
            <span className="text-sm font-medium text-[rgb(var(--text-3))] shrink-0">
              {currentIdx + 1} de {SECTION_KEYS.length}
            </span>
          </div>

          {/* Card body */}
          <div className="px-4 py-5 space-y-5 w-full overflow-x-hidden">

            {/* ── IDENTIDADE ── */}
            {section === "identidade" && <>
              <Field
                label={t("ai.s_bd63d0a5")}
                hint={t("ai.s_efed2192")}
              >
                <input value={empresa} onChange={e => setEmpresa(e.target.value)}
                  placeholder={t("ai.s_dce878c6")} className={inp} />
              </Field>

              <Field
                label={t("ai.s_1a1869d9")}
                hint={t("ai.s_6f5482c8")}
              >
                <textarea value={ramo} onChange={e => setRamo(e.target.value)} rows={3} className={ta} />
              </Field>

              <Field
                label={t("ai.s_06fa98ff")}
                hint={t("ai.s_0620f9c1")}
              >
                <input value={secretaria} onChange={e => setSecretaria(e.target.value)}
                  placeholder={t("ai.s_fb6a75a1")} className={inp} />
              </Field>
            </>}

            {/* ── TOM ── */}
            {section === "tom" && <>
              <Field
                label={t("ai.s_0cc800dc")}
                hint={t("ai.s_64ffb28a")}
              >
                <div className="grid gap-3 w-full">
                  {TONE_KEYS.map(tn => (
                    <button
                      key={tn.id}
                      type="button"
                      onClick={() => setTone(tn.id)}
                      className={cx(
                        "w-full text-left rounded-2xl p-4 border-2 transition",
                        "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.25)]",
                        tone === tn.id
                          ? "bg-[rgb(var(--accent)/0.07)] border-[rgb(var(--accent)/0.40)]"
                          : "bg-[rgb(var(--bg-surface-2)/0.5)] border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cx(
                          "w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition",
                          tone === tn.id
                            ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]"
                            : "border-[rgb(var(--border-strong))] bg-transparent"
                        )}>
                          {tone === tn.id && <Check className="h-3.5 w-3.5 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          {/* FIX: usar tn.titleKey e tn.subtitleKey com t() */}
                          <p className="text-base font-bold">{t(tn.titleKey)}</p>
                          <p className="text-sm text-[rgb(var(--text-2))] mt-0.5">{t(tn.subtitleKey)}</p>
                          <div className="mt-2 grid gap-1">
                            <p className="text-sm text-[rgb(var(--text-2))]">
                              <span className="font-semibold text-[rgb(var(--text-1))]">{t("ai.s_becc8468")} </span>{t(tn.idealForKey)}
                            </p>
                            <p className="text-sm text-[rgb(var(--text-2))]">
                              <span className="font-semibold text-[rgb(var(--text-1))]">{t("ai.s_a71f4a5f")} </span>{t(tn.charsKey)}
                            </p>
                          </div>
                          {tone === tn.id && (
                            <div className="mt-3 rounded-xl bg-[rgb(var(--bg-surface-1))] border border-[rgb(var(--border))] px-4 py-3">
                              <p className="text-xs font-semibold text-[rgb(var(--text-3))] uppercase tracking-wide mb-1">{t("ai.s_0d9a95ea")}</p>
                              <p className="text-sm italic text-[rgb(var(--text-2))] leading-relaxed">{t(tn.exampleKey)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field
                label={t("ai.s_0c092a04")}
                hint={t("ai.s_2427ae4e")}
              >
                <LineList value={rules} onChange={setRules}
                  placeholder={t("ai.s_cacc14a4")} />
              </Field>
            </>}

            {/* ── OBJETIVO ── */}
            {section === "objetivo" && <>
              <Field
                label={t("ai.s_42244347")}
                hint={t("ai.s_44419f94")}
              >
                <textarea
                  value={objetivo}
                  onChange={e => setObjetivo(e.target.value)}
                  rows={5}
                  placeholder={t("ai.s_581a72ea")}
                  className={ta}
                />
              </Field>

              <Field
                label={t("ai.s_2db55666")}
                hint={t("ai.s_633ea2ac")}
              >
                <LineList value={success} onChange={setSuccess}
                  placeholder={t("ai.s_4d4fcf52")} />
              </Field>
            </>}

            {/* ── LIMITES ── */}
            {section === "limites" && <>
              <Field
                label={t("ai.s_ec9d98a4")}
                hint={t("ai.s_b97286fc")}
              >
                <LineList
                  value={canDo}
                  onChange={setCanDo}
                  placeholder={t("ai.s_caaee27b")}
                  bulletColor="green"
                />
              </Field>

              <div className="h-px bg-[rgb(var(--border))]" />

              <Field
                label={t("ai.s_90aee63a")}
                hint={t("ai.s_27aa140e")}
              >
                <LineList
                  value={cannotDo}
                  onChange={setCannotDo}
                  placeholder={t("ai.s_cdedd87f")}
                  bulletColor="red"
                />
              </Field>
            </>}

            {/* ── FLUXOS ── */}
            {section === "fluxos" && <>
              <p className="text-base text-[rgb(var(--text-2))]">
                {t("ai.flowsDescription")}
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {FLOW_TAB_KEYS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFlowTab(f.id)}
                    className={cx(
                      "text-left rounded-2xl px-4 py-3.5 border-2 transition",
                      "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.25)]",
                      flowTab === f.id
                        ? "bg-[rgb(var(--accent)/0.08)] border-[rgb(var(--accent)/0.35)]"
                        : "bg-[rgb(var(--bg-surface-2)/0.5)] border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cx(
                        "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition",
                        flowTab === f.id
                          ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]"
                          : "border-[rgb(var(--border-strong))]"
                      )}>
                        {flowTab === f.id && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-base">{t(f.labelKey)}</p>
                        <p className="text-sm text-[rgb(var(--text-2))]">{t(f.descKey)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-[rgb(var(--border))] overflow-hidden w-full">
                <div className="px-5 py-4 bg-[rgb(var(--bg-surface-2)/0.5)] border-b border-[rgb(var(--border))]">
                  <p className="font-semibold text-base">{t(FLOW_TAB_KEYS.find(f => f.id === flowTab)?.labelKey ?? '')}</p>
                  <p className="text-sm text-[rgb(var(--text-2))] mt-0.5">{t(FLOW_TAB_KEYS.find(f => f.id === flowTab)?.descKey ?? '')}</p>
                </div>
                <div className="p-4">
                  {flowTab === "compra"     && <LineList value={buyFlow}   onChange={setBuyFlow}   numbered placeholder={t("ai.s_89fb36b8")} />}
                  {flowTab === "existente"  && <LineList value={existing}  onChange={setExisting}  numbered placeholder={t("ai.s_89fb36b8")} />}
                  {flowTab === "reclamacao" && <LineList value={complaint} onChange={setComplaint} numbered placeholder={t("ai.s_89fb36b8")} />}
                  {flowTab === "transferir" && <LineList value={transfer}  onChange={setTransfer}  placeholder={t("ai.s_eb1012d1")} bulletColor="orange" />}
                </div>
              </div>
            </>}

            {/* ── COLETA ── */}
            {section === "coleta" && <>
              <Field
                label={t("ai.s_5bf7d57a")}
                hint={t("ai.s_b30f69a7")}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  {collect.map((o: CollectOption) => (
                    <label
                      key={o.id}
                      className={cx(
                        "flex items-center gap-4 rounded-xl px-4 py-3.5 cursor-pointer border-2 transition select-none",
                        o.checked
                          ? "bg-[rgb(var(--accent)/0.07)] border-[rgb(var(--accent)/0.30)]"
                          : "bg-[rgb(var(--bg-surface-2)/0.5)] border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]"
                      )}
                    >
                      <div
                        onClick={() => setCollect((prev: CollectOption[]) => prev.map(x => x.id === o.id ? { ...x, checked: !x.checked } : x))}
                        className={cx(
                          "w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition",
                          o.checked
                            ? "bg-[rgb(var(--accent))] border-[rgb(var(--accent))]"
                            : "border-[rgb(var(--border-strong))] bg-[rgb(var(--bg-surface-1))]"
                        )}
                      >
                        {o.checked && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <input type="checkbox" checked={o.checked} onChange={() => {}} className="sr-only" />
                      <span className="text-sm sm:text-base flex-1 leading-snug">{o.labelKey ? t(o.labelKey) : (o.label ?? "")}</span>
                      {o.id.startsWith("custom_") && (
                        <button
                          type="button"
                          onClick={e => { e.preventDefault(); setCollect((p: CollectOption[]) => p.filter(x => x.id !== o.id)) }}
                          className="text-[rgb(var(--text-3))] hover:text-red-500 transition p-1"
                          aria-label={t("ai.s_4bd4ea83")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label={t("ai.s_57475fca")} hint={t("ai.s_54e2b5d4")}>
                <CollectAdd onAdd={(label) => setCollect((p: CollectOption[]) => [...p, { id: `custom_${uid()}`, label, checked: true }])} />
              </Field>
            </>}

          </div>

          {/* ── NAVIGATION FOOTER ── */}
          <div className="px-4 py-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-2)/0.35)]">
            <div className="flex justify-center gap-1.5 mb-5">
              {SECTION_KEYS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={cx(
                    "rounded-full transition-all focus:outline-none",
                    s.id === section
                      ? "w-8 h-2.5 bg-[rgb(var(--accent))]"
                      : i < currentIdx
                        ? "w-2.5 h-2.5 bg-[rgb(var(--accent)/0.40)]"
                        : "w-2.5 h-2.5 bg-[rgb(var(--border-strong))] hover:bg-[rgb(var(--text-3))]"
                  )}
                  aria-label={t(s.labelKey)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={isFirst}
                className={cx(
                  "inline-flex items-center gap-2 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold border transition",
                  "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.25)]",
                  isFirst
                    ? "opacity-30 cursor-not-allowed border-[rgb(var(--border))] bg-transparent text-[rgb(var(--text-2))]"
                    : "border-[rgb(var(--border))] bg-[rgb(var(--bg-surface-2))] hover:border-[rgb(var(--border-strong))] hover:bg-[rgb(var(--bg-surface-1))]"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
                {t("ai.btn_previous")}
              </button>

              {!isLast ? (
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="inline-flex items-center gap-2 rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-[rgb(var(--accent))] text-white hover:opacity-90 transition shadow-[0_4px_16px_rgb(var(--accent)/0.28)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.35)]"
                >
                  {t("ai.btn_next")}
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold transition",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.35)]",
                    saved
                      ? "bg-green-500 text-white"
                      : "bg-[rgb(var(--accent))] text-white hover:opacity-90 shadow-[0_4px_16px_rgb(var(--accent)/0.28)]"
                  )}
                >
                  {saved ? <CheckCircle2 className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                  {saved ? t("ai.btn_saved") : t("ai.btn_saveAll")}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ========================= COMPONENTS ========================= */

function Field({ label, hint, children }: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-base font-bold leading-tight">{label}</p>
        {hint && <p className="text-xs text-[rgb(var(--text-2))] mt-0.5 leading-snug line-clamp-2">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function LineList({ value, onChange, placeholder, numbered, bulletColor }: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  numbered?: boolean
  bulletColor?: "green" | "red" | "orange"
}) {
  // FIX 3: useTranslation dentro do componente
  const { t } = useTranslation()
  const [draft, setDraft] = useState("")

  function add() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
    setDraft("")
  }

  const bullet = bulletColor === "green"  ? "text-green-600 dark:text-green-400"  :
                 bulletColor === "red"    ? "text-red-600 dark:text-red-400"      :
                 bulletColor === "orange" ? "text-orange-600 dark:text-orange-400":
                 "text-[rgb(var(--accent))]"

  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] overflow-hidden w-full">
      {value.length === 0 ? (
        <p className="px-5 py-5 text-base text-center text-[rgb(var(--text-3))]">
          {t("ai.noItems")}
        </p>
      ) : (
        <ul className="divide-y divide-[rgb(var(--border))]">
          {value.map((item, i) => (
            <li key={i} className="flex items-start gap-4 px-5 py-4 bg-[rgb(var(--bg-surface-1))] hover:bg-[rgb(var(--bg-surface-2)/0.5)] transition group">
              <span className={cx("text-sm font-bold shrink-0 mt-0.5 w-6 text-right", bullet)}>
                {numbered ? `${i + 1}.` : "•"}
              </span>
              <p className="text-sm flex-1 min-w-0 leading-relaxed break-words overflow-hidden">{item}</p>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="shrink-0 text-[rgb(var(--text-3))] hover:text-red-500 opacity-0 group-hover:opacity-100 md:opacity-100 transition p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label={`Remover: ${item}`}
              >
                <X className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex border-t border-[rgb(var(--border))]">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add() } }}
          placeholder={placeholder ?? t("ai.s_cacc14a4")}
          className="flex-1 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base bg-[rgb(var(--bg-surface-2)/0.4)] outline-none placeholder:text-[rgb(var(--text-3))] text-[rgb(var(--text-1))]"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-semibold text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent)/0.07)] border-l border-[rgb(var(--border))] transition flex items-center gap-2 shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">{t("ai.s_fadcf2d5")}</span>
        </button>
      </div>
    </div>
  )
}

function CollectAdd({ onAdd }: { onAdd: (l: string) => void }) {
  // FIX 3: useTranslation dentro do componente
  const { t } = useTranslation()
  const [val, setVal] = useState("")

  function add() {
    const trimmed = val.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setVal("")
  }

  return (
    <div className="flex gap-3">
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && add()}
        placeholder={t("ai.s_c7783dee")}
        className={cx(inp, "flex-1")}
      />
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-base font-semibold bg-[rgb(var(--bg-surface-2))] border border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))] transition shrink-0"
      >
        <Plus className="h-5 w-5" />
        Adicionar
      </button>
    </div>
  )
}

/* ========================= STYLES ========================= */
const inp = cx(
  "w-full rounded-xl px-4 py-3 text-base border border-[rgb(var(--border))] box-border",
  "bg-[rgb(var(--bg-surface-2)/0.5)]",
  "text-[rgb(var(--text-1))] placeholder:text-[rgb(var(--text-3))]",
  "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.22)] focus:border-[rgb(var(--accent)/0.40)] transition"
)
const ta = cx(inp, "resize-none leading-relaxed overflow-x-hidden whitespace-pre-wrap break-words")

function saveBtnCls(saved: boolean) {
  return cx(
    "inline-flex items-center gap-2 rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-semibold transition",
    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.35)]",
    saved
      ? "bg-green-500 text-white"
      : "bg-[rgb(var(--accent))] text-white hover:opacity-90 shadow-[0_4px_16px_rgb(var(--accent)/0.28)]"
  )
}

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ")
}
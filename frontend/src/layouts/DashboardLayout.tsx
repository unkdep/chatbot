// src/layouts/DashboardLayout.tsx

import React, { useMemo, useState, type MouseEvent } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import {
  Home,
  LayoutDashboard,
  Headphones,
  FileText,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  Zap,
  Check,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import Dashboard from "../pages/dashboard/Dashboard"
import Inicio from "../pages/dashboard/Inicio"
import Conversations from "../pages/dashboard/Conversations"
import Reports from "../pages/dashboard/Reports"
import SettingsAI from "../pages/dashboard/SettingsAI"

import ProfileDropdown from "../components/profile/ProfileDropdown"
import { DashboardNavProvider, type Screen } from "./DashboardNavContext"

type Lang = "pt" | "en" | "es"

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const [sidebarHover, setSidebarHover] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [screen, setScreen] = useState<Screen>("inicio")

  // idioma (desktop + mobile)
  const [langOpen, setLangOpen] = useState(false)

  const currentLang = useMemo(() => {
    const raw = (i18n.resolvedLanguage || i18n.language || "pt").slice(0, 2)
    if (raw === "en" || raw === "es" || raw === "pt") return raw
    return "pt"
  }, [i18n.language, i18n.resolvedLanguage]) as Lang

  const LANGS: { id: Lang; label: string }[] = [
    { id: "pt", label: t("common.language.pt") },
    { id: "en", label: t("common.language.en") },
    { id: "es", label: t("common.language.es") },
  ]

  function toggleTheme() {
    document.documentElement.classList.toggle("dark")
  }

  function closeAll() {
    setMobileMenu(false)
    setProfileOpen(false)
    setLangOpen(false)
  }

  // ✅ clique garantido (mesmo se o idioma não mudar por falta de traduções)
  function setLanguage(lang: Lang) {
    try {
      i18n.changeLanguage(lang)
      localStorage.setItem("lumi.lang", lang)
    } catch {
      // se der algum erro, ainda fecha o menu (pra parecer "clicou")
    } finally {
      setLangOpen(false)
    }
  }

  return (
    <DashboardNavProvider value={{ screen, setScreen }}>
      <div className="flex h-[100dvh] overflow-hidden max-w-[100vw] bg-[rgb(var(--bg-base))] text-[rgb(var(--text-1))]">
        {/* Overlay + menu de idioma DESKTOP — fora do header para z-index correto */}
        {langOpen && (
          <div className="hidden md:block">
            <div
              className="fixed inset-0 z-[400] bg-transparent"
              onClick={() => setLangOpen(false)}
            />
            <div className="fixed top-[72px] right-6 w-[320px] z-[401]">
              <LanguageMenu t={t} langs={LANGS} current={currentLang} onPick={setLanguage} />
            </div>
          </div>
        )}

        {/* MOBILE MENU */}
        {mobileMenu && (
          <div className="fixed inset-0 z-[200] md:hidden">
            <div onClick={closeAll} className="absolute inset-0 z-[201] bg-black/40 backdrop-blur-sm" />

            <aside
              onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
              className={[
                "absolute left-0 top-0 z-[202] h-full w-72",
                "p-4 pt-5",
                "bg-[rgb(var(--bg-chrome-2)/0.94)] backdrop-blur-xl",
                "border-r border-[rgb(var(--border))]",
                "shadow-2xl",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => setMobileMenu(false)}
                className={[
                  "mb-4 inline-flex items-center justify-center",
                  "h-9 w-9 rounded-2xl",
                  "bg-[rgb(var(--bg-surface-2)/0.55)]",
                  "border border-[rgb(var(--border))]",
                  "backdrop-blur-xl",
                  "transition hover:scale-[1.03]",
                  "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
                ].join(" ")}
                aria-label={t("common.menu.close")}
              >
                <X className="h-5 w-5 text-[rgb(var(--text-1))]" />
              </button>

              <SidebarNav
                mobile
                setScreen={(s) => {
                  setScreen(s)
                  closeAll()
                }}
              />

              <div className="mt-6 pt-4 border-t border-[rgb(var(--border))] space-y-3">
                <LanguageButtonMobile
                  label={t("common.language.change")}
                  current={currentLang}
                  onClick={() => {
                    setProfileOpen(false)
                    setLangOpen(true)
                  }}
                />

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className={[
                    "w-full h-12 rounded-2xl",
                    "bg-[rgb(var(--bg-surface-2)/0.55)] backdrop-blur-xl",
                    "border border-[rgb(var(--border))]",
                    "transition hover:scale-[1.01]",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
                  ].join(" ")}
                  aria-label={t("common.logout")}
                >
                  <div className="h-full w-full flex items-center justify-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">{t("common.logout")}</span>
                  </div>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* SIDEBAR (desktop) */}
        <aside
          onMouseEnter={() => setSidebarHover(true)}
          onMouseLeave={() => setSidebarHover(false)}
          className={[
            "hidden md:flex fixed left-0 top-0 z-40 h-full flex-col",
            sidebarHover ? "w-72" : "w-24",
            "transition-all duration-500",
            "px-4 py-8",
            "bg-[rgb(var(--bg-chrome-1)/0.90)] backdrop-blur-2xl",
            "border-r border-[rgb(var(--border))]",
          ].join(" ")}
        >
          <SidebarNav open={sidebarHover} setScreen={setScreen} />
        </aside>

        {/* CONTENT WRAPPER */}
        <div
          className={[
            "flex-1 flex flex-col min-h-0 transition-all duration-500",
            sidebarHover ? "md:pl-72" : "md:pl-24",
          ].join(" ")}
        >
          {/* HEADER */}
          <header
            className={[
              "sticky top-0 z-[150] shrink-0",
              "flex items-center justify-between px-4 py-3 md:px-6 md:py-4",
              "bg-[rgb(var(--bg-chrome-1)/0.86)] backdrop-blur-2xl",
              "border-b border-[rgb(var(--border))]",
            ].join(" ")}
          >
            <button
              type="button"
              className={[
                "md:hidden inline-flex items-center justify-center",
                "h-10 w-10 rounded-2xl",
                "bg-[rgb(var(--bg-surface-2)/0.55)]",
                "border border-[rgb(var(--border))]",
                "backdrop-blur-xl",
                "transition hover:scale-[1.03]",
                "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
              ].join(" ")}
              onClick={() => setMobileMenu(true)}
              aria-label={t("common.menu.open")}
            >
              <Menu className="h-5 w-5 text-[rgb(var(--text-1))]" />
            </button>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex gap-2 ml-auto relative">
              {/* Idioma */}
              <div className="relative">
                <TopIcon
                  onClick={() => {
                    setProfileOpen(false)
                    setLangOpen((v) => !v)
                  }}
                  ariaLabel={t("common.language.change")}
                >
                  <Globe className="h-5 w-5 text-[rgb(var(--text-1))]" />
                </TopIcon>
              </div>

              <TopIcon onClick={toggleTheme} ariaLabel={t("common.theme.toggle")}>
                <Sun className="dark:hidden h-5 w-5 text-[rgb(var(--text-1))]" />
                <Moon className="hidden dark:block h-5 w-5 text-[rgb(var(--text-1))]" />
              </TopIcon>

              <div className="relative">
                <TopIcon
                  onClick={() => {
                    setLangOpen(false)
                    setProfileOpen((v) => !v)
                  }}
                  ariaLabel={t("common.profile.open")}
                >
                  <User className="h-5 w-5 text-[rgb(var(--text-1))]" />
                </TopIcon>
              </div>
            </div>
          </header>

          {/* MAIN */}
          <main
            className={[
              "flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[rgb(var(--bg-base))]",
              "p-0 md:p-10",
              "pb-[88px] md:pb-10",
              "[&>*]:max-w-full",
            ].join(" ")}
          >
            {screen === "inicio" && <Inicio />}
            {screen === "dashboard" && <Dashboard />}
            {screen === "conversations" && <Conversations />}
            {screen === "relatorios" && <Reports />}
            {screen === "programar-ia" && <SettingsAI />}
          </main>

          {/* MOBILE DOCK (sem Atendimentos) */}
          <div
            className={[
              "md:hidden fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[150]",
              "rounded-full px-5 py-2.5 flex gap-5",
              "bg-[rgb(var(--bg-chrome-1)/0.88)] backdrop-blur-2xl",
              "border border-[rgb(var(--border))]",
              "shadow-[0_22px_90px_rgb(0_0_0_/_.14)] dark:shadow-[0_30px_120px_rgb(0_0_0_/_.72)]",
            ].join(" ")}
            aria-label={t("common.shortcuts")}
          >
            <DockIcon onClick={() => setScreen("inicio")} ariaLabel={t("common.nav.goHome")}>
              <Home className="h-5 w-5 text-[rgb(var(--text-1))]" />
            </DockIcon>

            <DockIcon onClick={() => setScreen("dashboard")} ariaLabel={t("common.nav.goDashboard")}>
              <LayoutDashboard className="h-5 w-5 text-[rgb(var(--text-1))]" />
            </DockIcon>

            {/* Perfil */}
            <DockIconWithDot
              onClick={() => {
                setLangOpen(false)
                setProfileOpen((v) => !v)
              }}
              ariaLabel={t("common.settings.open")}
            >
              <User className="h-5 w-5 text-[rgb(var(--text-1))]" />
            </DockIconWithDot>

            {/* Idioma */}
            <DockIcon
              onClick={() => {
                setProfileOpen(false)
                setLangOpen((v) => !v)
              }}
              ariaLabel={t("common.language.change")}
            >
              <Globe className="h-5 w-5 text-[rgb(var(--text-1))]" />
            </DockIcon>

            {/* Tema */}
            <DockIcon onClick={toggleTheme} ariaLabel={t("common.theme.toggle")}>
              <Sun className="dark:hidden h-5 w-5 text-[rgb(var(--text-1))]" />
              <Moon className="hidden dark:block h-5 w-5 text-[rgb(var(--text-1))]" />
            </DockIcon>
          </div>
        </div>

        {/* MENU DE IDIOMA MOBILE — renderizado fora do dock */}
        {langOpen && (
          <div className="md:hidden fixed inset-0 z-[400]">
            <div className="absolute inset-0 bg-transparent" onClick={() => setLangOpen(false)} />
            <div className="absolute bottom-[calc(88px+env(safe-area-inset-bottom)+0.75rem)] left-1/2 -translate-x-1/2 w-[92vw] max-w-[420px] z-[401] pointer-events-auto">
              <LanguageMenu t={t} langs={LANGS} current={currentLang} onPick={setLanguage} />
            </div>
          </div>
        )}

        {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} onLogout={() => navigate("/")} />}
      </div>
    </DashboardNavProvider>
  )
}

/* ---------------- Language UI ---------------- */

function LanguageMenu({
  t,
  langs,
  current,
  onPick,
}: {
  t: (s: string) => string
  langs: { id: Lang; label: string }[]
  current: Lang
  onPick: (l: Lang) => void
}) {
  return (
    <div
      className={[
        // ✅ garante clique (não deixa overlay/stack engolir)
        "relative pointer-events-auto",
        "w-full",
        "rounded-3xl",
        "bg-[rgb(var(--bg-surface-1)/0.92)] backdrop-blur-2xl",
        "border border-[rgb(var(--border))]",
        "shadow-[0_30px_120px_rgb(0_0_0_/_.18)] dark:shadow-[0_30px_120px_rgb(0_0_0_/_.60)]",
        "p-2",
      ].join(" ")}
      role="menu"
      aria-label={t("common.language.change")}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 pt-2 pb-2">
        <p className="text-sm font-semibold">{t("common.language.change")}</p>
        <p className="text-xs text-[rgb(var(--text-3))]">{t("common.language.choose")}</p>
      </div>

      <div className="space-y-1">
        {langs.map((l) => {
          const active = l.id === current
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onPick(l.id)}
              className={[
                "w-full flex items-center justify-between gap-3",
                "px-3 py-3 rounded-2xl text-left transition border",
                "cursor-pointer",
                active
                  ? "bg-[rgb(var(--bg-surface-2)/0.85)] border-[rgb(var(--accent)/0.22)]"
                  : "bg-[rgb(var(--bg-surface-2)/0.55)] border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-surface-2)/0.75)]",
                "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.16)]",
              ].join(" ")}
              role="menuitem"
              aria-label={l.label}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[rgb(var(--bg-surface-3)/0.70)] border border-[rgb(var(--border))]">
                  <Globe size={18} />
                </span>
                <div className="min-w-0">
                  <p className="font-medium leading-tight">{l.label}</p>
                  <p className="text-xs text-[rgb(var(--text-3))] uppercase tracking-wide">{l.id}</p>
                </div>
              </div>

              {active ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[rgb(var(--text-2))]">
                  <Check size={16} /> {t("common.active")}
                </span>
              ) : (
                <span className="text-xs text-[rgb(var(--text-3))]">{t("common.select")}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LanguageButtonMobile({
  label,
  current,
  onClick,
}: {
  label: string
  current: Lang
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full h-12 rounded-2xl",
        "bg-[rgb(var(--bg-surface-2)/0.55)] backdrop-blur-xl",
        "border border-[rgb(var(--border))]",
        "transition hover:scale-[1.01]",
        "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
      ].join(" ")}
      aria-label={label}
    >
      <div className="h-full w-full flex items-center justify-center gap-2">
        <Globe className="h-4 w-4" />
        <span className="font-medium">{label}</span>
        <span className="text-xs text-[rgb(var(--text-3))] uppercase tracking-wide">{current}</span>
      </div>
    </button>
  )
}

/* ---------------- SIDEBAR ---------------- */

function SidebarNav({
  open,
  mobile,
  setScreen,
}: {
  open?: boolean
  mobile?: boolean
  setScreen: (s: Screen) => void
}) {
  const { t } = useTranslation()

  return (
    <nav
      className={[
        "flex flex-col",
        "gap-4",
        mobile ? "mt-6 items-center" : "mt-10",
      ].join(" ")}
      aria-label={t("sidebar.aria")}
    >
      <NavItem icon={<Home className="h-5 w-5" />} text={t("sidebar.home")} open={mobile || open} onClick={() => setScreen("inicio")} />
      <NavItem icon={<LayoutDashboard className="h-5 w-5" />} text={t("sidebar.dashboard")} open={mobile || open} onClick={() => setScreen("dashboard")} />
      <NavItem icon={<Headphones className="h-5 w-5" />} text={t("sidebar.conversations")} open={mobile || open} onClick={() => setScreen("conversations")} />
      <NavItem icon={<FileText className="h-5 w-5" />} text={t("sidebar.reports")} open={mobile || open} onClick={() => setScreen("relatorios")} />
      <NavItem icon={<Zap className="h-5 w-5" />} text={t("sidebar.programAI")} open={mobile || open} onClick={() => setScreen("programar-ia")} />
    </nav>
  )
}

/* ---------------- UI ---------------- */

function NavItem({
  icon,
  text,
  open,
  onClick,
}: {
  icon: ReactNode
  text: string
  open?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl",
        "h-12",
        "bg-[rgb(var(--bg-surface-2)/0.62)] backdrop-blur-xl",
        "border border-[rgb(var(--border))]",
        "transition hover:scale-[1.02] hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
      ].join(" ")}
      aria-label={text}
    >
      <div className={`h-full w-full flex items-center ${open ? "justify-start gap-3 px-3.5" : "justify-center"}`}>
        <span className="text-[rgb(var(--text-1))]">{icon}</span>
        {open && <span className="font-medium text-[rgb(var(--text-1))] leading-none">{text}</span>}
      </div>
    </button>
  )
}

function TopIcon({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "p-2.5 rounded-2xl",
        "bg-[rgb(var(--bg-surface-2)/0.60)] backdrop-blur-xl",
        "border border-[rgb(var(--border))]",
        "hover:scale-[1.04] transition hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function DockIcon({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "p-2.5 rounded-full",
        "bg-[rgb(var(--bg-surface-2)/0.55)] backdrop-blur-xl",
        "border border-[rgb(var(--border))]",
        "hover:scale-[1.06] transition hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function DockIconWithDot({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "relative p-2.5 rounded-full",
        "bg-[rgb(var(--bg-surface-2)/0.55)] backdrop-blur-xl",
        "border border-[rgb(var(--border))]",
        "hover:scale-[1.06] transition hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.18)]",
      ].join(" ")}
    >
      {children}
      <span
        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full
        bg-[rgb(var(--accent))] shadow-[0_0_0_3px_rgb(var(--bg-surface-1)/0.85)]"
      />
    </button>
  )
}
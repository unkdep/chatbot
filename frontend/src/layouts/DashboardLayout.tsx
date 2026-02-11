"use client"

import { useState, type MouseEvent } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import {
  Home,
  LayoutDashboard,
  Headphones,
  FileText,
  Phone,
  Zap,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  User,
} from "lucide-react"

import Dashboard from "../pages/dashboard/Dashboard"
import Inicio from "../pages/dashboard/Inicio"
import Conversations from "../pages/dashboard/Conversations"
import ProfileDropdown from "../components/profile/ProfileDropdown"

/* 🔹 ADICIONADO conversations */
type Screen = "inicio" | "dashboard" | "conversations" | "meus-dados"

export default function DashboardLayout() {
  const navigate = useNavigate()

  const [sidebarHover, setSidebarHover] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [screen, setScreen] = useState<Screen>("inicio")
  const [lang, setLang] = useState("pt")

  function toggleTheme() {
    document.documentElement.classList.toggle("dark")
  }

  function closeAll() {
    setMobileMenu(false)
    setProfileOpen(false)
  }

  return (
    <div
      className="flex h-screen overflow-hidden
      bg-gradient-to-br from-white via-gray-100 to-blue-100
      dark:from-black dark:via-zinc-900 dark:to-blue-950
      text-black dark:text-white"
    >
      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div
            onClick={closeAll}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[201]"
          />
          <aside
            onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
            className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-zinc-900 shadow-2xl p-6 z-[202]"
          >
            <button onClick={() => setMobileMenu(false)} className="mb-6">
              <X />
            </button>

            <SidebarNav
              mobile
              setScreen={(s) => {
                setScreen(s)
                closeAll()
              }}
            />
          </aside>
        </div>
      )}

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
        className={`hidden md:flex flex-col fixed left-0 top-0 h-full z-40
        ${sidebarHover ? "w-72" : "w-24"}
        transition-all duration-500 p-6 pt-10
        bg-white dark:bg-zinc-900
        border-r border-black/10 dark:border-white/10`}
      >
        <SidebarNav open={sidebarHover} setScreen={setScreen} />
      </aside>

      <div
        className={`flex-1 flex flex-col transition-all duration-500
        ${sidebarHover ? "md:pl-72" : "md:pl-24"}`}
      >
        {/* HEADER */}
        <header
          className="relative flex justify-between items-center p-6
          bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl
          border-b border-black/10 dark:border-white/10
          sticky top-0 z-[150]"
        >
          <button className="md:hidden" onClick={() => setMobileMenu(true)}>
            <Menu />
          </button>

          <div className="hidden md:flex gap-3 ml-auto relative">
            <TopIcon onClick={() => setLang(lang === "pt" ? "en" : "pt")}>
              <Globe />
            </TopIcon>

            <TopIcon onClick={toggleTheme}>
              <Sun className="dark:hidden" />
              <Moon className="hidden dark:block" />
            </TopIcon>

            <div className="relative">
              <TopIcon onClick={() => setProfileOpen((v) => !v)}>
                <User />
              </TopIcon>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-auto p-6 md:p-10 pb-36">
          {screen === "inicio" && <Inicio />}
          {screen === "dashboard" && <Dashboard />}
          {screen === "conversations" && <Conversations />}

          {screen === "meus-dados" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-2xl font-semibold">Meu Perfil</h1>
              <div
                className="p-6 rounded-3xl
                bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl
                shadow-xl space-y-4
                border border-black/10 dark:border-white/10"
              >
                <p>Nome: Rafael</p>
                <p>Sobrenome: Silva</p>
                <p>Email: rafael@email.com</p>
              </div>
            </div>
          )}
        </main>

        {/* MOBILE DOCK */}
        <div
          className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2
          bg-white/80 dark:bg-zinc-900/85 backdrop-blur-2xl
          border border-black/10 dark:border-white/20
          rounded-full px-6 py-3 flex gap-6 shadow-2xl z-[150]"
        >
          <DockIcon onClick={() => setScreen("inicio")}>
            <Home />
          </DockIcon>

          <DockIcon onClick={() => setScreen("dashboard")}>
            <LayoutDashboard />
          </DockIcon>

          <DockIcon onClick={() => setScreen("conversations")}>
            <Headphones />
          </DockIcon>

          <DockIcon onClick={toggleTheme}>
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />
          </DockIcon>
        </div>
      </div>

      {profileOpen && (
        <ProfileDropdown
          onClose={() => setProfileOpen(false)}
          onLogout={() => navigate("/")}
        />
      )}
    </div>
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
  return (
    <nav className={`flex flex-col gap-4 mt-8 ${mobile ? "items-center" : ""}`}>
      <NavItem icon={<Home />} text="Inicio" open={mobile || open} onClick={() => setScreen("inicio")} />
      <NavItem icon={<LayoutDashboard />} text="Dashboard" open={mobile || open} onClick={() => setScreen("dashboard")} />

      {/* ✅ AGORA FUNCIONA */}
      <NavItem
        icon={<Headphones />}
        text="Atendimentos"
        open={mobile || open}
        onClick={() => setScreen("conversations")}
      />

      <NavItem icon={<FileText />} text="Relatórios" open={mobile || open} />
      <NavItem icon={<Phone />} text="Contato" open={mobile || open} />
      <NavItem icon={<Zap />} text="Programar IA" open={mobile || open} />
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
      onClick={onClick}
      className="
        w-full h-14 rounded-2xl
        border border-black/5 dark:border-white/10
        bg-white/60 dark:bg-zinc-800/70 backdrop-blur-xl
        transition hover:scale-[1.02]"
    >
      <div className={`h-full w-full flex items-center ${open ? "justify-start gap-4 px-4" : "justify-center"}`}>
        {icon}
        {open && <span className="font-medium">{text}</span>}
      </div>
    </button>
  )
}

function TopIcon({ children, onClick }: { children: ReactNode; onClick: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-2xl
      bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl
      border border-black/10 dark:border-white/10
      hover:scale-110 transition"
    >
      {children}
    </button>
  )
}

function DockIcon({ children, onClick }: { children: ReactNode; onClick: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-full
      bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl
      border border-black/10 dark:border-white/10
      hover:scale-110 transition"
    >
      {children}
    </button>
  )
}

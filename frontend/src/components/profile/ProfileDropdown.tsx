"use client"

import { useMemo, useState } from "react"
import {
  LogOut,
  Settings,
  User,
  X,
  ChevronLeft,
  Mail,
  Lock,
  IdCard,
} from "lucide-react"

type Props = {
  onClose: () => void
  onLogout: () => void
}

type View = "menu" | "profile" | "settings"

export default function ProfileDropdown({ onClose, onLogout }: Props) {
  const [view, setView] = useState<View>("menu")

  const user = useMemo(
    () => ({
      name: "Rafael",
      lastName: "Silva",
      email: "rafael@email.com",
    }),
    []
  )

  const [form, setForm] = useState({
    email: user.email,
    newPassword: "",
  })

  function save(e: React.FormEvent) {
    e.preventDefault()
    alert("Alterações salvas (mock). Conecte na API depois.")
    setForm((p) => ({ ...p, newPassword: "" }))
    setView("profile")
  }

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} className="fixed inset-0 z-[500] bg-black/40" />

      {/* Painel:
          - Mobile: bottom sheet (bottom-0, central)
          - Desktop: FIXED no canto superior direito (top/right) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          fixed z-[600]
          left-1/2 md:left-auto
          right-auto md:right-6
          bottom-0 md:bottom-auto
          top-auto md:top-24
          -translate-x-1/2 md:translate-x-0
          w-full md:w-[420px]
          max-w-[720px] md:max-w-none
          rounded-t-3xl md:rounded-3xl
          p-5 md:p-6
          bg-white dark:bg-zinc-950
          text-black dark:text-white
          border border-black/10 dark:border-white/25
          shadow-2xl
        "
      >
        {/* Topbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {view !== "menu" && (
              <button
                onClick={() => setView("menu")}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
                aria-label="Voltar"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <p className="font-semibold text-lg">
              {view === "menu" && "Conta"}
              {view === "profile" && "Meu Perfil"}
              {view === "settings" && "Configurações"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* User header */}
        <div
          className="
            flex items-center gap-4
            p-4 rounded-2xl
            bg-gray-50 dark:bg-zinc-900
            border border-black/10 dark:border-white/20
          "
        >
          <div
            className="
              w-12 h-12 rounded-full
              flex items-center justify-center
              bg-white dark:bg-zinc-950
              border border-black/10 dark:border-white/25
            "
          >
            <User size={20} />
          </div>

          <div className="min-w-0">
            <p className="font-semibold leading-tight truncate">
              {user.name} {user.lastName}
            </p>
            <p className="text-sm opacity-70 truncate">{user.email}</p>
          </div>
        </div>

        <div className="mt-4">
          {view === "menu" && (
            <div className="space-y-3">
              <ActionButton icon={<IdCard size={18} />} onClick={() => setView("profile")}>
                Perfil
              </ActionButton>

              <ActionButton icon={<Settings size={18} />} onClick={() => setView("settings")}>
                Configurações
              </ActionButton>

              <ActionButton
                icon={<LogOut size={18} />}
                variant="danger"
                onClick={() => {
                  onClose()
                  onLogout()
                }}
              >
                Sair
              </ActionButton>
            </div>
          )}

          {view === "profile" && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <InfoRow label="Nome" value={user.name} />
                <InfoRow label="Sobrenome" value={user.lastName} />
                <InfoRow label="Email" value={user.email} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <PrimaryButton onClick={() => setView("settings")} icon={<Settings size={18} />}>
                  Alterar dados
                </PrimaryButton>

                <SecondaryDangerButton
                  onClick={() => {
                    onClose()
                    onLogout()
                  }}
                  icon={<LogOut size={18} />}
                >
                  Sair
                </SecondaryDangerButton>
              </div>
            </div>
          )}

          {view === "settings" && (
            <form onSubmit={save} className="space-y-4">
              <div
                className="
                  p-4 rounded-2xl
                  bg-gray-50 dark:bg-zinc-900
                  border border-black/10 dark:border-white/20
                  space-y-3
                "
              >
                <Label icon={<Mail size={16} />}>Novo email</Label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="input"
                  placeholder="ex: novo@email.com"
                />

                <div className="h-px bg-black/10 dark:bg-white/15 my-2" />

                <Label icon={<Lock size={16} />}>Nova senha</Label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="input"
                  placeholder="••••••••"
                />

                <p className="text-xs opacity-70">
                  Dica: use pelo menos 8 caracteres.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <PrimaryButton type="submit" icon={<Settings size={18} />}>
                  Salvar
                </PrimaryButton>

                <SecondaryButton
                  type="button"
                  onClick={() => setView("profile")}
                  icon={<IdCard size={18} />}
                >
                  Voltar ao Perfil
                </SecondaryButton>
              </div>

              <p className="text-xs opacity-60">
                * Mockado (sem backend). Depois conecte na sua API.
              </p>

              <style>{`
                .input{
                  width:100%;
                  padding:12px 14px;
                  border-radius:14px;
                  background:#ffffff;
                  border:1px solid rgba(0,0,0,.12);
                  outline:none;
                }
                .input:focus{
                  border-color:rgba(0,0,0,.28);
                }
                .dark .input{
                  background:#0a0a0a;
                  border:1px solid rgba(255,255,255,.22);
                  color:white;
                }
                .dark .input:focus{
                  border-color:rgba(255,255,255,.38);
                }
              `}</style>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

function ActionButton({
  children,
  icon,
  onClick,
  variant,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  onClick: () => void
  variant?: "danger"
}) {
  const base =
    "w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition border text-left"
  const normal =
    "bg-white dark:bg-zinc-950 border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
  const danger =
    "bg-white dark:bg-zinc-950 border-red-500/25 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/10"

  return (
    <button onClick={onClick} className={`${base} ${variant === "danger" ? danger : normal}`}>
      <span
        className="
          w-10 h-10 rounded-xl flex items-center justify-center
          bg-gray-50 dark:bg-zinc-900
          border border-black/10 dark:border-white/20
        "
      >
        {icon}
      </span>
      <span className="font-medium">{children}</span>
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="
        flex items-center justify-between gap-4
        p-4 rounded-2xl
        bg-gray-50 dark:bg-zinc-900
        border border-black/10 dark:border-white/20
      "
    >
      <span className="text-sm opacity-70">{label}</span>
      <span className="font-semibold break-words text-right">{value}</span>
    </div>
  )
}

function Label({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <label className="text-sm font-medium flex items-center gap-2 opacity-80">
      {icon} {children}
    </label>
  )
}

function PrimaryButton({
  children,
  icon,
  onClick,
  type,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      className="
        flex-1 flex items-center justify-center gap-2
        px-4 py-4 rounded-2xl
        bg-black text-white
        dark:bg-white dark:text-black
        hover:scale-[1.01] transition
      "
    >
      {icon} {children}
    </button>
  )
}

function SecondaryButton({
  children,
  icon,
  onClick,
  type,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      className="
        flex-1 flex items-center justify-center gap-2
        px-4 py-4 rounded-2xl
        bg-white dark:bg-zinc-950
        border border-black/10 dark:border-white/20
        hover:bg-black/5 dark:hover:bg-white/10
        hover:scale-[1.01] transition
      "
    >
      {icon} {children}
    </button>
  )
}

function SecondaryDangerButton({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="
        flex-1 flex items-center justify-center gap-2
        px-4 py-4 rounded-2xl
        bg-white dark:bg-zinc-950
        border border-red-500/25
        text-red-600 dark:text-red-400
        hover:bg-red-50 dark:hover:bg-white/10
        hover:scale-[1.01] transition
      "
    >
      {icon} {children}
    </button>
  )
}

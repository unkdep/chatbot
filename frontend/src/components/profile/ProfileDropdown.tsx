import React, { useMemo, useState } from "react"
import { LogOut, User, X, ChevronLeft, IdCard } from "lucide-react"
import { useTranslation } from "react-i18next"

type Props = {
  onClose: () => void
  onLogout: () => void
}

type View = "menu" | "profile"

export default function ProfileDropdown({ onClose, onLogout }: Props) {
  const { t } = useTranslation()
  const [view, setView] = useState<View>("menu")

  const user = useMemo(
    () => ({
      name: "Rafael",
      lastName: "Silva",
      email: "rafael@email.com",
    }),
    []
  )

  const title = view === "menu" ? t("profile.account") : t("profile.myProfile")

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-[2px]" />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={[
          "fixed z-[600]",
          "left-1/2 md:left-auto",
          "right-auto md:right-6",
          "bottom-0 md:bottom-auto",
          "top-auto md:top-24",
          "-translate-x-1/2 md:translate-x-0",
          "w-full md:w-[420px]",
          "max-w-[720px] md:max-w-none",
          "rounded-t-3xl md:rounded-3xl",
          "p-5 md:p-6",
          // ✅ tokens do tema (igual app todo)
          "bg-[rgb(var(--bg-surface-1)/0.92)] backdrop-blur-2xl",
          "text-[rgb(var(--text-1))]",
          "border border-[rgb(var(--border))]",
          "shadow-[0_30px_120px_rgb(0_0_0_/_.18)] dark:shadow-[0_30px_120px_rgb(0_0_0_/_.60)]",
        ].join(" ")}
      >
        {/* Topbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {view !== "menu" && (
              <button
                type="button"
                onClick={() => setView("menu")}
                className={[
                  "p-2 rounded-xl transition",
                  "bg-[rgb(var(--bg-surface-2)/0.55)]",
                  "border border-[rgb(var(--border))]",
                  "hover:bg-[rgb(var(--bg-surface-2)/0.75)]",
                  "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.16)]",
                ].join(" ")}
                aria-label={t("common.back")}
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <p className="font-semibold text-lg">{title}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={[
              "p-2 rounded-xl transition",
              "bg-[rgb(var(--bg-surface-2)/0.55)]",
              "border border-[rgb(var(--border))]",
              "hover:bg-[rgb(var(--bg-surface-2)/0.75)]",
              "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus)/0.16)]",
            ].join(" ")}
            aria-label={t("common.close")}
          >
            <X size={18} />
          </button>
        </div>

        {/* User header */}
        <div
          className={[
            "flex items-center gap-4",
            "p-4 rounded-2xl",
            "bg-[rgb(var(--bg-surface-2)/0.70)] backdrop-blur-xl",
            "border border-[rgb(var(--border))]",
          ].join(" ")}
        >
          <div
            className={[
              "w-12 h-12 rounded-full",
              "flex items-center justify-center",
              "bg-[rgb(var(--bg-surface-3)/0.70)]",
              "border border-[rgb(var(--border))]",
              // halo super sutil com o azul do tema
              "shadow-[0_0_0_6px_rgb(var(--accent)/0.08)]",
            ].join(" ")}
          >
            <User size={20} />
          </div>

          <div className="min-w-0">
            <p className="font-semibold leading-tight truncate">
              {user.name} {user.lastName}
            </p>
            <p className="text-sm text-[rgb(var(--text-2))] truncate">{user.email}</p>
          </div>
        </div>

        <div className="mt-4">
          {view === "menu" && (
            <div className="space-y-3">
              <ActionButton icon={<IdCard size={18} />} onClick={() => setView("profile")}>
                {t("profile.title")}
              </ActionButton>

              {/* ✅ só sair */}
              <ActionButton
                icon={<LogOut size={18} />}
                variant="danger"
                onClick={() => {
                  onClose()
                  onLogout()
                }}
              >
                {t("common.logout")}
              </ActionButton>
            </div>
          )}

          {view === "profile" && (
            <div className="space-y-3">
              <InfoRow label={t("profile.firstName")} value={user.name} />
              <InfoRow label={t("profile.lastName")} value={user.lastName} />
              <InfoRow label={t("profile.email")} value={user.email} />

              <div className="pt-2">
                <DangerButton
                  onClick={() => {
                    onClose()
                    onLogout()
                  }}
                  icon={<LogOut size={18} />}
                >
                  {t("common.logout")}
                </DangerButton>
              </div>
            </div>
          )}
        </div>

        {/* Footer sutil */}
        <div className="mt-5 pt-4 border-t border-[rgb(var(--border))]">
          <p className="text-xs text-[rgb(var(--text-3))]">{t("profile.pageTitle")}</p>
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
    "w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition border text-left focus:outline-none focus:ring-2"

  const normal = [
    "bg-[rgb(var(--bg-surface-2)/0.65)] backdrop-blur-xl",
    "border-[rgb(var(--border))]",
    "hover:bg-[rgb(var(--bg-surface-2)/0.85)]",
    "focus:ring-[rgb(var(--focus)/0.16)]",
  ].join(" ")

  const danger = [
    "bg-[rgb(var(--bg-surface-2)/0.65)] backdrop-blur-xl",
    "border-[rgb(var(--accent)/0.20)]",
    "text-red-600 dark:text-red-400",
    "hover:bg-[rgb(var(--bg-surface-2)/0.85)]",
    "focus:ring-[rgb(var(--accent)/0.16)]",
  ].join(" ")

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${variant === "danger" ? danger : normal}`}
    >
      <span
        className={[
          "w-10 h-10 rounded-xl flex items-center justify-center",
          "bg-[rgb(var(--bg-surface-3)/0.70)]",
          "border border-[rgb(var(--border))]",
        ].join(" ")}
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
      className={[
        "flex items-center justify-between gap-4",
        "p-4 rounded-2xl",
        "bg-[rgb(var(--bg-surface-2)/0.65)] backdrop-blur-xl",
        "border border-[rgb(var(--border))]",
      ].join(" ")}
    >
      <span className="text-sm text-[rgb(var(--text-2))]">{label}</span>
      <span className="font-semibold break-words text-right text-[rgb(var(--text-1))]">{value}</span>
    </div>
  )
}

function DangerButton({
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
      type="button"
      onClick={onClick}
      className={[
        "w-full flex items-center justify-center gap-2",
        "px-4 py-4 rounded-2xl border transition",
        "bg-[rgb(var(--bg-surface-2)/0.65)] backdrop-blur-xl",
        "border-[rgb(var(--accent)/0.20)]",
        "text-red-600 dark:text-red-400",
        "hover:bg-[rgb(var(--bg-surface-2)/0.85)]",
        "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.16)]",
      ].join(" ")}
    >
      {icon} <span className="font-medium">{children}</span>
    </button>
  )
}
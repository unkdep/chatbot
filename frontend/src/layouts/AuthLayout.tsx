"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Moon, Sun } from "lucide-react"
import { useTranslation } from "react-i18next"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()

  const [dark, setDark] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="min-h-screen w-screen relative overflow-hidden bg-[rgb(var(--bg-base))] text-[rgb(var(--text-1))]">
      {/* ── THEME TOGGLE ── */}
      <button
        onClick={() => setDark((d) => !d)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={t("common.theme.toggle")}
        className="absolute top-5 right-5 z-50 outline-none"
        type="button"
      >
        {/* track */}
        <div
          className="relative flex items-center rounded-full transition-all duration-300"
          style={{
            width: 56,
            height: 28,
            padding: 3,
            background: dark ? "#1c1c1c" : "#ffffff",
            boxShadow: dark
              ? hovered
                ? "0 0 0 1.5px rgba(255,255,255,0.25), 0 8px 30px rgba(0,0,0,0.55)"
                : "0 8px 30px rgba(0,0,0,0.55)"
              : hovered
                ? "0 0 0 1.5px rgba(0,0,0,0.12), 0 10px 30px rgba(0,0,0,0.12)"
                : "0 10px 30px rgba(0,0,0,0.12)",
          }}
        >
          {/* knob */}
          <div
            className="absolute rounded-full transition-all duration-300 flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              left: dark ? 31 : 3,
              top: 3,
              background: dark ? "#0c0f14" : "#f5f7ff",
              boxShadow: dark ? "0 4px 10px rgba(0,0,0,0.55)" : "0 4px 10px rgba(0,0,0,0.18)",
            }}
          >
            {dark ? <Moon size={14} /> : <Sun size={14} />}
          </div>
        </div>
      </button>

      {/* content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

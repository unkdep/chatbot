import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Moon, Sun } from "lucide-react"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  return (
    <div className="min-h-screen w-screen bg-white dark:bg-black relative overflow-hidden">

      {/* THEME TOGGLE */}
      <button
        onClick={() => setDark(!dark)}
        className="
          absolute top-6 right-6 z-50
          flex items-center gap-2
          px-3 py-2 rounded-full
          bg-white/70 dark:bg-black/70
          backdrop-blur-md
          border border-gray-300 dark:border-white/30
          shadow-md
          transition-all
        "
      >
        <div
          className={`
            w-9 h-5 flex items-center rounded-full
            ${dark ? "bg-white/20" : "bg-black/20"}
            px-1 transition-all
          `}
        >
          <div
            className={`
              w-4 h-4 rounded-full
              bg-white dark:bg-black
              transform transition-all
              ${dark ? "translate-x-4" : "translate-x-0"}
            `}
          />
        </div>

        {dark ? (
          <Moon size={16} className="text-white" />
        ) : (
          <Sun size={16} className="text-black" />
        )}
      </button>

      {/* CONTENT */}
      {children}
    </div>
  )
}

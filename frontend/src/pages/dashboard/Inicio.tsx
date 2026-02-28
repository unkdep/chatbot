// src/pages/dashboard/Inicio.tsx
"use client"

import { useTranslation } from "react-i18next"
import orb from "../../assets/orb.gif"

export default function Inicio() {
  const { t } = useTranslation()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-10">
      <h1
        className="
          text-4xl md:text-6xl font-bold
          bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600
          bg-clip-text text-transparent
          drop-shadow-[0_10px_40px_rgba(34,211,238,.12)]
        "
      >
        {t("dashboard.welcomeTitle")}
      </h1>

      <img
        src={orb}
        alt={t("dashboard.orbAlt")}
        className="w-64 md:w-72 select-none pointer-events-none"
      />
    </div>
  )
}

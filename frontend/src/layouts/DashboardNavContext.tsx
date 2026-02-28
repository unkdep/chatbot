// src/layouts/DashboardNavContext.tsx
"use client"

import React, { createContext, useContext } from "react"

export type Screen =
  | "inicio"
  | "dashboard"
  | "conversations"
  | "relatorios"
  | "meus-dados"
  | "programar-ia"

type Ctx = {
  screen: Screen
  setScreen: (s: Screen) => void
}

const DashboardNavContext = createContext<Ctx | null>(null)

export function DashboardNavProvider({
  value,
  children,
}: {
  value: Ctx
  children: React.ReactNode
}) {
  return (
    <DashboardNavContext.Provider value={value}>
      {children}
    </DashboardNavContext.Provider>
  )
}

export function useDashboardNav() {
  const ctx = useContext(DashboardNavContext)
  if (!ctx) {
    throw new Error("useDashboardNav must be used within DashboardNavProvider")
  }
  return ctx
}
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import DashboardLayout from "./layouts/DashboardLayout"

import Home from "./pages/dashboard/Home"
import Conversations from "./pages/dashboard/Conversations"
import Reports from "./pages/dashboard/Reports"
import SettingsAI from "./pages/dashboard/SettingsAI"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="reports" element={<Reports />} />
          <Route path="ai" element={<SettingsAI />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  )
}
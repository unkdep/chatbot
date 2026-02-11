"use client"

import orb from "../../assets/orb.gif"

export default function Inicio(){
return(
<div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-10">
<h1 className="text-4xl md:text-6xl font-bold
bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600
bg-clip-text text-transparent">
Bem-vindo à Lumi AI
</h1>

<img
src={orb}
alt="Lumi AI Orb"
className="w-64 md:w-72 select-none pointer-events-none"
/>
</div>
)
}

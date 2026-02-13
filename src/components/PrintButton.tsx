'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition shadow-lg flex items-center gap-2 no-print"
    >
      <Printer size={16} /> Imprimir Relatório
    </button>
  )
}
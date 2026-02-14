'use client'

import { Printer } from 'lucide-react'
import { useState } from 'react'

export default function PrintButton() {
  const [printing, setPrinting] = useState(false)

  const handlePrint = () => {
    setPrinting(true)
    window.print()
    setTimeout(() => setPrinting(false), 1000)
  }

  return (
    <button 
      onClick={handlePrint}
      disabled={printing}
      className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 disabled:opacity-50 transition shadow-lg flex items-center gap-2 no-print"
    >
      <Printer size={16} /> {printing ? 'Imprimindo...' : 'Imprimir Relatório'}
    </button>
  )
}

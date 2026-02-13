'use client'
import { useState, useEffect } from 'react'
import { salvarSimulacao } from '../actions'
import { Calculator, Save } from 'lucide-react'
import PrintButton from '@/components/PrintButton'

export default function SimuladorPage() {
  const [receita, setReceita] = useState(0)
  const [custos, setCustos] = useState({ bebidas: 0, comida: 0, staff: 0, vallet: 0 })
  const [resultado, setResultado] = useState({ total: 0, lucro: 0, margem: 0 })

  useEffect(() => {
    const total = Object.values(custos).reduce((a, b) => a + b, 0)
    const lucro = receita - total
    setResultado({ total, lucro, margem: receita > 0 ? (lucro / receita) * 100 : 0 })
  }, [receita, custos])

  const handleSalvar = async () => {
    await salvarSimulacao('simulacao-avulsa', { receita, custos: resultado.total, lucro: resultado.lucro, margem: resultado.margem, detalhes: custos })
    alert("Salvo com sucesso!")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
            <Calculator className="text-purple-600" size={32} /> Simulador
          </h1>
          <p className="text-slate-500 font-medium">Análise de viabilidade de festa.</p>
        </div>
        <div className="flex gap-2">
            <PrintButton />
            <button onClick={handleSalvar} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-600 transition shadow-lg no-print">
            <Save size={16} /> Salvar
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receita Total</label>
          <input type="number" onChange={e => setReceita(Number(e.target.value))} className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-2xl text-emerald-600" placeholder="R$ 0,00" />
          
          <div className="pt-4 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custos</p>
            {Object.keys(custos).map(key => (
              <div key={key}>
                <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">{key}</label>
                <input type="number" onChange={e => setCustos({...custos, [key]: Number(e.target.value)})} className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex flex-col justify-between shadow-2xl">
          <div className="space-y-8">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">Lucro Projetado</p>
              <p className={`text-5xl font-black italic ${resultado.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                R$ {resultado.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">Margem</p>
              <div className="flex items-center gap-4">
                <div className="h-4 flex-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div className={`h-full ${resultado.margem > 30 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(resultado.margem, 100)}%` }}></div>
                </div>
                <span className="font-black text-xl">{resultado.margem.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
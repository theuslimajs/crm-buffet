'use client'

import { useState } from 'react'
import { salvarSimulacao } from '../actions' 
import { Calculator, DollarSign, Save } from 'lucide-react'

export default function SimuladorPage() {
  // Estado da RECEITA (Quanto você cobra)
  const [receita, setReceita] = useState(0)
  
  // Estados dos CUSTOS (Quanto você gasta)
  const [custoCarne, setCustoCarne] = useState(0)
  const [custoBebida, setCustoBebida] = useState(0)
  const [custoEquipe, setCustoEquipe] = useState(0)
  const [custoDecoracao, setCustoDecoracao] = useState(0)
  const [outrosCustos, setOutrosCustos] = useState(0)

  // Cálculos Automáticos
  const custoTotal = custoCarne + custoBebida + custoEquipe + custoDecoracao + outrosCustos
  const lucro = receita - custoTotal
  const margem = receita > 0 ? (lucro / receita) * 100 : 0

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <header className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <Calculator className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">SIMULADOR DE LUCRO</h1>
          <p className="text-slate-400">Preencha o valor da venda e os custos para ver o lucro real.</p>
        </div>
      </header>

      <form action={salvarSimulacao} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUNA ESQUERDA: INPUTS */}
        <div className="space-y-6">
          
          {/* 1. RECEITA (VENDA) */}
          <div className="bg-emerald-900/20 p-6 rounded-3xl border border-emerald-500/30">
            <h2 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> 1. VALOR DA VENDA (Cobrado do Cliente)
            </h2>
            <input 
              name="receita"
              type="number" step="0.01"
              value={receita}
              onChange={(e) => setReceita(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border-2 border-emerald-500/50 p-4 rounded-xl text-3xl font-black text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              placeholder="R$ 0,00"
            />
          </div>

          {/* 2. CUSTOS */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h2 className="text-red-400 font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> 2. CUSTOS (Despesas)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-500">Carnes/Comida</label><input type="number" step="0.01" onChange={e => setCustoCarne(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 p-3 rounded-xl font-bold" /></div>
              <div><label className="text-xs text-slate-500">Bebidas</label><input type="number" step="0.01" onChange={e => setCustoBebida(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 p-3 rounded-xl font-bold" /></div>
              <div><label className="text-xs text-slate-500">Equipe</label><input type="number" step="0.01" onChange={e => setCustoEquipe(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 p-3 rounded-xl font-bold" /></div>
              <div><label className="text-xs text-slate-500">Decoração</label><input type="number" step="0.01" onChange={e => setCustoDecoracao(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 p-3 rounded-xl font-bold" /></div>
            </div>
            {/* Campos ocultos para enviar ao servidor */}
            <input type="hidden" name="custo" value={custoTotal} />
            <input type="hidden" name="detalhes" value={JSON.stringify({carne: custoCarne, bebida: custoBebida})} />
          </div>
        </div>

        {/* COLUNA DIREITA: RESULTADO */}
        <div className="flex flex-col gap-4">
          <div className={`flex-1 p-8 rounded-3xl border shadow-2xl flex flex-col items-center justify-center text-center ${lucro >= 0 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">LUCRO ESTIMADO</h3>
            <p className={`text-6xl font-black mb-4 ${lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            
            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden mb-2">
              <div className={`h-full ${margem > 30 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(margem, 100)}%` }}></div>
            </div>
            <p className="text-slate-300 font-bold">Margem: {margem.toFixed(1)}%</p>
          </div>

          <button type="submit" className="w-full bg-white text-slate-950 font-black p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition">
            <Save className="w-5 h-5" /> SALVAR NO HISTÓRICO
          </button>
        </div>
      </form>
    </main>
  )
}
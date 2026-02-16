import { prisma } from '@/lib/prisma'
import { createItemEstoque, registrarEntrada, registrarSaida, deleteItemEstoque } from '../actions'
import { Package, ArrowUpCircle, ArrowDownCircle, Trash2, Plus, AlertTriangle } from 'lucide-react'

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const itens = await prisma.itemEstoque.findMany({ orderBy: { nome: 'asc' } })

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
          <Package className="text-emerald-600" size={32} /> Controle de Estoque
        </h1>
        <p className="text-slate-500 font-medium">Gerencie entradas, saídas e níveis de reposição.</p>
      </header>

      {/* CADASTRO */}
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Plus size={16} /> Novo Item
        </h2>
        <form action={createItemEstoque} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome do Item</label>
            <input name="nome" required className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-slate-700" placeholder="Ex: Prato Raso Porcelana" />
          </div>
          <div className="w-full md:w-48 space-y-2">
             <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Categoria</label>
             <select name="categoria" className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-slate-700 cursor-pointer">
               <option>Geral</option>
               <option>Louças</option>
               <option>Alimentos</option>
               <option>Bebidas</option>
               <option>Decoração</option>
             </select>
          </div>
          <div className="w-full md:w-32 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Qtd Inicial</label>
            <input name="quantidade" type="number" className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-slate-700" placeholder="0" />
          </div>
          <div className="w-full md:w-32 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Mínimo</label>
            <input name="estoqueMinimo" type="number" className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-slate-700" placeholder="5" />
          </div>
          <button className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-800 transition w-full md:w-auto">
            Cadastrar
          </button>
        </form>
      </div>

      {/* LISTAGEM INTELIGENTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {itens.map((item) => {
          const isLow = item.quantidade <= item.estoqueMinimo;
          return (
            <div key={item.id} className={`bg-white p-6 rounded-[2rem] border transition hover:shadow-xl relative overflow-hidden ${isLow ? "border-red-200" : "border-slate-100"}`}>
              {isLow && (
                <div className="absolute top-0 right-0 bg-red-100 p-2 rounded-bl-2xl">
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
              )}
              <div className="mb-4">
                <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-wide mb-2 inline-block">
                  {item.categoria}
                </span>
                <h3 className="font-black text-xl text-slate-800 leading-tight">{item.nome}</h3>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-center mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Saldo Atual
                </div>
                <div className={`text-3xl font-black tracking-tighter ${isLow ? 'text-red-500' : 'text-emerald-500'}`}>
                  {item.quantidade}
                </div>
              </div>

              {/* CONTROLE DE MOVIMENTAÇÃO (A CORREÇÃO DO 50 ESTÁ AQUI) */}
              <form className="bg-slate-50 p-2 rounded-2xl flex items-center gap-2">
                <input type="hidden" name="id" value={item.id} />
                
                {/* CAMPO DE VALOR VARIÁVEL - A Action vai ler este 'name="valor"' */}
                <input 
                  name="valor" 
                  type="number" 
                  defaultValue="1" 
                  min="1"
                  className="w-full bg-white p-3 rounded-xl font-black text-center text-slate-700 outline-none focus:ring-2 focus:ring-slate-200" 
                  placeholder="Qtd"
                />
                
                {/* BOTÕES DE AÇÃO */}
                <button formAction={registrarEntrada} className="bg-emerald-100 text-emerald-600 p-3 rounded-xl hover:bg-emerald-500 hover:text-white transition" title="Adicionar">
                  <ArrowUpCircle size={20} />
                </button>
                <button formAction={registrarSaida} className="bg-red-100 text-red-600 p-3 rounded-xl hover:bg-red-500 hover:text-white transition" title="Remover">
                  <ArrowDownCircle size={20} />
                </button>
              </form>

              <form action={deleteItemEstoque} className="mt-4 flex justify-center">
                <input type="hidden" name="id" value={item.id} />
                <button className="text-[10px] text-red-300 hover:text-red-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Trash2 size={12} /> Excluir Item
                </button>
              </form>
            </div>
          )
        })}
      </div>
    </div>
  )
}
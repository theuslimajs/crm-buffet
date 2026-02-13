import { prisma } from '@/lib/prisma'
import { createItemEstoque, deleteItemEstoque, registrarEntrada, registrarSaida } from '../actions'
import { 
  PackageSearch, Plus, Minus, AlertTriangle, Trash2 
} from 'lucide-react'

export default async function EstoquePage() {
  const itens = await prisma.itemEstoque.findMany({ orderBy: { nome: 'asc' } })

  // Itens com estoque baixo
  const estoqueBaixo = itens.filter(i => i.quantidade <= i.estoqueMinimo)

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
             <PackageSearch className="text-yellow-500" size={32} /> Controle de Estoque
          </h1>
          <p className="text-slate-500 font-medium">Gerencie entradas e saídas de materiais.</p>
        </div>
        
        {estoqueBaixo.length > 0 && (
          <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-3 animate-pulse">
            <AlertTriangle className="text-red-500" size={20} />
            <div>
              <p className="text-xs font-black text-red-500 uppercase">Estoque Baixo</p>
              <p className="text-[10px] font-bold text-red-400">{estoqueBaixo.length} itens precisam de reposição.</p>
            </div>
          </div>
        )}
      </header>

      {/* --- CADASTRO --- */}
      <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Novo Produto</div>
        
        <form action={createItemEstoque} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome</label>
             <input name="nome" placeholder="Ex: Coca-Cola" required className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm" />
          </div>
          <div className="w-full md:w-40 space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Categoria</label>
             <select name="categoria" className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm text-slate-600">
               <option>Bebidas</option>
               <option>Descartáveis</option>
               <option>Alimentos</option>
               <option>Limpeza</option>
             </select>
          </div>
          <div className="w-full md:w-32 space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Qtd Inicial</label>
             <input name="quantidade" type="number" placeholder="0" className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm" />
          </div>
          <div className="w-full md:w-32 space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mínimo</label>
             <input name="estoqueMinimo" type="number" placeholder="10" className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm" />
          </div>
          <button className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition shadow-lg flex gap-2 items-center">
            <Plus size={16} /> Criar
          </button>
        </form>
      </div>

      {/* --- GRID DE ITENS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itens.map((item) => {
          const isLow = item.quantidade <= item.estoqueMinimo
          
          return (
            <div key={item.id} className={`bg-white p-6 rounded-[2rem] border transition hover:shadow-xl relative overflow-hidden ${isLow ? 'border-red-200' : 'border-slate-100'}`}>
              
              {isLow && (
                <div className="absolute top-0 right-0 bg-red-100 p-2 rounded-bl-2xl">
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
              )}

              <div className="mb-4">
                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">
                  {item.categoria}
                </span>
                <h3 className="font-black text-xl text-slate-800 mt-2 truncate">{item.nome}</h3>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-center mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Atual</div>
                <div className={`text-4xl font-black ${isLow ? 'text-red-500' : 'text-slate-800'}`}>
                  {item.quantidade} <span className="text-sm text-slate-400">un</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Movimentação Rápida</div>
                
                {/* FORMULÁRIO DE AÇÃO - Botões separados */}
                <form className="flex gap-2">
                  <input type="hidden" name="id" value={item.id} />
                  
                  <input 
                    name="valor" 
                    type="number" 
                    placeholder="Qtd" 
                    min="1"
                    className="w-20 bg-slate-100 rounded-xl text-center font-bold text-sm border-none focus:ring-2 focus:ring-purple-500 outline-none" 
                  />
                  
                  <button 
                    formAction={registrarEntrada}
                    className="flex-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded-xl flex items-center justify-center gap-1 py-3 transition font-bold text-xs uppercase"
                  >
                    <Plus size={14} /> Repor
                  </button>

                  <button 
                    formAction={registrarSaida}
                    className="flex-1 bg-red-100 text-red-700 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center gap-1 py-3 transition font-bold text-xs uppercase"
                  >
                    <Minus size={14} /> Baixar
                  </button>
                </form>

                <form action={deleteItemEstoque} className="mt-4 flex justify-end">
                   <input type="hidden" name="id" value={item.id} />
                   <button className="text-slate-300 hover:text-red-400 transition text-[10px] font-bold flex items-center gap-1 uppercase">
                     <Trash2 size={12} /> Excluir
                   </button>
                </form>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
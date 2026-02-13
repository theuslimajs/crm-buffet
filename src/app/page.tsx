import { prisma } from '@/lib/prisma'
import { DollarSign, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react'

export default async function Home() {
  const entradas = await prisma.pagamento.aggregate({ where: { status: "PAGO" }, _sum: { valor: true } })
  const saidas = await prisma.despesa.aggregate({ where: { status: "PAGO" }, _sum: { valor: true } })
  const totalLeads = await prisma.lead.count()
  const totalClientes = await prisma.cliente.count()
  
  const lucroReal = (entradas._sum.valor || 0) - (saidas._sum.valor || 0)

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter italic">Visão Geral do Negócio</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lucro Líquido</p>
          <h3 className={`text-3xl font-black mt-2 ${lucroReal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            R$ {lucroReal.toLocaleString()}
          </h3>
        </div>
        <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase">Entradas</p>
            <h3 className="text-xl font-black">R$ {(entradas._sum.valor || 0).toLocaleString()}</h3>
          </div>
          <ArrowUpRight className="text-emerald-500" />
        </div>
        <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-red-600 uppercase">Saídas</p>
            <h3 className="text-xl font-black">R$ {(saidas._sum.valor || 0).toLocaleString()}</h3>
          </div>
          <ArrowDownRight className="text-red-500" />
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-purple-400 uppercase">Clientes</p>
            <h3 className="text-xl font-black">{totalClientes}</h3>
          </div>
          <Users className="text-purple-400" />
        </div>
      </div>
    </div>
  )
}
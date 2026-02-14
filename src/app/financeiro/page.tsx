import { prisma } from "@/lib/prisma";
import { createDespesa, pagarDespesa, deleteDespesa, confirmarPagamento } from "../actions";
import PrintButton from "@/components/PrintButton";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Trash2, CheckCircle, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function FinanceiroPage() {
  const receitas = await prisma.pagamento.findMany({
    include: { festa: { include: { cliente: true } } },
    orderBy: { dataVencimento: "asc" },
  });

  const despesas = await prisma.despesa.findMany({
    orderBy: { dataVencimento: "asc" },
  });

  const totalReceitas = receitas
    .filter((r) => r.status === "PAGO")
    .reduce((acc, r) => acc + Number(r.valor), 0);

  const totalDespesas = despesas
    .filter((d) => d.status === "PAGO")
    .reduce((acc, d) => acc + Number(d.valor), 0);

  const saldo = totalReceitas - totalDespesas;

  const money = (v: any) =>
    Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
            <Wallet className="text-emerald-600" size={32} /> Fluxo de Caixa
          </h1>
          <p className="text-slate-500 font-medium">Controle de entradas e saídas.</p>
        </div>
        <PrintButton />
      </header>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="text-emerald-500" />{" "}
            <span className="text-xs font-black text-emerald-600 uppercase">Receitas</span>
          </div>
          <p className="text-3xl font-black text-emerald-700">R$ {money(totalReceitas)}</p>
        </div>

        <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="text-red-500" />{" "}
            <span className="text-xs font-black text-red-600 uppercase">Despesas</span>
          </div>
          <p className="text-3xl font-black text-red-700">R$ {money(totalDespesas)}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="text-purple-400" />{" "}
            <span className="text-xs font-black text-slate-400 uppercase">Saldo Líquido</span>
          </div>
          <p className="text-3xl font-black text-white">R$ {money(saldo)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CONTAS A PAGAR */}
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            Contas a Pagar
          </h2>

          <form action={createDespesa} className="flex gap-2 mb-6 no-print">
            <input
              name="descricao"
              placeholder="Desc: Luz, Água"
              className="flex-1 bg-slate-50 p-3 rounded-xl text-sm font-bold"
              required
            />
            <div className="w-32 relative">
              <input
                name="dataVencimento"
                type="date"
                required
                className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold text-slate-500"
              />
            </div>
            <input
              name="valor"
              type="number"
              step="0.01"
              min={0}
              placeholder="R$"
              className="w-24 bg-slate-50 p-3 rounded-xl text-sm font-bold"
              required
            />
            <button className="bg-red-500 text-white p-3 rounded-xl font-bold text-xs uppercase hover:bg-red-600 transition">
              Add
            </button>
          </form>

          <div className="space-y-3">
            {despesas.map((d) => (
              <div
                key={d.id}
                className="flex justify-between items-center p-3 bg-red-50/50 rounded-xl border border-red-100"
              >
                <div>
                  <p className="font-bold text-slate-700 text-sm">{d.descricao}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-red-400 font-bold uppercase">{d.status}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <CalendarDays size={10} />{" "}
                      {new Date(d.dataVencimento).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-800">R$ {money(d.valor)}</span>

                  {d.status === "PENDENTE" && (
                    <form action={pagarDespesa} className="no-print">
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        title="Marcar como Pago"
                        className="text-emerald-500 hover:text-emerald-700 transition"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </form>
                  )}

                  <form action={deleteDespesa} className="no-print">
                    <input type="hidden" name="id" value={d.id} />
                    <button title="Excluir" className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECEITAS */}
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            Entradas & Previsão
          </h2>

          <div className="space-y-3">
            {receitas.length === 0 && (
              <p className="text-slate-400 text-sm italic">Nenhuma receita lançada.</p>
            )}

            {receitas.map((r) => (
              <div
                key={r.id}
                className={`flex justify-between items-center p-3 rounded-xl border ${
                  r.status === "PAGO"
                    ? "bg-emerald-50/50 border-emerald-100"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <div>
                  <p className="font-bold text-slate-700 text-sm">
                    {r.festa ? r.festa.nomeAniversariante : "Entrada Avulsa"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p
                      className={`text-[10px] font-bold uppercase ${
                        r.status === "PAGO" ? "text-emerald-500" : "text-orange-400"
                      }`}
                    >
                      {r.status}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <CalendarDays size={10} />{" "}
                      {new Date(r.dataVencimento).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-800">R$ {money(r.valor)}</span>

                  {r.status !== "PAGO" && (
                    <form action={confirmarPagamento} className="no-print">
                      <input type="hidden" name="id" value={r.id} />
                      {/* Se sua action exige método, mantenha esse default */}
                      <input type="hidden" name="metodo" value="PIX" />
                      <button
                        title="Confirmar Recebimento"
                        className="text-slate-300 hover:text-emerald-500 transition"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

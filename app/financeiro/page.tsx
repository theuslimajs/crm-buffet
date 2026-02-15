// src/app/financeiro/page.tsx
import { prisma } from "@/lib/prisma";
import { confirmarPagamento, createDespesa, deleteDespesa, pagarDespesa, updatePagamento } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FinanceiroPage() {
  let pagamentos: any[] = [];
  let despesas: any[] = [];
  let dbError: string | null = null;

  try {
    const result = await Promise.all([
      prisma.pagamento.findMany({
        orderBy: { dataVencimento: "asc" },
        include: { festa: { include: { cliente: true } } },
      }),
      prisma.despesa.findMany({ orderBy: { dataVencimento: "asc" } }),
    ]);
    pagamentos = result[0];
    despesas = result[1];
  } catch (e) {
    console.error(e);
    dbError = "Não consegui acessar a tabela de financeiro no banco. Confirme se as migrations foram aplicadas no Neon/Vercel e se DATABASE_URL está configurada.";
  }

  const receberPendente = pagamentos.filter((p) => p.status === "PENDENTE").reduce((acc, p) => acc + p.valor, 0);
  const receberPago = pagamentos.filter((p) => p.status === "PAGO").reduce((acc, p) => acc + p.valor, 0);
  const pagarPendente = despesas.filter((d) => d.status === "PENDENTE").reduce((acc, d) => acc + d.valor, 0);
  const pagarPago = despesas.filter((d) => d.status === "PAGO").reduce((acc, d) => acc + d.valor, 0);

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black">Financeiro</h1>
        <p className="text-slate-500">Fluxo de caixa: contas a receber e a pagar</p>
      </header>

      {dbError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <b>Erro:</b> {dbError}
        </div>
      ) : null}

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi title="A receber (pendente)" value={fmt(receberPendente)} />
        <Kpi title="A receber (pago)" value={fmt(receberPago)} />
        <Kpi title="A pagar (pendente)" value={fmt(pagarPendente)} />
        <Kpi title="A pagar (pago)" value={fmt(pagarPago)} />
      </section>

      {/* Receber */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black text-lg mb-4">Contas a Receber</h2>

        {pagamentos.length === 0 ? (
          <p className="text-slate-500">Nenhum pagamento cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Cliente</th>
                  <th>Festa</th>
                  <th>Parcela</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map((p) => (
                  <tr key={p.id} className="border-b last:border-b-0 align-top">
                    <td className="py-3 font-semibold">{p.festa?.cliente?.nome ?? "-"}</td>
                    <td>{p.festa?.nomeAniversariante ?? "-"}</td>
                    <td>{p.parcela}</td>
                    <td>{new Date(p.dataVencimento).toLocaleDateString("pt-BR")}</td>
                    <td className="font-black">{fmt(p.valor)}</td>
                    <td>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                          p.status === "PAGO" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right space-x-2">
                      <details className="inline-block text-left">
                        <summary className="cursor-pointer inline-block bg-slate-900 text-white font-black px-3 py-2 rounded-lg uppercase text-[10px] tracking-widest hover:bg-slate-800 transition">
                          Editar
                        </summary>
                        <div className="mt-2 p-3 bg-white border border-slate-200 rounded-xl shadow-lg w-[360px]">
                          <form action={updatePagamento} className="space-y-2">
                            <input type="hidden" name="id" value={p.id} />
                            <div className="grid grid-cols-2 gap-2">
                              <input name="valor" defaultValue={String(p.valor)} className="border border-slate-200 rounded-lg px-3 py-2" />
                              <input
                                name="dataVencimento"
                                type="date"
                                defaultValue={new Date(p.dataVencimento).toISOString().slice(0, 10)}
                                className="border border-slate-200 rounded-lg px-3 py-2"
                              />
                            </div>
                            <select name="metodo" defaultValue={p.metodo} className="w-full border border-slate-200 rounded-lg px-3 py-2">
                              <option value="A_DEFINIR">A DEFINIR</option>
                              <option value="A_RECEBER">A RECEBER</option>
                              <option value="PIX">PIX</option>
                              <option value="CARTAO">CARTÃO</option>
                              <option value="DINHEIRO">DINHEIRO</option>
                            </select>
                            <button className="w-full bg-emerald-600 text-white font-black px-4 py-2 rounded-lg uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition">
                              Salvar
                            </button>
                          </form>
                        </div>
                      </details>

                      {p.status === "PENDENTE" ? (
                        <form action={confirmarPagamento} className="inline-flex items-center gap-2">
                          <input type="hidden" name="id" value={p.id} />
                          <select
                            name="metodo"
                            defaultValue="PIX"
                            className="border border-slate-200 rounded-lg px-2 py-2 text-xs"
                          >
                            <option value="PIX">PIX</option>
                            <option value="CARTAO">CARTÃO</option>
                            <option value="DINHEIRO">DINHEIRO</option>
                          </select>
                          <button className="bg-emerald-600 text-white font-black px-3 py-2 rounded-lg uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition">
                            Confirmar
                          </button>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Despesas */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black text-lg mb-4">Contas a Pagar (Despesas)</h2>

        <form action={createDespesa} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <input name="descricao" placeholder="Descrição" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="categoria" placeholder="Categoria" className="border border-slate-200 rounded-xl px-4 py-3" />
          <input name="valor" placeholder="Valor" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="dataVencimento" type="date" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <button className="bg-slate-900 text-white font-black rounded-xl px-4 py-3 uppercase text-xs tracking-widest hover:bg-slate-800 transition">
            Lançar
          </button>
        </form>

        {despesas.length === 0 ? (
          <p className="text-slate-500">Nenhuma despesa cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Descrição</th>
                  <th>Categoria</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map((d) => (
                  <tr key={d.id} className="border-b last:border-b-0">
                    <td className="py-3 font-semibold">{d.descricao}</td>
                    <td>{d.categoria}</td>
                    <td>{new Date(d.dataVencimento).toLocaleDateString("pt-BR")}</td>
                    <td className="font-black">{fmt(d.valor)}</td>
                    <td>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                          d.status === "PAGO" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="text-right space-x-2">
                      {d.status === "PENDENTE" ? (
                        <form action={pagarDespesa} className="inline-block">
                          <input type="hidden" name="id" value={d.id} />
                          <button className="bg-emerald-600 text-white font-black px-3 py-2 rounded-lg uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition">
                            Marcar paga
                          </button>
                        </form>
                      ) : null}

                      <form action={deleteDespesa} className="inline-block">
                        <input type="hidden" name="id" value={d.id} />
                        <button className="bg-red-600 text-white font-black px-3 py-2 rounded-lg uppercase text-[10px] tracking-widest hover:bg-red-700 transition">
                          Excluir
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

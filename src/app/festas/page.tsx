export const dynamic = "force-dynamic";

// src/app/festas/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createFesta, createPacote, deleteFesta, gerarFinanceiroHibrido } from "../actions";

export default async function FestasPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const clienteFiltro = typeof searchParams?.n === 'string' ? searchParams?.n : '';

  const [festas, clientes, pacotes] = await Promise.all([
    prisma.festa.findMany({
      where: clienteFiltro ? { clienteId: clienteFiltro } : undefined,
      orderBy: { dataFesta: "asc" },
      include: {
        cliente: true,
        pacote: true,
        pagamentos: true,
      },
    }),
    prisma.cliente.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.pacote.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Festas & Eventos</h1>
          <p className="text-slate-500">Cadastre festas, pacotes e pagamentos</p>
        </div>
        <Link
          href="/festas/nova"
          className="bg-emerald-600 text-white font-black rounded-xl px-5 py-3 uppercase text-xs tracking-widest hover:bg-emerald-700 transition"
        >
          Nova festa (assistida)
        </Link>
      </header>

      {/* Novo Pacote */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">Novo Pacote</h2>
        <form action={createPacote} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="nome" placeholder="Nome do pacote" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="precoBase" placeholder="Preço base" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="descricao" placeholder="Descrição (opcional)" className="border border-slate-200 rounded-xl px-4 py-3" />
          <button className="bg-slate-900 text-white font-black rounded-xl px-4 py-3 uppercase text-xs tracking-widest hover:bg-slate-800 transition">
            Salvar pacote
          </button>
        </form>
      </div>

      {/* Nova Festa */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">Nova Festa (rápido)</h2>

        <form action={createFesta} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            name="nomeAniversariante"
            placeholder="Aniversariante"
            className="border border-slate-200 rounded-xl px-4 py-3 md:col-span-2"
            required
          />

          <select name="clienteId" className="border border-slate-200 rounded-xl px-4 py-3" required>
            <option value="">Selecione cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.telefone})
              </option>
            ))}
          </select>

          <select name="pacoteId" className="border border-slate-200 rounded-xl px-4 py-3" required>
            <option value="">Selecione pacote</option>
            {pacotes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.precoBase.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
              </option>
            ))}
          </select>

          <input name="dataFesta" type="date" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="valorTotal" placeholder="Valor total" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="qtdPessoas" placeholder="Qtd pessoas" className="border border-slate-200 rounded-xl px-4 py-3" />

          <input name="horaInicio" placeholder="Hora início (19:00)" className="border border-slate-200 rounded-xl px-4 py-3" />
          <input name="horaFim" placeholder="Hora fim (23:00)" className="border border-slate-200 rounded-xl px-4 py-3" />

          <button className="bg-emerald-600 text-white font-black rounded-xl px-4 py-3 uppercase text-xs tracking-widest hover:bg-emerald-700 transition md:col-span-2">
            Salvar festa
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-black">Lista de Festas</h2>
          <p className="text-xs text-slate-500">Dica: gere o financeiro híbrido para criar entrada + parcelas.</p>
        </div>

        {festas.length === 0 ? (
          <p className="text-slate-500">Nenhuma festa cadastrada.</p>
        ) : (
          <div className="space-y-4">
            {festas.map((f) => {
              const totalPago = f.pagamentos.filter((p) => p.status === "PAGO").reduce((acc, p) => acc + p.valor, 0);
              const totalPendente = f.pagamentos.filter((p) => p.status === "PENDENTE").reduce((acc, p) => acc + p.valor, 0);

              return (
                <div key={f.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-black text-lg truncate">{f.nomeAniversariante}</h3>
                      <p className="text-sm text-slate-600 truncate">
                        {f.cliente.nome} • {new Date(f.dataFesta).toLocaleDateString("pt-BR")} {f.horaInicio}–{f.horaFim} •{" "}
                        {f.pacote?.nome ?? "Sem pacote"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Total:{" "}
                        <span className="font-black">
                          {f.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>{" "}
                        • Pago:{" "}
                        <span className="font-black text-emerald-700">
                          {totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>{" "}
                        • Pendente:{" "}
                        <span className="font-black text-amber-700">
                          {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </p>
                    </div>

                    {/* Financeiro híbrido */}
                    <form action={gerarFinanceiroHibrido} className="grid grid-cols-2 md:grid-cols-5 gap-2 xl:w-[680px]">
                      <input type="hidden" name="festaId" value={f.id} />
                      <input type="hidden" name="valorTotal" value={f.valorTotal} />

                      <input
                        name="valorEntrada"
                        placeholder="Entrada"
                        className="border border-slate-200 rounded-xl px-3 py-2"
                      />
                      <input
                        name="qtdParcelas"
                        placeholder="Parcelas"
                        defaultValue="1"
                        className="border border-slate-200 rounded-xl px-3 py-2"
                      />
                      <input
                        name="dataInicio"
                        type="date"
                        defaultValue={new Date(f.dataFesta).toISOString().slice(0, 10)}
                        className="border border-slate-200 rounded-xl px-3 py-2"
                      />

                      <button className="col-span-2 md:col-span-2 bg-slate-900 text-white font-black rounded-xl px-4 py-2 uppercase text-xs tracking-widest hover:bg-slate-800 transition">
                        Gerar financeiro
                      </button>
                    </form>
                  </div>

                  <div className="flex items-center justify-end mt-4 gap-2">
                    <form action={deleteFesta}>
                      <input type="hidden" name="id" value={f.id} />
                      <button className="bg-red-600 text-white font-black px-4 py-2 rounded-xl uppercase text-xs tracking-widest hover:bg-red-700 transition">
                        Excluir
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

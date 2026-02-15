// src/app/festas/nova/page.tsx
import { prisma } from "@/lib/prisma";
import { createCliente, createFesta } from "../../actions";

export default async function FestaNovaPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const nome = typeof searchParams?.nome === "string" ? searchParams?.nome : "";
  const telefone = typeof searchParams?.telefone === "string" ? searchParams?.telefone : "";

  const [clientes, pacotes] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.pacote.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black">Nova Festa (Assistida)</h1>
        <p className="text-slate-500">1) Crie/seleciona o cliente • 2) Crie a festa</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">1) Cliente</h2>

        <form action={createCliente} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="nome" defaultValue={nome} placeholder="Nome do cliente" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="telefone" defaultValue={telefone} placeholder="Telefone" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="email" placeholder="Email (opcional)" className="border border-slate-200 rounded-xl px-4 py-3" />
          <button className="bg-emerald-600 text-white font-black rounded-xl px-4 py-3 uppercase text-xs tracking-widest hover:bg-emerald-700 transition">
            Salvar cliente
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-3">Depois de salvar, selecione o cliente no formulário abaixo.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">2) Festa</h2>

        <form action={createFesta} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            name="nomeAniversariante"
            placeholder="Nome do aniversariante"
            className="border border-slate-200 rounded-xl px-4 py-3 md:col-span-2"
            required
          />

          <select name="clienteId" className="border border-slate-200 rounded-xl px-4 py-3" required>
            <option value="">Selecione o cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.telefone})
              </option>
            ))}
          </select>

          <select name="pacoteId" className="border border-slate-200 rounded-xl px-4 py-3" required>
            <option value="">Selecione o pacote</option>
            {pacotes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.precoBase.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
              </option>
            ))}
          </select>

          <input name="dataFesta" type="date" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="horaInicio" placeholder="Hora início (19:00)" className="border border-slate-200 rounded-xl px-4 py-3" />
          <input name="horaFim" placeholder="Hora fim (23:00)" className="border border-slate-200 rounded-xl px-4 py-3" />
          <input name="qtdPessoas" placeholder="Qtd pessoas" className="border border-slate-200 rounded-xl px-4 py-3" />
          <input name="valorTotal" placeholder="Valor total" className="border border-slate-200 rounded-xl px-4 py-3" required />

          <button className="bg-slate-900 text-white font-black rounded-xl px-4 py-3 uppercase text-xs tracking-widest hover:bg-slate-800 transition md:col-span-2">
            Criar festa
          </button>
        </form>
      </div>
    </div>
  );
}

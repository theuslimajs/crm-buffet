export const dynamic = "force-dynamic";

// src/app/leads/page.tsx
import { prisma } from "@/lib/prisma";
import { createLead, deleteLead, updateLeadStatus } from "../actions";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black">Leads & Vendas</h1>
        <p className="text-slate-500">Cadastre leads e acompanhe o funil</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">Novo Lead</h2>

        <form action={createLead} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="nome"
            placeholder="Nome"
            className="border border-slate-200 rounded-xl px-4 py-3"
            required
          />
          <input
            name="telefone"
            placeholder="Telefone"
            className="border border-slate-200 rounded-xl px-4 py-3"
            required
          />
          <input name="origem" placeholder="Origem (Instagram, Google...)" className="border border-slate-200 rounded-xl px-4 py-3" />
          <button className="bg-emerald-600 text-white font-black rounded-xl px-4 py-3 uppercase text-xs tracking-widest hover:bg-emerald-700 transition">
            Salvar
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">Lista de Leads</h2>

        {leads.length === 0 ? (
          <p className="text-slate-500">Nenhum lead cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Nome</th>
                  <th>Telefone</th>
                  <th>Origem</th>
                  <th>Status</th>
                  <th>Visita</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-b-0">
                    <td className="py-3 font-semibold">{lead.nome}</td>
                    <td>{lead.telefone}</td>
                    <td>{lead.origem ?? "-"}</td>
                    <td className="min-w-[220px]">
                      <form action={updateLeadStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={lead.id} />
                        <select name="status" defaultValue={lead.status} className="border border-slate-200 rounded-lg px-3 py-2">
                          <option value="NOVO">NOVO</option>
                          <option value="EM_NEGOCIACAO">EM NEGOCIAÇÃO</option>
                          <option value="FECHADO">FECHADO</option>
                          <option value="PERDIDO">PERDIDO</option>
                        </select>
                        <input
                          type="date"
                          name="dataVisita"
                          defaultValue={lead.dataVisita ? new Date(lead.dataVisita).toISOString().slice(0, 10) : ""}
                          className="border border-slate-200 rounded-lg px-3 py-2"
                        />
                        <button className="bg-slate-900 text-white font-black px-3 py-2 rounded-lg uppercase text-[10px] tracking-widest hover:bg-slate-800 transition">
                          OK
                        </button>
                      </form>
                    </td>
                    <td>{lead.dataVisita ? new Date(lead.dataVisita).toLocaleDateString("pt-BR") : "-"}</td>
                    <td className="text-right space-x-2">
                      <a
                        className="inline-block bg-emerald-600 text-white font-black px-3 py-2 rounded-lg uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition"
                        href={`/festas/nova?nome=${encodeURIComponent(lead.nome)}&telefone=${encodeURIComponent(lead.telefone)}`}
                      >
                        Converter
                      </a>
                      <form action={deleteLead} className="inline-block">
                        <input type="hidden" name="id" value={lead.id} />
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
      </div>
    </div>
  );
}

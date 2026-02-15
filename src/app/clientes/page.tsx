// src/app/clientes/page.tsx
import { prisma } from "@/lib/prisma";
import { createCliente } from "../actions";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black">Clientes</h1>
        <p className="text-slate-500">Cadastro e histórico</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">Novo Cliente</h2>

        <form action={createCliente} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="nome" placeholder="Nome" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="telefone" placeholder="Telefone" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="email" placeholder="Email (opcional)" className="border border-slate-200 rounded-xl px-4 py-3" />
          <button className="bg-emerald-600 text-white font-black rounded-xl px-4 py-3 uppercase text-xs tracking-widest hover:bg-emerald-700 transition">
            Salvar
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">Lista de Clientes</h2>

        {clientes.length === 0 ? (
          <p className="text-slate-500">Nenhum cliente cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Cadastro</th>
                  <th className="text-right">Festas</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} className="border-b last:border-b-0">
                    <td className="py-3 font-semibold">{c.nome}</td>
                    <td>{c.telefone}</td>
                    <td>{c.email || "-"}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="text-right">
                      <a
                        className="inline-block bg-slate-900 text-white font-black px-3 py-2 rounded-lg uppercase text-[10px] tracking-widest hover:bg-slate-800 transition"
                        href={`/festas?n=${encodeURIComponent(c.id)}`}
                      >
                        Ver
                      </a>
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

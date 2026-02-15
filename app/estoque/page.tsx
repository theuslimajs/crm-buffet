// src/app/estoque/page.tsx
import { prisma } from "@/lib/prisma";
import { createItemEstoque, deleteItemEstoque, movimentarEstoque } from "../actions";

export default async function EstoquePage() {
  const itens = await prisma.itemEstoque.findMany({ orderBy: { categoria: "asc" } });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black">Estoque</h1>
        <p className="text-slate-500">Controle de insumos e alertas</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">Novo Item</h2>

        <form action={createItemEstoque} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input name="nome" placeholder="Nome" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="categoria" placeholder="Categoria" className="border border-slate-200 rounded-xl px-4 py-3" />
          <input name="quantidade" placeholder="Quantidade" className="border border-slate-200 rounded-xl px-4 py-3" />
          <input name="estoqueMinimo" placeholder="Estoque mínimo" className="border border-slate-200 rounded-xl px-4 py-3" />
          <div className="grid grid-cols-2 gap-2">
            <input name="unidade" placeholder="UN/KG/L" className="border border-slate-200 rounded-xl px-4 py-3" />
            <button className="bg-emerald-600 text-white font-black rounded-xl px-4 py-3 uppercase text-xs tracking-widest hover:bg-emerald-700 transition">
              Salvar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">Itens</h2>

        {itens.length === 0 ? (
          <p className="text-slate-500">Nenhum item no estoque.</p>
        ) : (
          <div className="space-y-3">
            {itens.map((i) => {
              const baixo = i.quantidade <= i.estoqueMinimo;
              return (
                <div
                  key={i.id}
                  className={`p-4 rounded-2xl border ${
                    baixo ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-black truncate">{i.nome}</p>
                      <p className="text-xs text-slate-600">
                        {i.categoria} • <span className="font-black">{i.quantidade}</span> {i.unidade} • mín.{" "}
                        {i.estoqueMinimo}
                      </p>
                      {baixo ? <p className="text-xs font-black text-red-700 mt-1">ATENÇÃO: abaixo do mínimo</p> : null}
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                      <form action={movimentarEstoque} className="flex gap-2">
                        <input type="hidden" name="id" value={i.id} />
                        <input type="hidden" name="tipo" value="ENTRADA" />
                        <input
                          name="valor"
                          type="number"
                          min={1}
                          defaultValue={1}
                          placeholder="+Qtd"
                          className="border border-slate-200 rounded-xl px-3 py-2 w-24"
                        />
                        <button className="bg-slate-900 text-white font-black px-4 py-2 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition">
                          Entrada
                        </button>
                      </form>

                      <form action={movimentarEstoque} className="flex gap-2">
                        <input type="hidden" name="id" value={i.id} />
                        <input type="hidden" name="tipo" value="SAIDA" />
                        <input
                          name="valor"
                          type="number"
                          min={1}
                          defaultValue={1}
                          placeholder="-Qtd"
                          className="border border-slate-200 rounded-xl px-3 py-2 w-24"
                        />
                        <button className="bg-amber-600 text-white font-black px-4 py-2 rounded-xl uppercase text-xs tracking-widest hover:bg-amber-700 transition">
                          Saída
                        </button>
                      </form>

                      <form action={deleteItemEstoque}>
                        <input type="hidden" name="id" value={i.id} />
                        <button className="bg-red-600 text-white font-black px-4 py-2 rounded-xl uppercase text-xs tracking-widest hover:bg-red-700 transition">
                          Excluir
                        </button>
                      </form>
                    </div>
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

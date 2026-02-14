import { prisma } from "@/lib/prisma";
import {
  createFesta,
  createPacote,
  gerarFinanceiroHibrido,
  confirmarPagamento,
  deleteFesta,
  updatePagamento,
} from "../actions";
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  PartyPopper,
  PackagePlus,
  Trash2,
  Save,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function FestasPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  const pacotes = await prisma.pacote.findMany({ orderBy: { nome: "asc" } });

  const festas = await prisma.festa.findMany({
    include: { cliente: true, pacote: true, pagamentos: true },
    orderBy: { dataFesta: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
          Agenda & Fluxo de Caixa
        </h1>
        <p className="text-slate-400 font-medium">Controle total de recebíveis e eventos.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* NOVO PACOTE */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-orange-500">
            <PackagePlus /> NOVO PACOTE
          </h2>

          <form action={createPacote} className="space-y-4">
            <input
              name="nome"
              placeholder="Ex: Festa Master"
              required
              className="w-full border p-3 rounded-xl text-sm"
            />
            <input
              name="descricao"
              placeholder="Descrição"
              required
              className="w-full border p-3 rounded-xl text-sm"
            />
            <input
              name="precoBase"
              type="number"
              step="0.01"
              min={0}
              placeholder="R$ Preço"
              required
              className="w-full border p-3 rounded-xl text-sm"
            />
            <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-black text-xs hover:bg-orange-600 transition">
              CRIAR PACOTE
            </button>
          </form>
        </section>

        {/* NOVA FESTA */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-purple-500">
            <PartyPopper /> AGENDAR FESTA
          </h2>

          <form action={createFesta} className="space-y-4">
            <select name="clienteId" required className="w-full border p-3 rounded-xl text-sm bg-slate-50">
              <option value="">Selecione o Cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>

            <select name="pacoteId" required className="w-full border p-3 rounded-xl text-sm bg-slate-50">
              <option value="">Selecione o Pacote...</option>
              {pacotes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input
                name="nomeAniversariante"
                placeholder="Aniversariante"
                required
                className="border p-3 rounded-xl text-sm"
              />
              <input name="dataFesta" type="date" required className="border p-3 rounded-xl text-sm" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <input name="horaInicio" type="time" required className="border p-3 rounded-xl text-sm" />
              <input name="horaFim" type="time" required className="border p-3 rounded-xl text-sm" />
              <input
                name="valorTotal"
                type="number"
                step="0.01"
                min={0}
                placeholder="R$ Total"
                required
                className="border p-3 rounded-xl text-sm"
              />
            </div>

            <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-black text-xs hover:bg-purple-700 transition">
              CONFIRMAR EVENTO
            </button>
          </form>
        </section>
      </div>

      <div className="space-y-10">
        {festas.map((festa) => {
          const pagamentosOrdenados = [...festa.pagamentos].sort((a, b) => a.parcela - b.parcela);

          return (
            <div key={festa.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-widest">{festa.nomeAniversariante}</h3>
                  <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-2">
                    <Calendar size={14} /> {new Date(festa.dataFesta).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Contrato</p>
                    <p className="text-3xl font-black text-purple-400">
                      R$ {Number(festa.valorTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <form action={deleteFesta}>
                    <input type="hidden" name="id" value={festa.id} />
                    <button className="bg-white/10 hover:bg-red-500 p-3 rounded-2xl transition text-white">
                      <Trash2 size={20} />
                    </button>
                  </form>
                </div>
              </div>

              <div className="p-8 grid lg:grid-cols-3 gap-12">
                <div className="space-y-6">
                  <h4 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                    <CreditCard size={18} /> GERAR PLANO HÍBRIDO
                  </h4>

                  <form action={gerarFinanceiroHibrido} className="space-y-4 bg-slate-50 p-6 rounded-2xl">
                    <input type="hidden" name="festaId" value={festa.id} />
                    <input type="hidden" name="valorTotal" value={String(festa.valorTotal)} />

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Entrada</label>
                      <input
                        name="valorEntrada"
                        type="number"
                        step="0.01"
                        min={0}
                        required
                        className="w-full border-none bg-white p-3 rounded-xl text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Parcelas</label>
                      <input
                        name="qtdParcelas"
                        type="number"
                        min={0}
                        required
                        className="w-full border-none bg-white p-3 rounded-xl text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Início Mensalidades</label>
                      <input name="dataInicio" type="date" required className="w-full border-none bg-white p-3 rounded-xl text-sm font-bold" />
                    </div>

                    <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-black text-[10px] hover:bg-purple-700 transition">
                      SALVAR PLANO
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <h4 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                    <DollarSign size={18} /> FLUXO DE CAIXA EDITÁVEL
                  </h4>

                  <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-4">
                    {pagamentosOrdenados.map((pag) => (
                      <div
                        key={pag.id}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition"
                      >
                        {pag.status === "PAGO" ? (
                          <div className="flex flex-1 justify-between items-center px-4">
                            <span className="text-[10px] font-black text-slate-300">
                              #{pag.parcela === 0 ? "E" : pag.parcela}
                            </span>
                            <span className="font-black text-slate-700">R$ {Number(pag.valor).toFixed(2)}</span>
                            <span className="text-xs font-bold text-slate-400">
                              {new Date(pag.dataVencimento).toLocaleDateString("pt-BR")}
                            </span>
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black">
                              PAGO
                            </span>
                          </div>
                        ) : (
                          <form action={updatePagamento} className="flex flex-1 items-center gap-6">
                            <input type="hidden" name="id" value={pag.id} />
                            <span className="text-[10px] font-black text-slate-300">#{pag.parcela}</span>

                            <input
                              name="valor"
                              type="number"
                              step="0.01"
                              min={0}
                              defaultValue={Number(pag.valor)}
                              className="w-28 bg-slate-50 p-2 rounded-lg text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-purple-200"
                            />

                            <input
                              name="dataVencimento"
                              type="date"
                              defaultValue={new Date(pag.dataVencimento).toISOString().split("T")[0]}
                              className="text-xs font-bold text-slate-500 bg-transparent outline-none"
                            />

                            <button className="text-slate-300 hover:text-blue-500 transition" title="Salvar">
                              <Save size={18} />
                            </button>

                            <div className="flex items-center gap-4 border-l pl-6">
                              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                                PENDENTE
                              </span>
                            </div>
                          </form>
                        )}

                        {pag.status === "PENDENTE" && (
                          <form action={confirmarPagamento} className="flex items-center gap-2 ml-4">
                            <input type="hidden" name="id" value={pag.id} />
                            <input type="hidden" name="metodo" value="PIX" />
                            <button className="text-emerald-500 hover:scale-110 transition" title="Confirmar pagamento">
                              <CheckCircle2 size={24} />
                            </button>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

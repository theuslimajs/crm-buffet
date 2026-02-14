import { prisma } from "@/lib/prisma";
import { createLead, deleteLead, updateLeadStatus } from "../actions";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  Search,
  Trash2,
  PartyPopper,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Instagram,
  Globe,
  Megaphone,
  MapPin,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const getOrigemIcon = (origem: string) => {
    switch (origem) {
      case "Instagram":
        return <Instagram size={12} />;
      case "Google":
        return <Globe size={12} />;
      case "Indicação":
        return <User size={12} />;
      default:
        return <Megaphone size={12} />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter flex items-center gap-3">
            <Search className="text-blue-600" size={32} /> Gestão de Leads
          </h1>
          <p className="text-slate-500 font-medium">Controle de oportunidades e origem dos clientes.</p>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border shadow-sm text-xs font-bold text-slate-500">
          Total na Fila: <span className="text-slate-900 text-lg ml-1">{leads.length}</span>
        </div>
      </header>

      {/* FORM */}
      <div className="bg-white p-6 rounded-[2rem] border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <User size={100} />
        </div>

        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          Novo Interessado
        </h2>

        <form action={createLead} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative z-10">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome</label>
            <input
              name="nome"
              placeholder="Ex: João Silva"
              required
              className="w-full bg-slate-50 p-4 rounded-xl border-none font-bold text-sm outline-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">WhatsApp</label>
            <input
              name="telefone"
              placeholder="(11) 99999-9999"
              required
              className="w-full bg-slate-50 p-4 rounded-xl border-none font-bold text-sm outline-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Origem / Contato</label>
            <div className="relative">
              <select
                name="origem"
                className="w-full bg-slate-50 p-4 rounded-xl border-none font-bold text-sm outline-blue-500 appearance-none text-slate-600"
                defaultValue="Instagram"
              >
                <option value="Instagram">Instagram</option>
                <option value="Google">Google / Site</option>
                <option value="Indicação">Indicação</option>
                <option value="Passante">Passou na Porta</option>
              </select>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <MapPin size={16} />
              </div>
            </div>
          </div>

          <div>
            <button className="w-full bg-slate-900 text-white font-black px-6 py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2">
              <User size={16} /> Salvar Lead
            </button>
          </div>
        </form>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.length === 0 && (
          <div className="col-span-full text-center py-20 opacity-50">
            <p className="font-bold text-slate-400">Nenhum lead cadastrado.</p>
          </div>
        )}

        {leads.map((lead) => {
          const telefoneLimpo = (lead.telefone || "").replace(/\D/g, "");
          const waLink = telefoneLimpo ? `https://wa.me/55${telefoneLimpo}` : "#";

          return (
            <div
              key={lead.id}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between h-full"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-3 ${
                  lead.status === "FECHADO"
                    ? "bg-emerald-500"
                    : lead.status === "PERDIDO"
                    ? "bg-red-400"
                    : "bg-blue-500"
                }`}
              />

              <div className="pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-black text-xl text-slate-800 truncate leading-tight">{lead.nome}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-wider">
                      <Calendar size={10} /> {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                      lead.status === "FECHADO"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : lead.status === "PERDIDO"
                        ? "bg-red-50 text-red-500 border-red-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl mb-4 space-y-2">
                  <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" /> {lead.telefone}
                  </p>
                  <p className="text-[10px] font-black text-purple-600 uppercase flex items-center gap-2">
                    {getOrigemIcon(lead.origem || "Outros")} Origem: {lead.origem || "Não informado"}
                  </p>
                </div>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white font-black py-3 rounded-xl hover:bg-emerald-600 transition uppercase text-[10px] tracking-widest shadow-md shadow-emerald-200 mb-4"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>

              <div className="pl-4 mt-auto pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                <div className="flex gap-1">
                  {lead.status !== "FECHADO" && (
                    <form action={updateLeadStatus}>
                      <input type="hidden" name="id" value={lead.id} />
                      <input type="hidden" name="status" value="FECHADO" />
                      <button
                        title="Venda Fechada"
                        className="p-2 rounded-xl bg-slate-50 text-slate-300 hover:text-white hover:bg-emerald-500 transition shadow-sm"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    </form>
                  )}

                  {lead.status !== "PERDIDO" && (
                    <form action={updateLeadStatus}>
                      <input type="hidden" name="id" value={lead.id} />
                      <input type="hidden" name="status" value="PERDIDO" />
                      <button
                        title="Perdido"
                        className="p-2 rounded-xl bg-slate-50 text-slate-300 hover:text-white hover:bg-red-400 transition shadow-sm"
                      >
                        <XCircle size={18} />
                      </button>
                    </form>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/festas/nova?nomeCliente=${encodeURIComponent(lead.nome)}&telefoneCliente=${encodeURIComponent(
                      lead.telefone
                    )}`}
                    className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition shadow-sm flex items-center gap-2 text-[10px] font-black uppercase px-3"
                    title="Gerar Festa"
                  >
                    <PartyPopper size={16} /> <span className="hidden xl:inline">Gerar Festa</span>
                  </Link>

                  <form action={deleteLead}>
                    <input type="hidden" name="id" value={lead.id} />
                    <button
                      className="p-2 rounded-xl bg-slate-50 text-slate-300 hover:text-white hover:bg-red-500 transition shadow-sm"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

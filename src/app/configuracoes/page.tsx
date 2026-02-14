import { prisma } from "@/lib/prisma";
import { createUsuario, updatePermissoes } from "../actions";
import { ShieldCheck, UserPlus, Save, Users, Shield } from "lucide-react";

// Evita prerender no build e garante Prisma em Node (não Edge)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ToggleColor = "blue" | "emerald" | "purple" | "orange" | "yellow" | "pink";

type PermissionToggleProps = {
  label: string;
  name: string;
  checked: boolean;
  color?: ToggleColor;
};

export default async function ConfiguracoesPage() {
  // Busca usuários atualizados do banco
  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white uppercase italic flex items-center gap-3 tracking-tighter">
          <ShieldCheck className="text-emerald-500" size={32} /> Controle de Acesso
        </h1>
        <p className="text-slate-400 font-medium">
          Gerencie credenciais e níveis de permissão da sua equipe.
        </p>
      </header>

      {/* 1. CADASTRO DE USUÁRIO */}
      <section className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <UserPlus size={16} className="text-emerald-500" /> Cadastrar Novo Usuário
        </h2>

        <form action={createUsuario} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
              Nome Completo
            </label>
            <input
              name="nome"
              placeholder="Ex: Ana Souza"
              required
              className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 font-bold text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
              Email (Login)
            </label>
            <input
              name="email"
              type="email"
              placeholder="ana@buffet.com"
              required
              className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 font-bold text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
              Senha
            </label>
            <input
              name="senha"
              type="password"
              placeholder="******"
              required
              className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 font-bold text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
              Cargo / Função
            </label>
            <select
              name="cargo"
              className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 font-bold text-sm text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
              defaultValue="VENDEDOR"
            >
              <option value="VENDEDOR">Vendedor</option>
              <option value="GERENTE">Gerente</option>
              <option value="DONO">Dono (Acesso Total)</option>
              <option value="FREELANCER">Freelancer</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-emerald-600 text-white font-black px-6 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group"
          >
            <Save size={18} className="group-hover:scale-110 transition-transform" /> Salvar Usuário
          </button>
        </form>
      </section>

      {/* 2. LISTA DE EQUIPE */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-2">
          <Users size={16} className="text-emerald-500" /> Equipe e Permissões Ativas
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {usuarios.map((u) => (
            <div
              key={u.id}
              className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 hover:border-emerald-500/30 transition-all duration-300"
            >
              <form action={updatePermissoes}>
                <input type="hidden" name="id" value={u.id} />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Perfil */}
                  <div className="flex items-center gap-4 min-w-[250px]">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-xl shadow-inner">
                      {(u.nome?.substring(0, 1) || "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-white uppercase tracking-tight">{u.nome}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md font-bold">
                          {u.cargo}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{u.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Toggles */}
                  {u.cargo !== "DONO" ? (
                    <div className="flex flex-wrap gap-2">
                      <PermissionToggle label="Leads" name="leads" checked={!!u.podeVerLeads} color="blue" />
                      <PermissionToggle label="Festas" name="festas" checked={!!u.podeVerFestas} color="emerald" />
                      <PermissionToggle label="Agenda" name="calendario" checked={!!u.podeVerCalendario} color="purple" />
                      <PermissionToggle label="Tarefas" name="tarefas" checked={!!u.podeVerTarefas} color="orange" />
                      <PermissionToggle label="Estoque" name="estoque" checked={!!u.podeVerEstoque} color="yellow" />
                      <PermissionToggle label="Financeiro" name="financeiro" checked={!!u.podeVerFinanceiro} color="emerald" />
                      <PermissionToggle label="Relatórios" name="relatorios" checked={!!u.podeVerRelatorios} color="pink" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl uppercase tracking-widest">
                      <Shield size={16} /> Administrador do Sistema (Acesso Total)
                    </div>
                  )}

                  {/* Ação */}
                  {u.cargo !== "DONO" && (
                    <button
                      type="submit"
                      className="bg-white text-slate-950 p-4 rounded-2xl hover:bg-emerald-400 hover:scale-105 transition-all shadow-xl shadow-white/5"
                      title="Aplicar Permissões"
                    >
                      <Save size={20} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente visual melhorado com mapeamento de cores fixas
function PermissionToggle({ label, name, checked, color }: PermissionToggleProps) {
  const colorMap: Record<ToggleColor, string> = {
    blue: "text-blue-400 border-blue-500/20",
    emerald: "text-emerald-400 border-emerald-500/20",
    purple: "text-purple-400 border-purple-500/20",
    orange: "text-orange-400 border-orange-500/20",
    yellow: "text-yellow-400 border-yellow-500/20",
    pink: "text-pink-400 border-pink-500/20",
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-600 transition-all select-none group">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-offset-slate-900 focus:ring-0 cursor-pointer accent-emerald-500"
      />
      <span className={`text-[10px] font-black uppercase tracking-widest ${color ? colorMap[color] : "text-slate-400"}`}>
        {label}
      </span>
    </label>
  );
}

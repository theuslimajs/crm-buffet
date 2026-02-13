import { prisma } from '@/lib/prisma'
import { createUsuario, updatePermissoes } from '../actions'
import { ShieldCheck, UserPlus, Save, Users, Lock } from 'lucide-react'

export default async function ConfiguracoesPage() {
  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: 'asc' } })

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
          <ShieldCheck className="text-purple-600" size={32} /> Controle de Acesso
        </h1>
        <p className="text-slate-500 font-medium">Gerencie quem pode ver e acessar cada parte do sistema.</p>
      </header>

      {/* 1. CRIAR NOVO USUÁRIO */}
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <UserPlus size={16} /> Cadastrar Novo Usuário
        </h2>
        
        <form action={createUsuario} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome</label>
            <input name="nome" placeholder="Ex: Ana Souza" required className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm" />
          </div>
          <div className="md:col-span-1 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email (Login)</label>
            <input name="email" type="email" placeholder="ana@buffet.com" required className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm" />
          </div>
          <div className="md:col-span-1 space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Senha</label>
             <input name="senha" type="password" placeholder="******" required className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm" />
          </div>
          <div className="md:col-span-1 space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Cargo</label>
             <select name="cargo" className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm text-slate-600">
               <option value="VENDEDOR">Vendedor</option>
               <option value="GERENTE">Gerente</option>
               <option value="DONO">Dono (Acesso Total)</option>
               <option value="FREELANCER">Freelancer</option>
             </select>
          </div>
          <button className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2">
            <Save size={16} /> Salvar
          </button>
        </form>
      </div>

      {/* 2. LISTA DE USUÁRIOS E PERMISSÕES */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
          <Users size={16} /> Equipe e Permissões
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {usuarios.map(u => (
            <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-lg transition">
              <form action={updatePermissoes}>
                <input type="hidden" name="id" value={u.id} />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Dados do Usuário */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black">
                      {u.nome.substring(0,1)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{u.nome}</p>
                      <p className="text-xs text-slate-400">{u.cargo} • {u.email}</p>
                    </div>
                  </div>

                  {/* Checkboxes de Permissão */}
                  {u.cargo !== 'DONO' ? (
                    <div className="flex flex-wrap gap-2">
                      <PermissionToggle label="Leads" name="leads" checked={u.podeVerLeads} color="blue" />
                      <PermissionToggle label="Festas" name="festas" checked={u.podeVerFestas} color="emerald" />
                      <PermissionToggle label="Calendário" name="calendario" checked={u.podeVerCalendario} color="purple" />
                      <PermissionToggle label="Tarefas" name="tarefas" checked={u.podeVerTarefas} color="orange" />
                      <PermissionToggle label="Estoque" name="estoque" checked={u.podeVerEstoque} color="yellow" />
                      <PermissionToggle label="Financeiro" name="financeiro" checked={u.podeVerFinanceiro} color="emerald" />
                      <PermissionToggle label="Relatórios" name="relatorios" checked={u.podeVerRelatorios} color="pink" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                      <Lock size={14} /> ACESSO TOTAL (Administrador)
                    </div>
                  )}

                  {/* Botão Salvar (Só aparece se não for Dono, pois Dono já tem tudo) */}
                  {u.cargo !== 'DONO' && (
                    <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-700 transition" title="Salvar Alterações">
                      <Save size={18} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente visual para o "Switch" (Checkbox bonito)
function PermissionToggle({ label, name, checked, color }: any) {
  return (
    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 hover:bg-white hover:border-slate-200 transition select-none">
      <input 
        type="checkbox" 
        name={name} 
        defaultChecked={checked} 
        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer accent-slate-900" 
      />
      <span className={`text-[10px] font-black uppercase tracking-wide text-${color}-600`}>{label}</span>
    </label>
  )
}
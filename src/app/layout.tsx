import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logout } from "./actions";
import { 
  LayoutDashboard, CalendarDays, Target, PackageSearch, 
  Wallet, ListTodo, Calendar, TrendingUp, 
  Settings, LogOut, ShieldCheck, Ticket, Calculator, PlusCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "BuffetPro GM | Gestão 360°",
  description: "ERP de Alta Performance para Eventos",
  manifest: "/manifest.json", // Importante para instalar como App
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BuffetGM",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_user_id")?.value;
  
  // Busca o usuário e suas permissões no banco
  let usuario = null;
  if (sessionId) {
    usuario = await prisma.usuario.findUnique({ where: { id: sessionId } });
  }

  const isLogged = !!usuario;
  const isDono = usuario?.cargo === 'DONO'; // O Dono sempre vê tudo

  // Função auxiliar para checar permissão (Dono OU a flag específica)
  const temAcesso = (permissao: boolean | undefined) => isDono || !!permissao;

  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 min-h-screen font-sans flex text-slate-900 overflow-x-hidden">
        {isLogged && (
          <aside className="w-64 bg-slate-950 text-slate-400 flex-shrink-0 fixed h-full z-30 hidden md:flex flex-col border-r border-slate-800 shadow-2xl no-print">
            
            {/* LOGO E CABEÇALHO */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-900/50">
              <div className="bg-slate-900 p-1 rounded-full border border-slate-700 shadow-sm overflow-hidden w-12 h-12 flex items-center justify-center flex-shrink-0">
                 {/* Certifique-se que a imagem existe em public/images/logo-gm.jpg */}
                 <img src="/images/logo-gm.jpg" alt="GM" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tighter italic leading-tight">
                  BUFFET<span className="text-emerald-500">GM</span>
                </h1>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                  {usuario?.cargo || 'Painel Admin'}
                </p>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6 custom-scrollbar mt-4">
              
              {/* HOME - Visível para todos */}
              <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group mb-4">
                <LayoutDashboard size={18} className="group-hover:text-purple-400" />
                <span className="text-sm font-bold">Visão Geral</span>
              </Link>

              {/* GRUPO: COMERCIAL */}
              {(temAcesso(usuario?.podeVerLeads) || temAcesso(usuario?.podeVerRelatorios)) && (
                <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 mt-4">Comercial</p>
              )}
              
              {temAcesso(usuario?.podeVerLeads) && (
                <Link href="/leads" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group">
                  <Target size={18} className="group-hover:text-blue-400" />
                  <span className="text-sm font-bold">Leads (CRM)</span>
                </Link>
              )}
              
              {temAcesso(usuario?.podeVerRelatorios) && (
                <Link href="/relatorios" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group">
                  <TrendingUp size={18} className="group-hover:text-emerald-400" />
                  <span className="text-sm font-bold">Desempenho</span>
                </Link>
              )}

              {/* GRUPO: OPERACIONAL */}
              {(temAcesso(usuario?.podeVerCalendario) || temAcesso(usuario?.podeVerFestas) || temAcesso(usuario?.podeVerTarefas)) && (
                 <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 mt-8">Operacional</p>
              )}
              
              {temAcesso(usuario?.podeVerCalendario) && (
                <Link href="/calendario" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group">
                  <Calendar size={18} className="group-hover:text-purple-400" />
                  <span className="text-sm font-bold">Calendário Master</span>
                </Link>
              )}

              {temAcesso(usuario?.podeVerFestas) && (
                <>
                  <Link href="/festas" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group">
                    <CalendarDays size={18} className="group-hover:text-emerald-400" />
                    <span className="text-sm font-bold">Agenda de Festas</span>
                  </Link>
                  <Link href="/festas/nova" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group">
                    <PlusCircle size={18} className="group-hover:text-emerald-400" />
                    <span className="text-sm font-bold">Nova Festa</span>
                  </Link>
                  <Link href="/convites" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group">
                    <Ticket size={18} className="group-hover:text-pink-400" />
                    <span className="text-sm font-bold">Convites</span>
                  </Link>
                </>
              )}

              {temAcesso(usuario?.podeVerTarefas) && (
                <Link href="/tarefas" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group">
                  <ListTodo size={18} className="group-hover:text-orange-400" />
                  <span className="text-sm font-bold">Tarefas</span>
                </Link>
              )}

              {/* GRUPO: GESTÃO */}
              {(temAcesso(usuario?.podeVerFinanceiro) || temAcesso(usuario?.podeVerEstoque)) && (
                <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 mt-8">Gestão</p>
              )}
              
              {/* Simulador: Disponível se ver financeiro ou festas */}
              {(temAcesso(usuario?.podeVerFinanceiro) || temAcesso(usuario?.podeVerFestas)) && (
                <Link href="/simulador" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-purple-600/10 text-white border border-purple-600/20 mb-2 shadow-sm">
                  <Calculator size={18} className="text-purple-400" />
                  <span className="text-sm font-bold">Simulador Lucro</span>
                </Link>
              )}

              {temAcesso(usuario?.podeVerFinanceiro) && (
                <Link href="/financeiro" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group">
                  <Wallet size={18} className="group-hover:text-emerald-400" />
                  <span className="text-sm font-bold">Fluxo de Caixa</span>
                </Link>
              )}

              {temAcesso(usuario?.podeVerEstoque) && (
                <Link href="/estoque" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group">
                  <PackageSearch size={18} className="group-hover:text-yellow-400" />
                  <span className="text-sm font-bold">Estoque</span>
                </Link>
              )}

              {/* CONFIGURAÇÕES: Apenas DONO */}
              {isDono && (
                <Link href="/configuracoes" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition group">
                  <ShieldCheck size={18} className="group-hover:text-purple-400" />
                  <span className="text-sm font-bold">Configurações</span>
                </Link>
              )}

            </nav>

            <div className="p-6 border-t border-slate-900 bg-slate-950/80">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-white font-black text-[10px] shadow-lg">
                  {usuario?.nome?.substring(0,2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">{usuario?.nome}</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{usuario?.email}</p>
                </div>
              </div>
              <form action={logout}>
                <button className="flex items-center gap-2 px-2 py-2 text-[9px] font-black text-red-500/70 hover:text-red-500 uppercase tracking-widest w-full text-left transition">
                  <LogOut size={14} /> Sair do Sistema
                </button>
              </form>
            </div>
          </aside>
        )}
        <main className={`${isLogged ? 'md:ml-64' : 'w-full'} flex-1 p-6 lg:p-12 min-h-screen transition-all duration-300`}>
          {children}
        </main>
      </body>
    </html>
  );
}
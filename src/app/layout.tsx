import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  PartyPopper,
  DollarSign,
  Package,
  CalendarCheck,
  Calculator,
  Settings,
  LogOut,
  ChevronRight,
  ClipboardList,
  Target,
} from "lucide-react";
import { logout } from "./actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buffet GM - Gestão",
  description: "Sistema de Gestão CRM/ERP para Buffet",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex`}>
        {/* SIDEBAR */}
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-2xl">
          <div className="p-6 border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
                <span className="font-black text-white text-lg italic uppercase">GM</span>
              </div>
              <div>
                <h1 className="font-bold text-white tracking-tight leading-tight">BUFFET GM</h1>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest text-xs">
                  Sistema ERP
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
            <div className="mb-6">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Comercial (CRM)
              </p>
              <MenuLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <MenuLink href="/leads" icon={<Target size={18} />} label="Leads & Vendas" />
              <MenuLink href="/clientes" icon={<Users size={18} />} label="Meus Clientes" />
            </div>

            <div className="mb-6">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Operacional
              </p>
              <MenuLink href="/festas" icon={<PartyPopper size={18} />} label="Festas & Eventos" />
              <MenuLink href="/calendario" icon={<CalendarCheck size={18} />} label="Agenda Geral" />
              <MenuLink href="/tarefas" icon={<ClipboardList size={18} />} label="Checklist Tarefas" />
              <MenuLink href="/estoque" icon={<Package size={18} />} label="Estoque Central" />
            </div>

            <div className="mb-6">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Financeiro
              </p>
              <MenuLink href="/financeiro" icon={<DollarSign size={18} />} label="Fluxo de Caixa" />
              <MenuLink href="/relatorios" icon={<ClipboardList size={18} />} label="Relatórios" />
            </div>

            <div className="mb-4">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Apoio
              </p>

              <Link
                href="/simulador"
                className="flex items-center justify-between px-4 py-3 text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-xl transition-all hover:bg-emerald-500/10 group mb-1"
              >
                <div className="flex items-center gap-3">
                  <Calculator size={18} />
                  <span className="font-bold text-sm">Simulador de Lucro</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-1" />
              </Link>

              <MenuLink href="/configuracoes" icon={<Settings size={18} />} label="Configurações" />
            </div>
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-white hover:bg-red-500/20 p-3 rounded-xl transition-all font-black text-xs group ring-1 ring-red-500/20"
              >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                ENCERRAR SESSÃO
              </button>
            </form>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <main className="flex-1 ml-64 min-h-screen bg-slate-50 relative flex flex-col">
          <div className="p-8 max-w-[1600px] w-full mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all group"
    >
      <div className="flex items-center gap-3">
        <span className="group-hover:text-emerald-400 transition-colors">{icon}</span>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <ChevronRight size={12} className="opacity-0 group-hover:opacity-30 transition-all -translate-x-2 group-hover:translate-x-0" />
    </Link>
  );
}

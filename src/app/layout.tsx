import type { Metadata } from "next";
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
  LogOut 
} from "lucide-react"; 
import { logout } from "./actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buffet GM - Gestão",
  description: "Sistema de Gestão CRM/ERP para Buffet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex`}>
        
        {/* --- SIDEBAR FIXA --- */}
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-2xl">
          
          {/* LOGO */}
          <div className="p-6 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-black text-white text-lg">GM</span>
              </div>
              <div>
                <h1 className="font-bold text-white tracking-tight leading-tight">BUFFET GM</h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Gestão Profissional</p>
              </div>
            </div>
          </div>

          {/* LINKS DE NAVEGAÇÃO */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-2">Visão Geral</p>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link href="/leads" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <Users size={20} />
              <span className="font-medium">Leads (CRM)</span>
            </Link>

            <Link href="/festas" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <PartyPopper size={20} />
              <span className="font-medium">Festas & Agenda</span>
            </Link>

            <div className="my-4 border-t border-slate-800/50 mx-4"></div>

            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Administração</p>

            <Link href="/financeiro" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <DollarSign size={20} />
              <span className="font-medium">Financeiro</span>
            </Link>

            <Link href="/estoque" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <Package size={20} />
              <span className="font-medium">Estoque</span>
            </Link>

            <Link href="/tarefas" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <CalendarCheck size={20} />
              <span className="font-medium">Tarefas</span>
            </Link>

            <div className="my-4 border-t border-slate-800/50 mx-4"></div>

            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ferramentas</p>

            <Link href="/simulador" className="flex items-center gap-3 px-4 py-3 text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-xl transition-all">
              <Calculator size={20} />
              <span className="font-bold">Simulador Lucro</span>
            </Link>

            <Link href="/configuracoes" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <Settings size={20} />
              <span className="font-medium">Configurações</span>
            </Link>

          </nav>

          {/* BOTÃO LOGOUT */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <form action={logout}>
              <button className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-white hover:bg-red-500/20 p-3 rounded-xl transition-all font-bold text-sm group">
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                SAIR
              </button>
            </form>
          </div>
        </aside>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        {/* ml-64 é obrigatório para o conteúdo não ficar escondido atrás da sidebar */}
        <main className="flex-1 ml-64 p-8 min-h-screen bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}
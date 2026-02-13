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
} from "lucide-react"; // Importando todos os ícones necessários
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
        
        {/* --- SIDEBAR (MENU LATERAL FIXO) --- */}
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-2xl">
          
          {/* LOGO DA EMPRESA */}
          <div className="p-6 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="font-black text-white text-lg">GM</span>
              </div>
              <div>
                <h1 className="font-bold text-white tracking-tight leading-tight">BUFFET GM</h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Painel Administrativo</p>
              </div>
            </div>
          </div>

          {/* ÁREA DE NAVEGAÇÃO */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
            
            {/* GRUPO: PRINCIPAL */}
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-2">Visão Geral</p>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all group">
              <LayoutDashboard className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link href="/leads" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all group">
              <Users className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
              <span className="font-medium">Leads (CRM)</span>
            </Link>

            <Link href="/festas" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all group">
              <PartyPopper className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
              <span className="font-medium">Festas & Agenda</span>
            </Link>

            {/* LINHA SEPARADORA */}
            <div className="my-4 border-t border-slate-800/50"></div>

            {/* GRUPO: GESTÃO */}
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Gestão</p>

            <Link href="/financeiro" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all group">
              <DollarSign className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
              <span className="font-medium">Financeiro</span>
            </Link>

            <Link href="/estoque" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all group">
              <Package className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
              <span className="font-medium">Estoque</span>
            </Link>

            <Link href="/tarefas" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all group">
              <CalendarCheck className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
              <span className="font-medium">Tarefas</span>
            </Link>

            {/* LINHA SEPARADORA */}
            <div className="my-4 border-t border-slate-800/50"></div>

            {/* GRUPO: FERRAMENTAS */}
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ferramentas</p>

            <Link href="/simulador" className="flex items-center gap-3 px-4 py-3 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-xl transition-all shadow-sm">
              <Calculator className="w-5 h-5" />
              <span className="font-bold">Simulador Lucro</span>
            </Link>

            <Link href="/configuracoes" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all group">
              <Settings className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
              <span className="font-medium">Configurações</span>
            </Link>

          </nav>

          {/* BOTÃO DE SAIR */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <form action={logout}>
              <button className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 p-3 rounded-xl transition-all font-bold text-sm group">
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                SAIR DO SISTEMA
              </button>
            </form>
          </div>
        </aside>

        {/* --- ÁREA DE CONTEÚDO PRINCIPAL --- */}
        {/* ml-64 empurra o conteúdo para a direita para não ficar embaixo do menu */}
        <main className="flex-1 ml-64 min-h-screen bg-slate-950">
          {children}
        </main>

      </body>
    </html>
  );
}
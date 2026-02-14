"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { enviarConviteWpp } from "../actions";
import { Ticket, Download, Send, RefreshCw, Type, Image as ImageIcon, Palette } from "lucide-react";

type FestaSelecionada = {
  nomeAniversariante: string;
  dataFesta: string;
  horaInicio: string;
  local: string;
};

type Tema = { nome: string; arquivo: string };

function roundRectCompat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  // Fallback caso roundRect não exista
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export default function ConvitesPage() {
  const temas: Tema[] = [
    { nome: "Padrão", arquivo: "/images/convites/tema-padrao1.jpg" },
    { nome: "Cinema", arquivo: "/images/convites/tema-cinema.jpg" },
    { nome: "Futebol", arquivo: "/images/convites/tema-fut1.jpg" },
    { nome: "Patrulha", arquivo: "/images/convites/tema-patrulha.jpg" },
    { nome: "Princesas", arquivo: "/images/convites/tema-princesas.jpg" },
  ];

  const [temaSelecionado, setTemaSelecionado] = useState<string>(temas[0].arquivo);
  const [loading, setLoading] = useState(false);

  const [festaSelecionada, setFestaSelecionada] = useState<FestaSelecionada>({
    nomeAniversariante: "",
    dataFesta: "",
    horaInicio: "",
    local: "Buffet GM",
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const desenharConvite = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Tamanho Stories
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = "anonymous"; // ajuda se algum dia você trocar por imagens externas
    img.src = temaSelecionado;

    const renderizarTexto = () => {
      // Reset de sombras antes de começar (evita “vazar” pro resto)
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Título
      ctx.fillStyle = "#1e293b";
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 15;
      ctx.font = "bold 80px sans-serif";
      ctx.textAlign = "center";

      const nome = festaSelecionada.nomeAniversariante || "Nome do Aniversariante";
      ctx.fillText(nome, width / 2, 600);

      // Subtítulo
      ctx.font = "italic 50px sans-serif";
      ctx.fillStyle = "#334155";
      ctx.fillText("Convida você para essa festa!", width / 2, 700);

      // Box
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

      // roundRect compatível
      if ("roundRect" in ctx) {
        // @ts-ignore - roundRect não está tipado em algumas libs
        ctx.beginPath();
        // @ts-ignore
        ctx.roundRect(width / 2 - 300, 850, 600, 280, 40);
        ctx.fill();
      } else {
        roundRectCompat(ctx, width / 2 - 300, 850, 600, 280, 40);
        ctx.fill();
      }

      // Borda
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Data
      const dataTexto = festaSelecionada.dataFesta
        ? new Date(`${festaSelecionada.dataFesta}T12:00:00`).toLocaleDateString("pt-BR")
        : "00/00/0000";

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 90px sans-serif";
      ctx.fillText(dataTexto, width / 2, 980);

      const horaTexto = festaSelecionada.horaInicio || "--:--";
      ctx.font = "50px sans-serif";
      ctx.fillStyle = "#475569";
      ctx.fillText(`${horaTexto}h`, width / 2, 1060);

      // Local
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.font = "bold 60px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`LOCAL: ${festaSelecionada.local?.toUpperCase() || "BUFFET GM"}`, width / 2, 1400);

      setPreviewUrl(canvas.toDataURL("image/png"));
    };

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      renderizarTexto();
    };

    img.onerror = () => {
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = "center";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "40px sans-serif";
      ctx.fillText("Imagem não encontrada:", width / 2, height / 2 - 50);
      ctx.fillText(temaSelecionado, width / 2, height / 2 + 50);

      renderizarTexto();
    };
  }, [temaSelecionado, festaSelecionada.nomeAniversariante, festaSelecionada.dataFesta, festaSelecionada.horaInicio, festaSelecionada.local]);

  useEffect(() => {
    const timer = setTimeout(desenharConvite, 50);
    return () => clearTimeout(timer);
  }, [desenharConvite]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `convite-${festaSelecionada.nomeAniversariante || "festa"}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handleEnviarWpp = async () => {
    if (!previewUrl) return;
    setLoading(true);
    try {
      await enviarConviteWpp("simulacao-manual", previewUrl);
      alert("Convite gerado! (Envio real depende da sua API/integração.)");
    } catch (e) {
      console.error(e);
      alert("Falha ao enviar. Verifique sua action/API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
          <Ticket className="text-pink-500" size={32} /> Criador de Convites
        </h1>
        <p className="text-slate-500 font-medium">Personalize e envie convites temáticos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CONTROLES */}
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm h-fit space-y-6">
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Palette size={16} /> Escolha o Tema
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {temas.map((tema) => (
                <button
                  key={tema.arquivo}
                  onClick={() => setTemaSelecionado(tema.arquivo)}
                  type="button"
                  className={`p-2 rounded-xl text-[10px] font-bold border-2 transition ${
                    temaSelecionado === tema.arquivo
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-slate-100 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {tema.nome}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Type size={16} /> Dados do Convite
            </h2>

            <div className="space-y-3">
              <input
                placeholder="Nome do Aniversariante"
                className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-sm"
                value={festaSelecionada.nomeAniversariante}
                onChange={(e) =>
                  setFestaSelecionada((prev) => ({ ...prev, nomeAniversariante: e.target.value }))
                }
              />

              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-sm text-slate-600"
                  value={festaSelecionada.dataFesta}
                  onChange={(e) => setFestaSelecionada((prev) => ({ ...prev, dataFesta: e.target.value }))}
                />
                <input
                  type="time"
                  className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-sm text-slate-600"
                  value={festaSelecionada.horaInicio}
                  onChange={(e) =>
                    setFestaSelecionada((prev) => ({ ...prev, horaInicio: e.target.value }))
                  }
                />
              </div>

              <button
                onClick={desenharConvite}
                type="button"
                className="w-full bg-slate-900 text-white font-black py-3 rounded-xl text-xs uppercase hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCw size={14} /> Atualizar Preview
              </button>
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="lg:col-span-2 flex flex-col items-center gap-6">
          <div className="relative shadow-2xl rounded-3xl overflow-hidden border-4 border-slate-900 bg-slate-800">
            <canvas ref={canvasRef} className="hidden" />

            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-[600px] w-auto object-contain" />
            ) : (
              <div className="h-[600px] w-[340px] flex flex-col items-center justify-center text-slate-500">
                <ImageIcon size={48} className="opacity-20 mb-2" />
                <span className="text-xs font-bold opacity-50">Carregando tema...</span>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                type="button"
                className="bg-white text-slate-900 border border-slate-200 font-black px-6 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
              >
                <Download size={18} /> Baixar
              </button>

              <button
                onClick={handleEnviarWpp}
                disabled={loading}
                type="button"
                className="bg-emerald-500 text-white font-black px-6 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={18} /> {loading ? "Enviando..." : "Enviar WhatsApp"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

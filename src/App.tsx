/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Award,
  ShieldCheck,
  Activity,
  Sun,
  Compass,
  Target,
  Cpu,
  Users,
  Building,
  Calculator,
  Shield,
  FileSpreadsheet,
  Wallet,
  Terminal,
  LineChart,
  MessageSquare,
  Send,
  X,
  FileText,
  Mail,
  ArrowRight,
  BookOpen,
  Home,
  Layers,
  Sparkles,
  CheckCircle,
  Database
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  goal: string;
  details: string;
  date: string;
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export default function App() {
  // Simulator State
  const [imovelValor, setImovelValor] = useState<number>(1000000);
  const [vendasAno, setVendasAno] = useState<number>(6);

  // Property Physics Form State
  const [localizacao, setLocalizacao] = useState<string>("Porto Alegre - Bairro Nobre");
  const [area, setArea] = useState<number>(120);
  const [orientacaoSolar, setOrientacaoSolar] = useState<string>("Norte (Excelente)");
  const [tipoImovel, setTipoImovel] = useState<string>("Apartamento Residencial");
  const [detalhesExtras, setDetalhesExtras] = useState<string>("");
  const [proprietarioNome, setProprietarioNome] = useState<string>("");
  const [proprietarioEmail, setProprietarioEmail] = useState<string>("");
  
  // Property Physics Report Modal/Display State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationReport, setEvaluationReport] = useState<string | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  // Contact / Lead Form State
  const [contatoNome, setContatoNome] = useState<string>("");
  const [contatoWhatsapp, setContatoWhatsapp] = useState<string>("");
  const [contatoObjetivo, setContatoObjetivo] = useState<string>("Quero me inscrever no Curso para Corretores (A Física da Venda)");
  const [contatoMensagem, setContatoMensagem] = useState<string>("");
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [leadSuccessMsg, setLeadSuccessMsg] = useState<string | null>(null);

  // Active Leads Dashboard State (Admin)
  const [activeLeads, setActiveLeads] = useState<Lead[]>([]);
  const [showLeadsDashboard, setShowLeadsDashboard] = useState<boolean>(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState<boolean>(false);

  // Chat with Max state
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Olá! Sou Max Mazewski, o seu Mentor Imobiliário. Com minha gravata borboleta verde-lima, trago a ciência exata para o seu patrimônio. Como posso te alavancar hoje?"
    }
  ]);
  const [isSendingToChat, setIsSendingToChat] = useState<boolean>(false);

  // Currency Formatter helper
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    });
  };

  // Commission and Asset Allocation Calculations
  const comissaoEstimada = imovelValor * vendasAno * 0.06;
  const alocacaoSugerida = comissaoEstimada * 0.8;

  // Fetch active leads from backend (to show durable integration)
  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setActiveLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Erro ao carregar leads:", err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (showLeadsDashboard) {
      fetchLeads();
    }
  }, [showLeadsDashboard]);

  // Handle property evaluation submission
  const handleEvaluateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proprietarioNome || !proprietarioEmail) {
      alert("Por favor, preencha o seu nome e email para a avaliação.");
      return;
    }

    setIsEvaluating(true);
    setEvaluationReport(null);
    setEvaluationError(null);

    try {
      const res = await fetch("/api/gemini/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          neighborhood: localizacao,
          area: area,
          sunDirection: orientacaoSolar,
          type: tipoImovel,
          details: detalhesExtras
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro desconhecido ao gerar laudo.");
      }

      const data = await res.json();
      setEvaluationReport(data.report);

      // Save as lead automatically
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: proprietarioNome,
          whatsapp: `E-mail: ${proprietarioEmail}`,
          goal: "Avaliação Técnica de Imóvel B2C",
          details: `Imóvel: ${tipoImovel}, Área: ${area}m², Localização: ${localizacao}, Sol: ${orientacaoSolar}`
        })
      });
      fetchLeads();

    } catch (err: any) {
      setEvaluationError(err.message || "Não foi possível gerar o laudo. Verifique sua GEMINI_API_KEY.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle contact lead submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contatoNome || !contatoWhatsapp) {
      alert("Por favor, preencha o seu nome e número de WhatsApp.");
      return;
    }

    setIsSubmittingLead(true);
    setLeadSuccessMsg(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contatoNome,
          whatsapp: contatoWhatsapp,
          goal: contatoObjetivo,
          details: contatoMensagem || "Nenhum detalhe adicional."
        })
      });

      if (res.ok) {
        setLeadSuccessMsg("Declaração de interesse registrada com sucesso! Max entrará em contato em breve via WhatsApp.");
        setContatoNome("");
        setContatoWhatsapp("");
        setContatoMensagem("");
        fetchLeads();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Falha ao registrar lead.");
      }
    } catch (err: any) {
      alert("Erro ao registrar interesse: " + err.message);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Send message to Max (Gemini Chat)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();
    setChatMessage("");
    
    // Optimistically update UI
    const updatedHistory = [...chatHistory, { role: "user" as const, text: userMsg }];
    setChatHistory(updatedHistory);
    setIsSendingToChat(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory.slice(-6) // Send last 6 turns to keep context short and fast
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Falha ao receber resposta do Mentor.");
      }

      const data = await res.json();
      setChatHistory([...updatedHistory, { role: "model" as const, text: data.response }]);
    } catch (err: any) {
      setChatHistory([
        ...updatedHistory,
        { 
          role: "model" as const, 
          text: `[Mensagem do Sistema]: ${err.message || "Erro de conexão. Certifique-se de configurar a chave GEMINI_API_KEY no menu de Secrets para habilitar a inteligência do Mentor."}` 
        }
      ]);
    } finally {
      setIsSendingToChat(false);
    }
  };

  return (
    <div id="app-container" className="glow-bg text-gray-100 min-h-screen font-sans selection:bg-[#CCFF00] selection:text-black">
      
      {/* Decoração Artística do Background */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#CCFF00] rounded-full mix-blend-difference opacity-15 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-200px] w-[600px] h-[600px] bg-[#CCFF00] rounded-full mix-blend-difference opacity-5 blur-[160px] pointer-events-none"></div>

      {/* Header */}
      <header id="app-header" className="h-20 px-4 sm:px-12 flex items-center justify-between border-b border-white/10 z-50 sticky top-0 bg-[#0B0B0B]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Gravata Borboleta Artística SVG */}
          <div className="w-10 h-10 bg-[#CCFF00] text-black rounded-lg flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(204,255,0,0.4)]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H4zm14 0c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-2zm-6 3c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </div>
          <div>
            <span className="text-lg font-black tracking-tighter uppercase block text-white">
              MENTOR <span className="text-[#CCFF00]">IMOBILIÁRIO</span>
            </span>
            <span className="text-[10px] text-[#CCFF00] tracking-widest font-bold uppercase block -mt-1 font-mono">
              Max Mazewski • CRECI 42.453
            </span>
          </div>
        </div>

        <nav className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-white/50">
          <a href="#metodo" className="hover:text-[#CCFF00] transition-colors">O Método</a>
          <a href="#corretores" className="hover:text-[#CCFF00] transition-colors">Para Corretores</a>
          <a href="#proprietarios" className="hover:text-[#CCFF00] transition-colors">Para Proprietários</a>
          <a href="#autoridade" className="hover:text-[#CCFF00] transition-colors">A Autoridade</a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowLeadsDashboard(!showLeadsDashboard)} 
            className="hidden sm:flex items-center gap-2 border border-white/10 hover:border-[#CCFF00] text-white/70 hover:text-[#CCFF00] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            <Database className="w-4 h-4" />
            <span>{showLeadsDashboard ? "Ocultar Leads" : "Painel Leads"}</span>
          </button>

          <a 
            href="#contato" 
            className="bg-[#CCFF00] text-black hover:bg-white hover:text-black px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-colors shadow-[0_4px_14px_rgba(204,255,0,0.3)]"
          >
            Falar com o Mentor
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="relative border-b border-white/10 overflow-hidden py-16 lg:py-28 px-4 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
          
          <div className="flex-1 text-left">
            <div className="inline-block px-3 py-1 bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-widest mb-6">
              MÉTODO EXCLUSIVO: ECOSSISTEMA TRIÂNGULO
            </div>
            
            <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.85]">
              SUBSTITUA O AMADORISMO PELA <br/>
              <span className="text-transparent stroke-text font-black" style={{ WebkitTextStroke: "1px white" }}>FÍSICA DA</span><br/>
              <span className="text-[#CCFF00] text-neon-glow">VENDA.</span>
            </h1>
            
            <p className="text-lg text-white/70 max-w-xl font-light leading-relaxed mb-10">
              Conectamos tecnologia de precisão financeira ao mercado imobiliário físico. Treinamentos científicos de escala digital para corretores e análises físicas exclusivas com proteção de preço para proprietários.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a 
                href="#corretores" 
                className="bg-white text-black hover:bg-[#CCFF00] text-center px-8 py-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Para Corretores
              </a>
              <a 
                href="#proprietarios" 
                className="border border-white/20 hover:border-[#CCFF00] text-white hover:bg-white/5 text-center px-8 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Avaliar Meu Imóvel
              </a>
            </div>
          </div>

          <div className="w-full lg:w-[45%] flex flex-col gap-6">
            {/* Visual Premium Preview Card - Estilo Artistic Flair */}
            <div className="p-8 bg-[#111] border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="text-[#CCFF00] font-mono text-xs block text-right font-bold">+128% Conversão</span>
                <span className="text-[9px] text-white/40 uppercase block text-right">Escala por Software</span>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#CCFF00]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Alavancagem Ativa</h4>
                  <p className="text-xs text-white/50">Mapeamento em tempo real de Porto Alegre</p>
                </div>
              </div>

              {/* Grafico com barras simples */}
              <div className="h-32 flex items-end gap-3 mt-4 border-b border-white/10 pb-2">
                <div className="flex-1 bg-white/5 rounded-t h-[40%] flex items-center justify-center group relative cursor-help">
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black border border-white/10 px-2 py-1 rounded text-[9px] text-white transition-opacity font-mono">R$4.2M</span>
                </div>
                <div className="flex-1 bg-white/5 rounded-t h-[55%] flex items-center justify-center group relative cursor-help">
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black border border-white/10 px-2 py-1 rounded text-[9px] text-white transition-opacity font-mono">R$5.8M</span>
                </div>
                <div className="flex-1 bg-white/10 rounded-t h-[75%] flex items-center justify-center group relative cursor-help">
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black border border-white/10 px-2 py-1 rounded text-[9px] text-white transition-opacity font-mono">R$7.1M</span>
                </div>
                <div className="flex-1 bg-[#CCFF00] rounded-t h-[95%] flex items-center justify-center group relative cursor-help shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black border border-[#CCFF00] px-2 py-1 rounded text-[9px] text-[#CCFF00] transition-opacity font-mono">R$10.4M</span>
                </div>
                <div className="flex-1 bg-white/10 rounded-t h-[65%] flex items-center justify-center group relative cursor-help">
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black border border-white/10 px-2 py-1 rounded text-[9px] text-white transition-opacity font-mono">R$6.5M</span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-mono mt-2">
                <span>ZONA SUL</span>
                <span>ZONA NORTE</span>
                <span>MENINO DEUS</span>
                <span>MOINHOS DE VENTO</span>
                <span>CENTRO NOBRE</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                <div className="text-xl font-bold text-[#CCFF00] font-mono">CRECI</div>
                <div className="text-[10px] text-white/40 uppercase font-black">42.453</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                <div className="text-xl font-bold text-white font-mono">100%</div>
                <div className="text-[10px] text-white/40 uppercase font-black">Física Solar</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                <div className="text-xl font-bold text-[#CCFF00] font-mono">80%</div>
                <div className="text-[10px] text-white/40 uppercase font-black">Renda Passiva</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Leads Active Dashboard (Durable Cloud/Memory integration) */}
      {showLeadsDashboard && (
        <section id="leads-dashboard" className="py-12 px-4 sm:px-12 bg-[#161616] border-b border-white/10 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#CCFF00] text-black flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tighter uppercase text-white">Leads Registrados no Ecossistema</h3>
                  <p className="text-xs text-white/40">Demonstração ativa da persistência e armazenamento de contatos reais</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={fetchLeads} 
                  className="px-3 py-1 bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 rounded transition"
                  disabled={isLoadingLeads}
                >
                  {isLoadingLeads ? "Sincronizando..." : "Sincronizar Banco"}
                </button>
                <button 
                  onClick={() => setShowLeadsDashboard(false)} 
                  className="p-1 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isLoadingLeads ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CCFF00] mx-auto mb-4"></div>
                <p className="text-sm text-white/40">Consultando banco de dados...</p>
              </div>
            ) : activeLeads.length === 0 ? (
              <div className="text-center py-10 text-white/40 text-sm border border-dashed border-white/10 rounded-xl">
                Nenhum lead registrado no momento. Preencha os formulários de contato ou avaliação abaixo para testar!
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLeads.map((lead) => (
                  <div key={lead.id} className="p-5 bg-black/50 border border-white/10 rounded-xl hover:border-[#CCFF00]/40 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black uppercase tracking-widest bg-[#CCFF00] text-black px-2 py-0.5 rounded font-mono">
                        {lead.goal.split(" ").slice(0, 2).join(" ")}
                      </span>
                      <span className="text-[10px] text-white/30 font-mono">
                        {new Date(lead.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <h5 className="font-bold text-white text-base mb-1">{lead.name}</h5>
                    <p className="text-xs text-[#CCFF00] font-mono font-bold mb-3">{lead.whatsapp}</p>
                    <div className="text-xs text-white/60 bg-white/5 p-3 rounded border border-white/5 max-h-24 overflow-y-auto">
                      <strong>Interesse:</strong> {lead.goal} <br />
                      <strong>Detalhes:</strong> {lead.details}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* O Método Triângulo da Alavancagem */}
      <section id="metodo" className="py-24 border-b border-white/10 relative px-4 sm:px-12 bg-black/45">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-bold text-[#CCFF00] uppercase tracking-widest font-mono block mb-2">
              CIÊNCIA E MATEMÁTICA APLICADA
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white mb-6">
              O TRIÂNGULO DA ALAVANCAGEM PATRIMONIAL
            </h2>
            <p className="text-white/60 font-light leading-relaxed">
              Desenvolvido sob as premissas de Naval Ravikant, Alex Hormozi e Warren Buffett, o nosso método não opera por palpites. É uma engrenagem integrada de três vértices inabaláveis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Pilar 1 */}
            <div className="card-premium p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Cpu className="w-24 h-24 text-[#CCFF00]" />
              </div>
              <div className="w-10 h-10 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-xl flex items-center justify-center text-[#CCFF00] font-black text-lg mb-6">
                01
              </div>
              <h4 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">ALAVANCAGEM POR SOFTWARE</h4>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Através de ferramentas proprietárias (Aplicativo Financeiro Integrado + Desafio de 7 dias), automatizamos e qualificamos a captação de leads. O software trabalha ininterruptamente, sem custo físico de escala, identificando investidores qualificados.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-[#CCFF00] uppercase tracking-wider font-mono">
                <span>Escala sem Limites</span>
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="card-premium p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-24 h-24 text-[#CCFF00]" />
              </div>
              <div className="w-10 h-10 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-xl flex items-center justify-center text-[#CCFF00] font-black text-lg mb-6">
                02
              </div>
              <h4 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">GESTÃO DE EXPECTATIVAS</h4>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                A maioria erra ao vender focando na "dor" imediata. Nós mapeamos as expectativas reais de futuro e patrimônio (Morgan Housel), conectando o imóvel certo ao destino e blindagem patrimonial que o cliente planeja de verdade.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-[#CCFF00] uppercase tracking-wider font-mono">
                <span>Psicologia do Investidor</span>
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="card-premium p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Building className="w-24 h-24 text-[#CCFF00]" />
              </div>
              <div className="w-10 h-10 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-xl flex items-center justify-center text-[#CCFF00] font-black text-lg mb-6">
                03
              </div>
              <h4 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">ATIVOS DE ALTO PADRÃO</h4>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Conversão em imóveis com localização rigidamente avaliada, alta insolação norte e dinâmica de ventos superior. O destino do lucro é a renda passiva blindada em Renda Fixa IPCA+ e fundos imobiliários estrategicamente selecionados.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-[#CCFF00] uppercase tracking-wider font-mono">
                <span>Blindagem Real</span>
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Seção Corretores B2B + Simulador */}
      <section id="corretores" className="py-24 border-b border-white/10 px-4 sm:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7">
              <div className="inline-block px-3 py-1 bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-widest mb-6 font-mono">
                CURSO DIGITAL B2B
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white mb-8 leading-tight">
                A FÍSICA DA VENDA <br />
                <span className="text-transparent stroke-text" style={{ WebkitTextStroke: "1px white" }}>IMOBILIÁRIA.</span>
              </h2>
              
              <p className="text-white/70 mb-8 font-light leading-relaxed text-base sm:text-lg">
                O mercado está saturado de corretores genéricos que agem como meros abridores de portas. Este treinamento serve para transformar o Corretor num especialista absoluto em avaliação técnica do produto e psicologia do investidor.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[#CCFF00]/10 rounded-lg flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Ângulo e Radiação Solar</h5>
                    <p className="text-xs text-white/50 mt-1">Domine o cálculo de conforto térmico para apresentar vantagens físicas inquestionáveis aos compradores.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[#CCFF00]/10 rounded-lg flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Microzonas Privilegiadas</h5>
                    <p className="text-xs text-white/50 mt-1">Como identificar locais imunes à depreciação de mercado usando o conceito de fosso econômico de Warren Buffett.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[#CCFF00]/10 rounded-lg flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Mapeamento de Futuro</h5>
                    <p className="text-xs text-white/50 mt-1">Técnicas sofisticadas para decifrar a blindagem e o planejamento patrimonial da família do cliente de forma consultiva.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[#CCFF00]/10 rounded-lg flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">IA e Escala de Mídia</h5>
                    <p className="text-xs text-white/50 mt-1">Utilize nossa infraestrutura de funil com software inteligente para atrair leads de alta renda e qualificar contatos.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a 
                  href="#contato"
                  onClick={() => {
                    setContatoObjetivo("Quero me inscrever no Curso para Corretores (A Física da Venda)");
                    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-[#CCFF00] text-black hover:bg-white text-xs font-black uppercase tracking-widest px-6 py-4.5 rounded transition-colors inline-block"
                >
                  Quero Garantir Minha Vaga
                </a>
                <span className="text-xs text-white/40 font-mono">Últimas vagas com preço promocional</span>
              </div>
            </div>

            {/* Simulador Interativo */}
            <div className="lg:col-span-5">
              <div className="p-8 bg-[#111] border border-[#CCFF00]/25 rounded-2xl relative overflow-hidden shadow-[0_15px_40px_rgba(204,255,0,0.06)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/5 rounded-full blur-2xl"></div>
                
                <h4 className="text-lg font-black uppercase tracking-tighter text-white mb-2 flex items-center gap-2">
                  <Calculator className="text-[#CCFF00] w-5 h-5" /> SIMULADOR DE ALAVANCAGEM
                </h4>
                <p className="text-xs text-white/50 mb-8">
                  Calcule o potencial de faturamento anual aplicando as técnicas de fechamento de alto padrão do mentor.
                </p>

                <div className="space-y-6">
                  {/* Slider 1 */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider block mb-2">
                      <span className="text-white/70">Valor Médio do Imóvel</span>
                      <span className="text-[#CCFF00] font-mono">{formatCurrency(imovelValor)}</span>
                    </div>
                    <input 
                      type="range" 
                      min={500000} 
                      max={5000000} 
                      step={100000} 
                      value={imovelValor}
                      onChange={(e) => setImovelValor(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]" 
                    />
                    <div className="flex justify-between text-[10px] text-white/30 font-mono mt-1">
                      <span>R$ 500k</span>
                      <span>R$ 5.0M</span>
                    </div>
                  </div>

                  {/* Slider 2 */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider block mb-2">
                      <span className="text-white/70">Fechamentos ao Ano</span>
                      <span className="text-[#CCFF00] font-mono">{vendasAno} {vendasAno === 1 ? "venda" : "vendas"}</span>
                    </div>
                    <input 
                      type="range" 
                      min={1} 
                      max={24} 
                      step={1} 
                      value={vendasAno}
                      onChange={(e) => setVendasAno(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]" 
                    />
                    <div className="flex justify-between text-[10px] text-white/30 font-mono mt-1">
                      <span>1 venda</span>
                      <span>24 vendas</span>
                    </div>
                  </div>

                  {/* Resultados */}
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-white/50 uppercase tracking-widest font-mono">Sua comissão estimada (6%):</span>
                      <span className="text-[#CCFF00] text-[9px] font-black uppercase tracking-widest bg-[#CCFF00]/10 px-2 py-0.5 rounded">Exclusiva</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-[#CCFF00] font-mono tracking-tighter mb-4 text-neon-glow">
                      {formatCurrency(comissaoEstimada)} <span className="text-xs text-white/50">/ano</span>
                    </div>
                    
                    <div className="border-t border-white/5 pt-4">
                      <span className="text-xs text-white/50 block mb-1 uppercase tracking-widest font-mono">Alocação Sugerida em Renda Passiva (80%):</span>
                      <span className="text-xl font-black text-white font-mono tracking-tighter">
                        {formatCurrency(alocacaoSugerida)}
                      </span>
                      <span className="text-[10px] text-white/40 block mt-1.5 leading-relaxed">
                        Aportes sugeridos em Renda Fixa IPCA+ e FIIs estruturados para estabelecer liquidez perpétua pós-transação.
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Seção Proprietários B2C + Gerador de Laudo IA Real */}
      <section id="proprietarios" className="py-24 border-b border-white/10 px-4 sm:px-12 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Formulário Interativo que gera Laudo Real do Gemini */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="p-8 bg-[#111] border border-white/10 rounded-2xl relative">
                
                <h4 className="text-lg font-black uppercase tracking-tighter text-white mb-2 flex items-center gap-2">
                  <Activity className="text-[#CCFF00] w-5 h-5" /> AVALIAÇÃO FÍSICA IA EM TEMPO REAL
                </h4>
                <p className="text-xs text-white/50 mb-6">
                  Insira os parâmetros básicos do seu patrimônio para que o Mentor IA de Max avalie instantaneamente a orientação e o conforto térmico.
                </p>

                <form onSubmit={handleEvaluateProperty} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-white/70 block mb-1 uppercase tracking-widest font-mono">Bairro / Localidade</label>
                    <select 
                      value={localizacao} 
                      onChange={(e) => setLocalizacao(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[#CCFF00] outline-none text-white transition"
                    >
                      <option>Porto Alegre - Bairro Nobre (Moinhos de Vento/Bela Vista/Três Figueiras)</option>
                      <option>Porto Alegre - Menino Deus / Petrópolis</option>
                      <option>Porto Alegre - Zona Sul (Ipanema/Tristeza/Vila Assunção)</option>
                      <option>Região Metropolitana / Vale dos Sinos</option>
                      <option>Serra Gaúcha (Gramado/Canela)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-white/70 block mb-1 uppercase tracking-widest font-mono">Área Privativa (m²)</label>
                      <input 
                        type="number" 
                        min={10} 
                        max={5000}
                        value={area}
                        onChange={(e) => setArea(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[#CCFF00] outline-none text-white transition font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-white/70 block mb-1 uppercase tracking-widest font-mono">Orientação Solar</label>
                      <select 
                        value={orientacaoSolar} 
                        onChange={(e) => setOrientacaoSolar(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[#CCFF00] outline-none text-white transition"
                      >
                        <option>Norte (Excelente solar)</option>
                        <option>Leste (Sol da Manhã)</option>
                        <option>Oeste (Sol da Tarde)</option>
                        <option>Sul (Menos incidência)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/70 block mb-1 uppercase tracking-widest font-mono">Tipo de Imóvel</label>
                    <select 
                      value={tipoImovel} 
                      onChange={(e) => setTipoImovel(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[#CCFF00] outline-none text-white transition"
                    >
                      <option>Apartamento Residencial</option>
                      <option>Casa em Condomínio Fechado</option>
                      <option>Cobertura Duplex/Triplex</option>
                      <option>Terreno / Imóvel Comercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/70 block mb-1 uppercase tracking-widest font-mono">Diferenciais ou Detalhes</label>
                    <input 
                      type="text" 
                      placeholder="Ex: churrasqueira, 3 suítes, andar alto, vista limpa" 
                      value={detalhesExtras}
                      onChange={(e) => setDetalhesExtras(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[#CCFF00] outline-none text-white transition"
                    />
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <p className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Sua identificação para o Laudo Oficial</p>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Seu nome completo" 
                        value={proprietarioNome}
                        onChange={(e) => setProprietarioNome(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[#CCFF00] outline-none text-white transition"
                        required
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        placeholder="seu-email@provedor.com" 
                        value={proprietarioEmail}
                        onChange={(e) => setProprietarioEmail(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[#CCFF00] outline-none text-white transition"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#CCFF00] hover:bg-white text-black text-xs font-black uppercase tracking-widest py-3 rounded transition-colors shadow-[0_4px_14px_rgba(204,255,0,0.25)] flex items-center justify-center gap-2"
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-black"></div>
                        <span>Processando Física do Imóvel...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Gerar Laudo Técnico Real</span>
                      </>
                    )}
                  </button>
                </form>

              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="inline-block px-3 py-1 bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-widest mb-6 font-mono">
                PATRIMÔNIO REAL B2C
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white mb-8 leading-tight">
                NÃO QUEIME O SEU IMÓVEL <br />
                <span className="text-transparent stroke-text" style={{ WebkitTextStroke: "1px white" }}>COM AMADORES.</span>
              </h2>
              
              <p className="text-white/70 mb-8 font-light leading-relaxed text-base sm:text-lg">
                Muitos proprietários sofrem ao expor o seu maior bem material em dezenas de imobiliárias de baixo nível. Isso gera depreciação, leilão informal de preços e desgaste de imagem. Nossa assessoria realiza avaliações de engenharia térmica e de insolação sob regime de **exclusividade com proteção ativa de valor**.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded text-[#CCFF00] shrink-0 mt-0.5">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Blindagem Absoluta de Preço</h4>
                    <p className="text-xs text-white/50 mt-1">Impedimos a exposição negativa e o desgaste publicitário que corrói o valor percebido de mercado.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded text-[#CCFF00] shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Estudo de Orientação Científica</h4>
                    <p className="text-xs text-white/50 mt-1">Laudo técnico estruturado demonstrando o valor térmico do imóvel e o alinhamento com a ventilação regional.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded text-[#CCFF00] shrink-0 mt-0.5">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Estratégia de Liquidez (Alocação de Saída)</h4>
                    <p className="text-xs text-white/50 mt-1">Estruturação de portfólio de saída em renda passiva (IPCA+ e FIIs) para garantir a continuidade da multiplicação da sua riqueza.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Resultado do Laudo Real - Gemini API Response Render */}
          {evaluationReport && (
            <div className="mt-12 p-8 bg-black/80 border-2 border-[#CCFF00] rounded-2xl relative shadow-[0_0_30px_rgba(204,255,0,0.1)] scroll-mt-24" id="laudo-resultado">
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-ping"></span>
                  <h4 className="text-base font-black tracking-widest text-[#CCFF00] uppercase font-mono">
                    Laudo Oficial Gerado com Sucesso via IA
                  </h4>
                </div>
                <button 
                  onClick={() => setEvaluationReport(null)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="prose prose-invert max-w-none text-white/80 text-sm leading-relaxed font-sans space-y-4">
                {evaluationReport.split("\n").map((line, idx) => {
                  if (line.startsWith("### ")) {
                    return <h5 key={idx} className="text-[#CCFF00] font-black text-sm uppercase tracking-wider pt-4 border-b border-white/5 pb-1">{line.replace("### ", "")}</h5>;
                  } else if (line.startsWith("## ")) {
                    return <h4 key={idx} className="text-white font-black text-base uppercase tracking-tighter pt-6 pb-2 text-neon-glow">{line.replace("## ", "")}</h4>;
                  } else if (line.startsWith("**") && line.endsWith("**")) {
                    return <p key={idx} className="font-bold text-[#CCFF00] font-mono">{line.replace(/\*\*/g, "")}</p>;
                  } else if (line.trim().startsWith("- ")) {
                    return <li key={idx} className="list-disc list-inside ml-4 text-white/70">{line.replace("- ", "")}</li>;
                  } else if (line.trim()) {
                    return <p key={idx}>{line}</p>;
                  }
                  return null;
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-left">
                  <p className="text-[10px] text-white/40 uppercase font-mono">Assinado Digitalmente por</p>
                  <p className="text-sm font-black tracking-tight text-white uppercase">Max Mazewski</p>
                  <p className="text-[10px] text-[#CCFF00] font-mono">Mentor de Tecnologia & Corretor Credenciado • CRECI 42.453</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(evaluationReport);
                      alert("Laudo copiado para a área de transferência!");
                    }}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 text-white hover:text-[#CCFF00] hover:border-[#CCFF00] text-xs font-black uppercase tracking-widest transition-all rounded"
                  >
                    Copiar Laudo
                  </button>
                  <a 
                    href="#contato"
                    onClick={() => {
                      setContatoObjetivo("Quero agendar a Avaliação Técnica do meu Imóvel (Vendedor)");
                      setContatoMensagem(`Solicito agendamento para imóvel de ${area}m² no bairro ${localizacao}.`);
                    }}
                    className="px-5 py-2.5 bg-[#CCFF00] text-black hover:bg-white text-xs font-black uppercase tracking-widest transition-all rounded"
                  >
                    Agendar Reunião Técnica
                  </a>
                </div>
              </div>
            </div>
          )}

          {evaluationError && (
            <div className="mt-12 p-6 bg-red-950/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-mono leading-relaxed">
              <strong>[Erro do Sistema]:</strong> {evaluationError}
            </div>
          )}

        </div>
      </section>

      {/* Seção sobre Autoridade (Max & Bowtie Metaphor) */}
      <section id="autoridade" className="py-24 border-b border-white/10 relative px-4 sm:px-12 bg-[#0C0C0C]">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 sm:p-16 bg-[#111] border border-white/10 rounded-3xl relative overflow-hidden flex flex-col lg:flex-row gap-12 items-center">
            
            <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border-4 border-[#CCFF00]/20 p-2 flex items-center justify-center bg-black/60 shadow-2xl shrink-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#CCFF00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Representação icônica estilizada de Max com sua Gravata Borboleta Verde-Lima */}
              <div className="flex flex-col items-center justify-center text-center">
                <Users className="w-16 h-16 text-white/20 mb-3" />
                <span className="text-xs text-white/40 uppercase tracking-widest font-mono">Max Mazewski</span>
                <div className="mt-4 text-[#CCFF00] drop-shadow-[0_0_10px_rgba(204,255,0,0.6)] animate-pulse">
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H4zm14 0c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-2zm-6 3c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-block px-3 py-1 bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-widest mb-6 font-mono">
                DIFERENCIAÇÃO RADICAL
              </div>
              
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white mb-6">
                POR QUE A GRAVATA BORBOLETA?
              </h3>
              
              <p className="text-white/60 mb-6 leading-relaxed font-light">
                No mercado imobiliário e financeiro tradicional, dominado por commodities humanas de ternos cinzentos e idênticos, a gravata borboleta verde-lima é a minha quebra de padrão visual cirúrgica. Ela simboliza exatidão científica, elegância técnica e o compromisso didático de quem é primeiro um **educador financeiro** e, por consequência, um consultor de elite para a engenharia de venda e estruturação de renda passiva sólida para os seus maiores ativos.
              </p>

              <div className="flex flex-wrap gap-4 text-xs font-mono text-[#CCFF00] font-bold">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded border border-white/5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Mentor de Tecnologia</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded border border-white/5">
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Educador Financeiro</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded border border-white/5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>CRECI RS 42.453</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mentalidade de Prosperidade & Quotes */}
      <section className="py-24 border-b border-white/10 px-4 sm:px-12 bg-black/40">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#CCFF00] uppercase tracking-widest font-mono block mb-2">
              MENTALIDADE DE RIQUEZA
            </span>
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
              NORTEADOS PELA PROSPERIDADE CONSCIENTE
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Catherine Ponder Quote */}
            <div className="p-8 bg-white/5 border border-white/5 rounded-2xl relative group hover:border-[#CCFF00]/25 transition-all">
              <p className="text-white/70 italic mb-8 text-sm leading-relaxed">
                "A abundância divina é a nossa herança real. O amor divino realiza a sua obra perfeita agora, abrindo as portas do depósito infinito de riquezas em nossas vidas."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm">Joseph Murphy & Catherine Ponder</h5>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Mentalidade de Prosperidade & Ordem Divina</p>
                </div>
              </div>
            </div>

            {/* Naval Ravikant Quote */}
            <div className="p-8 bg-white/5 border border-white/5 rounded-2xl relative group hover:border-[#CCFF00]/25 transition-all">
              <p className="text-white/70 italic mb-8 text-sm leading-relaxed">
                "Crie alavancagem com código e mídia. Se não sabe programar, escreva livros, grave vídeos ou crie ferramentas. O software trabalha de graça enquanto você dorme, construindo a sua liberdade."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm">Estratégia de Naval Ravikant</h5>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Estratégia de Escala Digital & Equity</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Formulário de Inscrição / Contato Final */}
      <section id="contato" className="py-24 px-4 sm:px-12 relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          
          <div className="text-center mb-16">
            <div className="w-12 h-12 bg-[#CCFF00]/10 border border-[#CCFF00]/25 rounded-full flex items-center justify-center mx-auto mb-4 text-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white mb-4">
              ABRA O SEU CANAL DE PROSPERIDADE
            </h3>
            <p className="text-white/60 font-light leading-relaxed">
              Escolha seu caminho no ecossistema de alavancagem imobiliária e entre em contato direto conosco para iniciar seu crescimento mútuo de patrimônio.
            </p>
          </div>

          <div className="p-8 bg-[#111] border border-[#CCFF00]/20 rounded-3xl">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest font-mono block mb-2">Seu Nome</label>
                  <input 
                    type="text" 
                    placeholder="Como deseja ser chamado?" 
                    value={contatoNome}
                    onChange={(e) => setContatoNome(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#CCFF00] outline-none text-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest font-mono block mb-2">WhatsApp de Contato</label>
                  <input 
                    type="tel" 
                    placeholder="(51) 99999-0000" 
                    value={contatoWhatsapp}
                    onChange={(e) => setContatoWhatsapp(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#CCFF00] outline-none text-white transition font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest font-mono block mb-2">Qual o Seu Objetivo Imediato?</label>
                <select 
                  value={contatoObjetivo}
                  onChange={(e) => setContatoObjetivo(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#CCFF00] outline-none text-white transition"
                >
                  <option value="Quero me inscrever no Curso para Corretores (A Física da Venda)">Quero me inscrever no Curso para Corretores (A Física da Venda)</option>
                  <option value="Quero agendar a Avaliação Técnica do meu Imóvel (Vendedor)">Quero agendar a Avaliação Técnica do meu Imóvel (Vendedor)</option>
                  <option value="Quero acesso ao Aplicativo de Educação Financeira Integrado">Quero acesso ao Aplicativo de Educação Financeira Integrado</option>
                  <option value="Desejo estabelecer uma parceria de escala com o ecossistema">Desejo estabelecer uma parceria de escala com o ecossistema</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest font-mono block mb-2">Mensagem Adicional (Opcional)</label>
                <textarea 
                  rows={4} 
                  placeholder="Fale um pouco sobre as suas expectativas patrimoniais ou sobre o seu imóvel..."
                  value={contatoMensagem}
                  onChange={(e) => setContatoMensagem(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#CCFF00] outline-none text-white transition"
                />
              </div>

              {leadSuccessMsg && (
                <div className="p-4 rounded-xl text-center font-bold text-xs bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] uppercase font-mono tracking-wider animate-pulse">
                  {leadSuccessMsg}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-4.5 bg-[#CCFF00] hover:bg-white text-black font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_16px_rgba(204,255,0,0.3)] text-xs"
                disabled={isSubmittingLead}
              >
                {isSubmittingLead ? "Registrando no Banco..." : "Enviar e Iniciar Transição"}
              </button>

            </form>
          </div>

        </div>
      </section>

      {/* Floating Chat Widget with Mentor Max (Interactive Gemini API Client) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button 
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-[#CCFF00] hover:bg-white text-black rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(204,255,0,0.4)] transition-all transform hover:scale-110 group relative"
            aria-label="Falar com o Mentor Max"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>
        ) : (
          <div className="w-[330px] sm:w-[380px] h-[480px] bg-[#111] border-2 border-[#CCFF00] rounded-2xl flex flex-col overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Chat Header */}
            <div className="h-16 bg-black px-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#CCFF00] text-black flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H4zm14 0c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-2zm-6 3c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-tight text-white uppercase">Mentor Max Mazewski</h4>
                  <span className="text-[9px] text-[#CCFF00] font-mono block -mt-0.5">INTELIGÊNCIA ALAVANCADA</span>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-white/60 hover:text-white hover:bg-white/5 p-1 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0c0c0c] font-sans text-xs">
              {chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-xl p-3 leading-relaxed border ${
                      msg.role === "user" 
                        ? "bg-white/5 border-white/10 text-white rounded-tr-none" 
                        : "bg-black border-[#CCFF00]/20 text-[#CCFF00] rounded-tl-none font-mono"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSendingToChat && (
                <div className="flex justify-start">
                  <div className="bg-black border border-white/5 rounded-xl p-3 text-white/40 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-bounce delay-150"></span>
                    <span className="text-[10px] ml-1">Max analisando dados...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="h-14 bg-black border-t border-white/10 px-3 flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Pergunte sobre insolação, ventos, CRECI..." 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00] font-sans"
                disabled={isSendingToChat}
              />
              <button 
                type="submit" 
                className="p-2 bg-[#CCFF00] hover:bg-white text-black rounded-lg transition-colors"
                disabled={isSendingToChat || !chatMessage.trim()}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer / Scrolling Marquee Banner in Artistic Flair */}
      <footer id="app-footer" className="border-t border-white/10 bg-black overflow-hidden select-none z-10 relative">
        <div className="h-16 bg-[#CCFF00] text-black flex items-center">
          <div className="animate-marquee whitespace-nowrap text-xs font-black uppercase tracking-widest italic flex items-center">
            <span className="mx-8 flex items-center gap-1.5">🚀 ALAVANCAGEM PATRIMONIAL ATIVA</span>
            <span className="mx-8 flex items-center gap-1.5">⚡ MAX MAZEWSKI CRECI 42.453</span>
            <span className="mx-8 flex items-center gap-1.5">🔥 INTELIGÊNCIA COM GEMINI INTEGRADO</span>
            <span className="mx-8 flex items-center gap-1.5">📐 A FÍSICA DA VENDA REAL</span>
            <span className="mx-8 flex items-center gap-1.5">🎯 EXCLUSIVIDADE & PROTEÇÃO DE PREÇO</span>
            
            <span className="mx-8 flex items-center gap-1.5">🚀 ALAVANCAGEM PATRIMONIAL ATIVA</span>
            <span className="mx-8 flex items-center gap-1.5">⚡ MAX MAZEWSKI CRECI 42.453</span>
            <span className="mx-8 flex items-center gap-1.5">🔥 INTELIGÊNCIA COM GEMINI INTEGRADO</span>
            <span className="mx-8 flex items-center gap-1.5">📐 A FÍSICA DA VENDA REAL</span>
            <span className="mx-8 flex items-center gap-1.5">🎯 EXCLUSIVIDADE & PROTEÇÃO DE PREÇO</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-12 py-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-white/40 text-[11px] font-mono">
          <div>
            <p className="font-bold text-white uppercase tracking-widest">
              MENTOR IMOBILIÁRIO • © 2026 ECOSSISTEMA TRIÂNGULO
            </p>
            <p className="mt-1">
              Laudo técnico de insolação, conforto físico-térmico e assessoria de alocação de saída em Porto Alegre, RS.
            </p>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Segurança de Dados 256-bit</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">CRECI 42.453</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

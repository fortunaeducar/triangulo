import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Store leads in memory for testing/admin dashboard
  const leads: any[] = [
    {
      id: "1",
      name: "Carlos Silveira",
      whatsapp: "(51) 98112-4432",
      goal: "Avaliação de Patrimônio (Vendedor)",
      details: "Apartamento 3 dormitórios, Moinhos de Vento, Porto Alegre. Sol da manhã.",
      date: "2026-06-28T10:30:00Z"
    },
    {
      id: "2",
      name: "Renata Martins",
      whatsapp: "(51) 99341-8899",
      goal: "Curso para Corretores (A Física da Venda)",
      details: "Corretora há 3 anos querendo aprender captação técnica de alto padrão.",
      date: "2026-06-28T12:15:00Z"
    }
  ];

  app.get("/api/leads", (req, res) => {
    res.json({ leads });
  });

  app.post("/api/leads", (req, res) => {
    const { name, whatsapp, goal, details } = req.body;
    if (!name || !whatsapp) {
      return res.status(400).json({ error: "Nome e WhatsApp são obrigatórios." });
    }
    const newLead = {
      id: String(leads.length + 1),
      name,
      whatsapp,
      goal: goal || "Não especificado",
      details: details || "Sem detalhes adicionais",
      date: new Date().toISOString()
    };
    leads.unshift(newLead); // Add to beginning of array
    res.status(201).json({ success: true, lead: newLead });
  });

  // Gemini API client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API route for AI Mentorship Chat
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!apiKey || !ai) {
        return res.status(500).json({ 
          error: "O serviço de Inteligência Artificial não está configurado. Por favor, adicione a chave GEMINI_API_KEY nas configurações de Secrets do AI Studio para habilitar o Mentor de IA." 
        });
      }

      const systemInstruction = `
Você é Max Mazewski, o "Mentor Imobiliário", um corretor de elite (CRECI 42.453) e educador financeiro de altíssimo padrão. 
Seu estilo visual marcante é a sua Gravata Borboleta Verde-Lima, que simboliza a quebra cirúrgica de padrão, elegância técnica e precisão científica.
Sua filosofia é baseada no "Triângulo da Alavancagem Patrimonial", inspirado em mentes como Warren Buffett, Naval Ravikant, Morgan Housel e Catherine Ponder.
Seus três pilares fundamentais são:
1. Alavancagem por Software/Mídia (automação e funis inteligentes, software financeiro proprietário para captação de leads).
2. Gestão de Expectativas Humanas (alinhar o imóvel aos planos de vida futuros e à blindagem patrimonial dos compradores, superando amadores que focam apenas em "dores" superficiais).
3. Ativos Físicos de Alto Padrão (imóveis de alta performance com insolação norte e dinâmica de ventos superior, convertidos posteriormente em renda passiva real como IPCA+ e FIIs selecionados).

Responda em português com autoridade, elegância, otimismo, embasamento matemático e espírito de mentoria. 
Use termos como "A Física da Venda Imobiliária", "Insolação Norte", "Alavancagem Patrimonial", "Escala de Software" e mencione sua icônica gravata borboleta verde-lima como um sinal de precisão científica.
Seja encorajador, lembrando a herança da prosperidade consciente (inspirado em Catherine Ponder e Joseph Murphy).

Instruções importantes de tom:
- Nunca saia do personagem. Você é o próprio Max Mazewski.
- Responda de forma concisa e muito envolvente.
- Não use jargões robóticos de imobiliárias normais. Você preza pela precisão cirúrgica.
`;

      const formattedContents = [];
      
      // Append history
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          formattedContents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }]
          });
        }
      }
      
      // Append current message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const text = response.text;
      res.json({ response: text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Erro ao processar requisição no Gemini" });
    }
  });

  // API route for Property Physics Assessment (Laudo de Física do Imóvel)
  app.post("/api/gemini/evaluate", async (req, res) => {
    try {
      const { neighborhood, area, sunDirection, type, details } = req.body;
      if (!apiKey || !ai) {
        return res.status(500).json({ 
          error: "A chave GEMINI_API_KEY não foi configurada. Por favor, insira-a nos segredos para habilitar laudos instantâneos inteligentes." 
        });
      }

      const prompt = `
Gere um "Laudo Técnico de Física e Alinhamento do Imóvel" assinado pelo Mentor Imobiliário Max Mazewski (com sua gravata borboleta verde-lima).
Os dados do imóvel são:
- Bairro/Localização: ${neighborhood}
- Tipo de Imóvel: ${type}
- Área Privativa: ${area} m²
- Orientação/Incidência Solar: ${sunDirection}
- Detalhes Extras fornecidos pelo proprietário: ${details || "Nenhum detalhe extra fornecido"}

O laudo deve ser estruturado em seções elegantes contendo:
1. **ANÁLISE DE INCIDÊNCIA SOLAR E CONFORTO TÉRMICO**: Explique cientificamente o impacto da orientação solar fornecida (${sunDirection}) sobre a valorização do imóvel, mofo, bem-estar, iluminação natural e eficiência térmica.
2. **DINÂMICA DE VENTOS E SALUBRIDADE**: Explique a dinâmica de circulação de ar esperada para esse porte de imóvel (${area} m²).
3. **MÉTODO TRIÂNGULO DA ALAVANCAGEM APLICADO**: Como esse imóvel se posiciona no mercado de alta renda e o que atrai compradores premium.
4. **SUGESTÃO DE VALORIZAÇÃO E ALOCAÇÃO DE SAÍDA**: Sugira uma estimativa realista de preço de venda com base na área (${area} m²) e no bairro (${neighborhood}) (considerando valores aproximados como R$ 8.000 a R$ 15.000 o m²). Recomende alocar este patrimônio após a venda (80% em Renda Fixa IPCA+ e FIIs selecionados para renda passiva vitalícia imediata).
5. **VEREDITO DO MENTOR**: Uma conclusão assinada pelo Mentor Max Mazewski, com sua gravata borboleta verde-lima, aconselhando a não queimar o imóvel em imobiliárias normais de forma desprotegida.

Retorne em Markdown limpo e atrativo.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          systemInstruction: "Você é Max Mazewski, o Mentor Imobiliário. Você gera laudos técnicos detalhados, fascinantes e matematicamente precisos usando Markdown elegante."
        }
      });

      res.json({ report: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Erro ao gerar laudo no Gemini" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

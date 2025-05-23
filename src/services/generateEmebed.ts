import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!;

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
}

const prompt = `
Você é um assistente especializado em transformar mensagens de vagas de emprego que chegam via WhatsApp em embeds prontos para o Discord.

Sua função é ler a mensagem e gerar uma ou mais embeds, dependendo da quantidade de vagas na mensagem.

### 🔥 Regras Gerais:
- Se houver mais de uma vaga na mensagem, gere uma embed para cada vaga.
- Se a vaga não tiver detalhes além de um link, use como título o cargo identificado no link (se possível) ou escreva "Oportunidade de Emprego" e use a descrição "Detalhes no link abaixo".
- Sempre inclua o link na descrição se ele existir.
- Caso a vaga venha com mais informações (local, cargo, tipo, requisitos), utilize essas informações corretamente.
- Se houver menções de níveis (estágio, júnior, pleno, sênior), selecione a cor correspondente.

### 🎨 Cores para a embed:
- Verde (5763719) → Vaga Júnior
- Azul (3447003) → Vaga Pleno
- Roxo (10181046) → Vaga Sênior
- Amarelo (16776960) → Vaga Estágio
- Se não for possível identificar o nível, use Cinza (10070709).

### 📄 Estrutura da Embed:
{
  "title": "Título da Vaga",
  "description": "Descrição principal com informações relevantes da vaga, requisitos, localização, formato (remoto, híbrido ou presencial) e o link da vaga se houver.",
  "color": 3447003,
  "footer": {
    "text": "Vagas Tech | Via WhatsApp"
  }
}

### 📑 Campos sugeridos para ajudar:
- Cargo
- Nível (Estágio, Júnior, Pleno, Sênior)
- Localização
- Formato (Remoto, Híbrido, Presencial)
- Link da vaga
- Requisitos (se existirem)
- Salário (se existir)

`;

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?|\n?```/g, "").trim();
}

async function generateEmbed(message: string): Promise<DiscordEmbed> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt + message);
    const response = await result.response;
    const text = cleanJsonResponse(response.text());

    return JSON.parse(text) as DiscordEmbed;
  } catch (error) {
    console.error("Erro ao gerar embed:", error);
    return {
      title: "💼 Nova Vaga",
      description: message,
      color: 3447003,
      footer: {
        text: "Vagas Tech | Via WhatsApp",
      },
    };
  }
}

export async function sendToDiscord(message: string) {
  const embed = await generateEmbed(message);

  const payload = {
    username: "Vagas Tech Bot",
    embeds: [embed],
  };

  try {
    await axios.post(WEBHOOK_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Mensagem enviada com sucesso!");
  } catch (error: any) {
    console.error(
      "❌ Erro ao enviar para o Discord:",
      error.response?.data || error.message
    );
  }
}

// ✅ Exemplo de uso:

const mensagemWhatsapp = `
💻 #tecnologia #infra #suporte #produtos #dados
🧑🏽 #estagio
🌎 #presencial #SP

💻 Programa de Estágio XP Inc.

DESCRIÇÃO:
Investimos em você: prepare-se para uma jornada de crescimento na Trilha de Desenvolvimento Xtag da XP Inc.! Aqui, você terá a oportunidade aprimorar suas habilidades de curiosidade e proatividade para criar soluções inovadoras, desenvolver uma comunicação de impacto, e dominar ferramentas essenciais. Além disso, vamos te desafiar a ser flexível diante de mudanças e focar no autoconhecimento para impulsionar sua carreira aqui na XP Inc.  

Aprendizado “on the job”: além dos treinamentos, a vivência prática e a participação em projetos reais permitirão que você aplique seus conhecimentos de forma prática e eficaz.  
O início do seu legado: o Programa de Estágio XP Inc. tem uma das maiores taxas de efetivação do mercado!


PRÉ-REQUISITOS:
-- Matrícula ativa em instituição de ensino superior em curso de graduação correlacionado com as áreas que temos vagas; 
-- Data de formatura entre julho/2026 e julho/2027; 
-- Disponibilidade para estagiar 6h diárias; 
-- Disponibilidade para iniciar na XP no início de agosto/2025; 
-- Residir em São Paulo e região; Não trabalhar/estagiar em escritório credenciado à XP.


ÁREAS DE ATUAÇÃO:
Engenharia/Arquitetura de Software e Dados, Produtos Digitais, Segurança da Informação/Governança de TI/Engenharia de Infra;


BENEFÍCIOS:
Bolsa auxílio no valor de R$2.000,00; 
Bolsa Extra Semestral; 
Plano médico e odontológico; 
Vale-alimentação e vale-refeição; 
Vale Transporte; 
Auxílio-creche; 
Plataforma de Descontos; 
Wellhub (Gympass) e Zenklub; 
Seguro de vida; 
Cartão XP Visa Infinite.


CRONOGRAMA:
Inscrições: Até 08/06; 
Testes Online: Até 09/06; 
Vídeo Entrevista: Até 11/06; 
Dinâmica em Grupo: Julho/2025; 
Entrevistas: Julho/2025; 
Início na XP Inc.: Agosto/2025

🔗 https://lp.xpi.com.br/programa_de_estagio

☕️ Acompanhe vagas e conteúdos para iniciantes em TI no Telegram da @CafeinaVagas
`;

sendToDiscord(mensagemWhatsapp);

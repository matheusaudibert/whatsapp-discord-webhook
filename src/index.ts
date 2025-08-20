import makeWASocket, {
  Browsers,
  useMultiFileAuthState,
  DisconnectReason,
  WAMessage,
  fetchLatestWaWebVersion,
} from "baileys";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import { logger } from "./utils/logger";
import { FormattedMessage, getMessage } from "./utils/message";
import MessageHandler from "./handlers/message";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * A conexão com o número precisa de correção, mas implementei
 * aqui segundo as docs.
 */

const CONNECTION_TYPE = "QR"; // "NUMBER" (se quiser usar o número para login)
const PHONE_NUMBER = "5512996867111"; // +55 (68) 9200-0000 -> 556892000000 (formato para número)
const USE_LASTEST_VERSION = true;

export const initWASocket = async (): Promise<void> => {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const { version, isLatest } = await fetchLatestWaWebVersion({});

  if (USE_LASTEST_VERSION) {
    logger.info(
      `Versão atual do WaWeb: ${version.join(".")} | ${
        isLatest ? "Versão mais recente" : "Está desatualizado"
      }`
    );
  }

  // @ts-ignore
  const sock = makeWASocket({
    auth: state,
    browser:
      // @ts-ignore
      CONNECTION_TYPE === "NUMBER"
        ? Browsers.ubuntu("Chrome")
        : Browsers.appropriate("Desktop"),
    printQRInTerminal: false,
    version: USE_LASTEST_VERSION ? version : undefined,
    defaultQueryTimeoutMs: 0,
  });

  // @ts-ignore
  if (CONNECTION_TYPE === "NUMBER" && !sock.authState.creds.registered) {
    try {
      const code = await sock.requestPairingCode(PHONE_NUMBER);
      logger.info(`Código de Pareamento: ${code}`);
    } catch (error) {
      logger.error("Erro ao obter o código.");
    }
  }

  sock.ev.on(
    "connection.update",
    async ({ connection, lastDisconnect, qr }: any) => {
      logger.info(
        `Socket Connection Update: ${connection || ""} ${lastDisconnect || ""}`
      );

      switch (connection) {
        case "close":
          logger.error("Conexão fechada");
          // Remover o bot/deletar dados se necessário
          const shouldReconnect =
            (lastDisconnect.error as Boom)?.output?.statusCode !==
            DisconnectReason.loggedOut;

          if (shouldReconnect) {
            setTimeout(() => initWASocket(), 5000); // Atraso de 5 segundos antes de reconectar
          }
          break;
        case "open":
          logger.info("Bot Conectado");
          break;
      }

      // @ts-ignore
      if (qr !== undefined && CONNECTION_TYPE === "QR") {
        qrcode.generate(qr, { small: true });
      }
    }
  );

  sock.ev.on(
    "messages.upsert",
    async ({ messages }: { messages: WAMessage[] }) => {
      const allowedJids = [
        process.env.GRUPO1_ID, // Grupo 1
        process.env.GRUPO2_ID, // Grupo 2
      ];

      for (let index = 0; index < messages.length; index++) {
        const message = messages[index];
        const remoteJid = message.key.remoteJid;

        // // Verifica se a mensagem é de um dos grupos permitidos
        if (!allowedJids.includes(remoteJid || "")) continue;

        const messageContent =
          message.message?.conversation ||
          message.message?.extendedTextMessage?.text;

        if (!messageContent) {
          continue;
        }

        console.log("Mensagem recebida:", messageContent);
        console.log("ID do grupo:", remoteJid);

        // Envia a mensagem para o webhook do Discord
        try {
          await axios.post(process.env.DISCORD_WEBHOOK_URL!, {
            content: `<@&1369762080651087903>\n\n${messageContent}`,
          });
          console.log("Mensagem enviada para o Discord com sucesso.");
        } catch (error) {
          console.error("Erro ao enviar mensagem para o Discord:", error);
        }
      }
    }
  );

  // Salvar as credenciais de autenticação
  sock.ev.on("creds.update", saveCreds);
};

initWASocket();

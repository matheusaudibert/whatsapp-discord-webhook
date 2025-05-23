"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWASocket = void 0;
var baileys_1 = __importStar(require("@whiskeysockets/baileys"));
var baileys_2 = require("@whiskeysockets/baileys");
var discord_js_1 = require("discord.js");
var qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
var logger_1 = require("./utils/logger");
var axios_1 = __importDefault(require("axios"));
var dotenv_1 = __importDefault(require("dotenv"));
// Carrega as variáveis de ambiente
dotenv_1.default.config();
var config = {
    CONNECTION_TYPE: "QR",
    PHONE_NUMBER: "5512996867111",
    USE_LATEST_VERSION: true,
    RETRY_DELAY: 5000,
};
// Cliente do Discord
var discordClient = new discord_js_1.Client({
    intents: [discord_js_1.IntentsBitField.Flags.Guilds],
});
// Login no Discord
discordClient.login(process.env.DISCORD_BOT_TOKEN).catch(function (error) {
    logger_1.logger.error("Erro ao fazer login no Discord: ".concat(error));
    process.exit(1);
});
// Função para fazer upload da imagem para o Discord
function uploadImageToDiscord(buffer) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var channel = discordClient.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
                    if (!channel) {
                        reject(new Error("Canal do Discord não encontrado"));
                        return;
                    }
                    channel
                        .send({ files: [{ attachment: buffer, name: "image.jpg" }] })
                        .then(function (message) {
                        var attachment = message.attachments.first();
                        if (attachment) {
                            resolve(attachment.url);
                        }
                        else {
                            reject(new Error("Falha ao obter URL da imagem"));
                        }
                    })
                        .catch(reject);
                })];
        });
    });
}
// Função para processar mensagens
function processMessage(message) {
    return __awaiter(this, void 0, void 0, function () {
        var remoteJid, allowedJids, messageContent, imageUrl, buffer, error_1, error_2;
        var _a, _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    remoteJid = message.key.remoteJid;
                    allowedJids = [process.env.GRUPO1_ID, process.env.GRUPO2_ID];
                    if (!allowedJids.includes(remoteJid || ""))
                        return [2 /*return*/];
                    messageContent = "";
                    imageUrl = "";
                    // Processa texto
                    if (((_a = message.message) === null || _a === void 0 ? void 0 : _a.conversation) ||
                        ((_c = (_b = message.message) === null || _b === void 0 ? void 0 : _b.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text)) {
                        messageContent =
                            ((_d = message.message) === null || _d === void 0 ? void 0 : _d.conversation) ||
                                ((_f = (_e = message.message) === null || _e === void 0 ? void 0 : _e.extendedTextMessage) === null || _f === void 0 ? void 0 : _f.text) ||
                                "";
                    }
                    if (!((_g = message.message) === null || _g === void 0 ? void 0 : _g.imageMessage)) return [3 /*break*/, 5];
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, baileys_2.downloadMediaMessage)(message, "buffer", {}, {
                            logger: logger_1.logger,
                            reuploadRequest: sock.updateMediaMessage,
                        })];
                case 2:
                    buffer = (_h.sent());
                    return [4 /*yield*/, uploadImageToDiscord(buffer)];
                case 3:
                    imageUrl = _h.sent();
                    messageContent = message.message.imageMessage.caption || messageContent;
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _h.sent();
                    logger_1.logger.error("Erro ao processar imagem: ".concat(error_1));
                    return [3 /*break*/, 5];
                case 5:
                    _h.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, axios_1.default.post(process.env.DISCORD_WEBHOOK_URL, {
                            content: "".concat(messageContent, "\n<@&").concat(process.env.DISCORD_ROLE_ID, ">"),
                            embeds: imageUrl ? [{ image: { url: imageUrl } }] : undefined,
                        })];
                case 6:
                    _h.sent();
                    logger_1.logger.info("Mensagem enviada para o Discord com sucesso");
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _h.sent();
                    logger_1.logger.error("Erro ao enviar mensagem para o Discord: ".concat(error_2));
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Função principal do WhatsApp
var initWASocket = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, state, saveCreds, _b, version, isLatest, sock, code, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, baileys_1.useMultiFileAuthState)("auth")];
            case 1:
                _a = _c.sent(), state = _a.state, saveCreds = _a.saveCreds;
                return [4 /*yield*/, (0, baileys_1.fetchLatestWaWebVersion)({})];
            case 2:
                _b = _c.sent(), version = _b.version, isLatest = _b.isLatest;
                if (config.USE_LATEST_VERSION) {
                    logger_1.logger.info("Vers\u00E3o atual do WaWeb: ".concat(version.join("."), " | ").concat(isLatest ? "Versão mais recente" : "Está desatualizado"));
                }
                sock = (0, baileys_1.default)({
                    auth: state,
                    browser: config.CONNECTION_TYPE === "NUMBER"
                        ? baileys_1.Browsers.ubuntu("Chrome")
                        : baileys_1.Browsers.appropriate("Desktop"),
                    printQRInTerminal: false,
                    version: config.USE_LATEST_VERSION ? version : undefined,
                    defaultQueryTimeoutMs: 0,
                });
                if (!(config.CONNECTION_TYPE === "NUMBER" && !sock.authState.creds.registered)) return [3 /*break*/, 6];
                _c.label = 3;
            case 3:
                _c.trys.push([3, 5, , 6]);
                return [4 /*yield*/, sock.requestPairingCode(config.PHONE_NUMBER)];
            case 4:
                code = _c.sent();
                logger_1.logger.info("C\u00F3digo de Pareamento: ".concat(code));
                return [3 /*break*/, 6];
            case 5:
                error_3 = _c.sent();
                logger_1.logger.error("Erro ao obter o código de pareamento");
                return [3 /*break*/, 6];
            case 6:
                // Gerencia conexão
                sock.ev.on("connection.update", function (_a) {
                    var _b, _c;
                    var connection = _a.connection, lastDisconnect = _a.lastDisconnect, qr = _a.qr;
                    logger_1.logger.info("Status da conex\u00E3o: ".concat(connection || "Sem alterações"));
                    switch (connection) {
                        case "close":
                            var shouldReconnect = ((_c = (_b = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _b === void 0 ? void 0 : _b.output) === null || _c === void 0 ? void 0 : _c.statusCode) !==
                                baileys_1.DisconnectReason.loggedOut;
                            if (shouldReconnect) {
                                setTimeout(function () { return (0, exports.initWASocket)(); }, config.RETRY_DELAY);
                            }
                            break;
                        case "open":
                            logger_1.logger.info("Bot Conectado");
                            break;
                    }
                    if (qr !== undefined && config.CONNECTION_TYPE === "QR") {
                        qrcode_terminal_1.default.generate(qr, { small: true });
                    }
                });
                // Processa mensagens
                sock.ev.on("messages.upsert", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                    var _i, messages_1, message;
                    var messages = _b.messages;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _i = 0, messages_1 = messages;
                                _c.label = 1;
                            case 1:
                                if (!(_i < messages_1.length)) return [3 /*break*/, 4];
                                message = messages_1[_i];
                                return [4 /*yield*/, processMessage(message)];
                            case 2:
                                _c.sent();
                                _c.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                // Salva credenciais
                sock.ev.on("creds.update", saveCreds);
                return [2 /*return*/];
        }
    });
}); };
exports.initWASocket = initWASocket;
// Inicia o bot
(0, exports.initWASocket)().catch(function (error) {
    logger_1.logger.error("Erro ao iniciar o bot: ".concat(error));
    process.exit(1);
});

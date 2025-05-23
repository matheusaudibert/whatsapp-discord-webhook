"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessage = void 0;
var logger_1 = require("./logger");
/**
 * @param message
 * @returns a message vindo do Baileys para algo mais amigável.
 */
var getMessage = function (message) {
    var _a, _b, _c;
    try {
        return {
            key: message.key,
            messageTimestamp: message.messageTimestamp,
            pushName: message.pushName,
            content: ((_a = message.message) === null || _a === void 0 ? void 0 : _a.conversation) ||
                ((_c = (_b = message.message) === null || _b === void 0 ? void 0 : _b.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text),
        };
    }
    catch (error) {
        logger_1.logger.error(error);
    }
};
exports.getMessage = getMessage;

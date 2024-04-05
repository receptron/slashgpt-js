"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMEngineBase = void 0;
class LLMEngineBase {
    conv(message) {
        const { role, content, name, id } = message;
        return { role, content, name };
    }
}
exports.LLMEngineBase = LLMEngineBase;

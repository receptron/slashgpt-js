"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMEngineHuggingface = void 0;
const base_1 = require("./base");
const inference_1 = require("@huggingface/inference");
class LLMEngineHuggingface extends base_1.LLMEngineBase {
    constructor(model, __option) {
        super();
        this.llm_models = model;
    }
    async chat_completion(messages, manifest, verbose, callbackStraming) {
        const api_key = this.llm_models.get_api_key();
        let res = "";
        const stream = (0, inference_1.chatCompletionStream)({
            accessToken: api_key,
            model: manifest.model_name(),
            messages: messages,
            max_tokens: 500,
            temperature: 0.1,
            seed: 0,
        });
        let role = "";
        for await (const chunk of stream) {
            if (chunk.choices && chunk.choices.length > 0) {
                const token = chunk.choices[0].delta.content || "";
                res += token;
                role = chunk.choices[0].delta.role;
                if (callbackStraming) {
                    callbackStraming(token);
                }
            }
        }
        return { role, res, function_call: null, usage: null };
    }
    conv(message) {
        const { role, content, name, id } = message;
        if (id) {
            return { role, content, name, id };
        }
        return { role, content, name };
    }
}
exports.LLMEngineHuggingface = LLMEngineHuggingface;

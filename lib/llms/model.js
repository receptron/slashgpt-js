"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmModel = void 0;
const engines_1 = require("./engines");
const model_resolution_1 = require("./model_resolution");
class LlmModel {
    constructor(manifest, option) {
        const matched_model = (0, model_resolution_1.resolve_model_data)(manifest.model_name());
        this.model_data = matched_model;
        if (matched_model.engine_name === "openai-gpt") {
            this.engine = new engines_1.LLMEngineOpenAIGPT(this, option);
            return;
        }
        else if (matched_model.engine_name === "anthropic") {
            this.engine = new engines_1.LLMEngineAnthropic(this, option);
            return;
        }
        else if (matched_model.engine_name === "huggingface") {
            this.engine = new engines_1.LLMEngineHuggingface(this, option);
            return;
        }
        else if (matched_model.engine_name === "groq") {
            this.engine = new engines_1.LLMEngineGroq(this, option);
            return;
        }
        else if (matched_model.engine_name === "replicate") {
            this.engine = new engines_1.LLMEngineReplicate(this, option);
            return;
        }
        throw new Error("no llm engine");
    }
    async generate_response(messages, manifest, verbose, callbackStraming) {
        return await this.engine.chat_completion(messages.map(this.engine.conv), manifest, verbose, callbackStraming);
    }
    get_api_key() {
        return process.env[this.model_data["api_key"] || ""];
    }
}
exports.LlmModel = LlmModel;
exports.default = LlmModel;

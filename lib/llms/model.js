"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openaigpt_1 = require("./engines/openaigpt");
class LlmModel {
    constructor(manifest, option) {
        const model_name = manifest.model_name();
        if (model_name && model_name.startsWith("gpt")) {
            this.engine = new openaigpt_1.LLMEngineOpenAIGPT(option);
        }
        else if (model_name && model_name.startsWith("claude")) {
            this.engine = new openaigpt_1.LLMEngineOpenAIGPT(option);
        }
        else {
            this.engine = new openaigpt_1.LLMEngineOpenAIGPT(option);
        }
    }
    conv(message) {
        const { role, content, name } = message;
        return { role, content, name };
    }
    async generate_response(messages, manifest, verbose) {
        return await this.engine.chat_completion(messages.map(this.conv), manifest, verbose);
    }
}
exports.default = LlmModel;

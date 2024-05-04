"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engines_1 = require("./engines");
class LlmModel {
    constructor(manifest, option) {
        const model_name = manifest.model_name();
        if (model_name && model_name.startsWith("gpt")) {
            this.engine = new engines_1.LLMEngineOpenAIGPT(option);
        }
        else if (model_name && model_name.startsWith("claude")) {
            this.engine = new engines_1.LLMEngineAnthropic(option);
        }
        else {
            this.engine = new engines_1.LLMEngineOpenAIGPT(option);
        }
    }
    async generate_response(messages, manifest, verbose, callbackStraming) {
        return await this.engine.chat_completion(messages.map(this.engine.conv), manifest, verbose, callbackStraming);
    }
}
exports.default = LlmModel;

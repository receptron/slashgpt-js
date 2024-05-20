"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMEngineReplicate = void 0;
const base_1 = require("../../llms/engines/base");
const replicate_1 = __importDefault(require("replicate"));
const eventsource_1 = __importDefault(require("eventsource"));
class LLMEngineReplicate extends base_1.LLMEngineBase {
    constructor(model, option) {
        super();
        this.llm_models = model;
        const api_key = this.llm_models.get_api_key();
        this.replicate = api_key ? new replicate_1.default({ auth: api_key }) : new replicate_1.default();
    }
    async chat_completion(messages, manifest, verbose, callbackStraming) {
        const model_name = manifest.model_name();
        const send_message = messages
            .filter((m) => {
            return ["user", "system", "function", "assistant"].includes(m.role);
        })
            .map((m) => m.content)
            .join("\n");
        const task = async (callback) => {
            return new Promise(async (resolved, reject) => {
                try {
                    const prediction = await this.replicate.predictions.create({
                        model: model_name,
                        version: "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
                        input: {
                            prompt: send_message,
                        },
                        stream: true,
                    });
                    let content = [];
                    if (prediction?.urls?.stream) {
                        const source = new eventsource_1.default(prediction.urls.stream, {
                            withCredentials: true,
                        });
                        source.addEventListener("output", (e) => {
                            if (callback) {
                                callback(e.data);
                            }
                            content.push(e.data);
                        });
                        source.addEventListener("done", (e) => {
                            source.close();
                            resolved(content.join(""));
                        });
                    }
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        const res = (await task(callbackStraming));
        return { role: "assistant", res, function_call: null, usage: null };
    }
}
exports.LLMEngineReplicate = LLMEngineReplicate;

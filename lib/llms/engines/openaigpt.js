"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMEngineOpenAIGPT = void 0;
const function_call_1 = __importDefault(require("../../function/function_call"));
const base_1 = require("../../llms/engines/base");
const openai_1 = __importDefault(require("openai"));
class LLMEngineOpenAIGPT extends base_1.LLMEngineBase {
    constructor(model, option) {
        super();
        this.openai = option ? new openai_1.default(option) : new openai_1.default();
    }
    async chat_completion(messages, manifest, verbose, callbackStraming) {
        const functions = manifest.functions();
        const function_call_param = manifest.function_call();
        const model_name = manifest.model_name();
        const send_message = messages.filter((m) => {
            return ["user", "system", "function", "assistant"].includes(m.role);
        });
        const pipe = await this.openai.beta.chat.completions.stream({
            messages: send_message,
            model: model_name || "gpt-3.5-turbo",
            stream: true,
            functions,
            function_call: function_call_param,
        });
        const current = [];
        for await (const message of pipe) {
            const token = message.choices[0].delta.content;
            if (token) {
                current.push(token);
                // console.log(current.join(""))
                if (callbackStraming) {
                    callbackStraming(token);
                }
            }
        }
        const chatCompletion = await pipe.finalChatCompletion();
        const answer = chatCompletion.choices[0].message;
        const res = answer.content;
        const role = answer.role;
        const usage = chatCompletion.usage;
        // answer["function_call"] may be string, but actucally dict.
        const function_call = functions && answer["function_call"] ? new function_call_1.default(answer["function_call"], manifest) : null;
        return { role, res, function_call, usage };
    }
}
exports.LLMEngineOpenAIGPT = LLMEngineOpenAIGPT;

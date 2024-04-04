"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMEngineAnthropic = void 0;
const base_1 = require("./base");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class LLMEngineAnthropic extends base_1.LLMEngineBase {
    constructor(option) {
        super();
        this.anthropic = option ? new sdk_1.default(option) : new sdk_1.default();
    }
    async chat_completion(messages, manifest, verbose) {
        const functions = manifest.functions();
        const function_call_param = manifest.function_call();
        const model_name = manifest.model_name();
        const system = messages.length > 0 && messages[0].role === "system" ? messages[0].content ?? "" : undefined;
        const send_message = messages
            .filter((m) => {
            return ["user", "function", "assistant"].includes(m.role);
        })
            .map((a) => {
            const { role, content } = a;
            return { role, content };
        });
        const chatCompletion = (await this.anthropic.messages.create({
            system,
            max_tokens: 1024,
            model: "claude-3-opus-20240229",
            messages: [send_message[0]],
        }));
        const res = chatCompletion.content[0].text;
        const role = chatCompletion.role;
        const { input_tokens, output_tokens } = chatCompletion.usage;
        const usage = {
            prompt_tokens: input_tokens,
            completion_tokens: output_tokens,
            total_tokens: input_tokens + output_tokens,
        };
        // function calling not yet support
        const function_call = null;
        return { role, res, function_call, usage: null };
    }
}
exports.LLMEngineAnthropic = LLMEngineAnthropic;

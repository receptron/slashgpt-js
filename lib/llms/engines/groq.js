"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMEngineGroq = void 0;
const function_call_1 = __importDefault(require("../../function/function_call"));
const base_1 = require("../../llms/engines/base");
const groq_sdk_1 = require("groq-sdk");
const get_tool_choice = (tools) => {
    return {
        type: "function",
        function: { name: tools[0]["function"]["name"] },
    };
};
class LLMEngineGroq extends base_1.LLMEngineBase {
    constructor(model, __option) {
        super();
        this.llm_models = model;
        const api_key = this.llm_models.get_api_key();
        this.groq = api_key ? new groq_sdk_1.Groq({ apiKey: api_key }) : new groq_sdk_1.Groq();
    }
    async chat_completion(messages, manifest, verbose, callbackStraming) {
        const tools = manifest.functions();
        const model_name = manifest.model_name();
        const send_message = messages.filter((m) => {
            return ["user", "system", "function", "assistant"].includes(m.role);
        });
        const streamOption = {
            messages: send_message,
            model: model_name,
            temperature: manifest.temperature(),
            stream: true,
        };
        const nonStreamOption = {
            messages: send_message,
            model: model_name,
            temperature: manifest.temperature(),
        };
        const isStreaming = !tools;
        const options = isStreaming ? streamOption : nonStreamOption;
        if (this.llm_models.model_data.max_token) {
            options.max_tokens = this.llm_models.model_data.max_token;
        }
        if (tools) {
            options.tools = tools;
            options.tool_choice = get_tool_choice(tools);
        }
        if (!options.stream) {
            const result = await this.groq.chat.completions.create(options);
            const answer = result.choices[0].message;
            const res = answer.content;
            const role = answer.role;
            const function_call = (() => {
                if (tools && answer["tool_calls"] && answer["tool_calls"][0]) {
                    const name = answer["tool_calls"][0]?.function?.name;
                    const function_arguments = answer["tool_calls"][0]?.function?.arguments;
                    const data = { name, arguments: function_arguments };
                    return new function_call_1.default(data, manifest);
                }
                return null;
            })();
            // console.log({ role, res, function_call, usage: null });
            return { role, res, function_call, usage: null };
        }
        // streaming
        const stream = await this.groq.chat.completions.create(options);
        const contents = [];
        for await (const message of stream) {
            const token = message.choices[0].delta.content;
            if (token) {
                if (callbackStraming) {
                    callbackStraming(token);
                }
                contents.push(token);
            }
        }
        return { role: "assistant", res: contents.join(""), function_call: null, usage: null };
    }
}
exports.LLMEngineGroq = LLMEngineGroq;

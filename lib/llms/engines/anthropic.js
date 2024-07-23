"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMEngineAnthropic = void 0;
const function_call_1 = __importDefault(require("../../function/function_call"));
const base_1 = require("../../llms/engines/base");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const functions2tools = (functions) => {
    return functions.map((f) => {
        const { name, description, parameters } = f;
        return {
            name,
            description,
            input_schema: parameters,
        };
    });
};
class LLMEngineAnthropic extends base_1.LLMEngineBase {
    constructor(model, option) {
        super();
        this.anthropic = option ? new sdk_1.default(option) : new sdk_1.default();
    }
    async chat_completion(messages, manifest, verbose, callbackStraming) {
        const functions = manifest.functions();
        const model_name = manifest.model_name();
        const system = messages.length > 0 && messages[0].role === "system" ? messages[0].content ?? "" : undefined;
        const send_message = messages
            .filter((m) => {
            return ["user", "function", "assistant"].includes(m.role);
        })
            .map((a) => {
            const { role, content } = a;
            if (role === "function") {
                return {
                    role: "user",
                    content: [
                        {
                            type: "tool_result",
                            tool_use_id: a.id,
                            content: [{ type: "text", text: content }],
                        },
                    ],
                };
            }
            return { role, content };
        });
        const chatCompletion = await (() => {
            if (functions) {
                return this.anthropic.messages.create({
                    system,
                    max_tokens: 1024,
                    model: model_name,
                    messages: send_message,
                    tools: functions2tools(functions),
                });
            }
            const stream = (callback) => {
                return new Promise((resolved, __reject) => {
                    this.anthropic.messages
                        .stream({
                        max_tokens: 1024,
                        model: model_name,
                        messages: send_message,
                    })
                        .on("text", (t) => {
                        if (callback) {
                            callback(t);
                        }
                    })
                        .on("finalMessage", (t) => {
                        resolved(t);
                    });
                });
            };
            return stream(callbackStraming);
        })();
        const res = chatCompletion.content[0].text;
        const role = chatCompletion.role;
        const { input_tokens, output_tokens } = chatCompletion.usage;
        const usage = {
            prompt_tokens: input_tokens,
            completion_tokens: output_tokens,
            total_tokens: input_tokens + output_tokens,
        };
        const tu = (() => {
            if (chatCompletion.stop_reason === "tool_use") {
                const tool_use = chatCompletion.content.find((a) => a.type === "tool_use");
                if (tool_use) {
                    return { name: tool_use.name, arguments: tool_use.input, tool_use_id: tool_use.id };
                }
            }
            return null;
        })();
        if (tu) {
            const function_call = new function_call_1.default(tu, manifest);
            return { role, res: chatCompletion.content, function_call, usage: null };
        }
        return { role, res, function_call: null, usage };
    }
    conv(message) {
        const { role, content, name, id } = message;
        if (id) {
            return { role, content, name, id };
        }
        return { role, content, name };
    }
}
exports.LLMEngineAnthropic = LLMEngineAnthropic;

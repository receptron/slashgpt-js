"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = __importDefault(require("./manifest"));
const chat_history_1 = __importDefault(require("./chat_history"));
const model_1 = __importDefault(require("./llms/model"));
// import { ClientOptions } from "openai";
class ChatSession {
    constructor(config, manifest_data, option) {
        this.config = config;
        this.username = "you!";
        this.manifest = new manifest_1.default(manifest_data, config.base_path);
        this.history = new chat_history_1.default();
        this.prompt = this.manifest.prompt_data();
        if (this.prompt) {
            this.append_message("system", this.prompt, true);
        }
        this.llm_model = new model_1.default(this.manifest, option);
    }
    botname() {
        return this.manifest.botname();
    }
    append_message(role, content, preset, usage, name, function_data) {
        this.history.append_message({
            role,
            content,
            name,
            preset,
            function_data,
            usage,
        });
    }
    append_user_question(message) {
        const post_message = this.manifest.format_question(message);
        this.append_message("user", post_message, false);
    }
    async call_llm() {
        const messages = this.history.messages();
        const { role, res, function_call, usage } = await this.llm_model.generate_response(messages, this.manifest, true);
        if (role && res) {
            this.append_message(role, res, false, usage);
        }
        return { res, function_call };
    }
    async call_loop(callback) {
        const { res, function_call } = await this.call_llm();
        if (res) {
            callback("bot", res);
        }
        if (function_call) {
            // for js original feature
            if (function_call.function_name) {
                this.append_message("function_result", "", false, null, "", function_call.call_arguments);
            }
            // not support emit yet.
            const { function_message, function_name, should_call_llm } = await function_call.process_function_call(this.history, true);
            if (function_message) {
                callback("function", { function_name, function_message });
            }
            if (should_call_llm) {
                await this.call_loop(callback);
            }
        }
    }
}
exports.default = ChatSession;

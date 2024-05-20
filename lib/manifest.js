"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manifest = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Manifest {
    constructor(manifest_data, base_dir = "", agent_name = "") {
        this.data = manifest_data;
        this.base_dir = base_dir;
        this.agent_name = agent_name;
    }
    prompt_data() {
        const prompt = Array.isArray(this.data.prompt) ? this.data.prompt.join("\n") : this.data.prompt;
        return prompt;
    }
    format_question(message) {
        return message;
    }
    botname() {
        return this.data.bot || `Agent(${this.agent_name})`;
    }
    model_name() {
        return this.data.model;
    }
    functions() {
        const functions = this.data.functions;
        if (functions) {
            if (typeof functions === "string") {
                const functions_path = path_1.default.resolve(`${this.base_dir}/${functions}`);
                const functions_file = fs_1.default.readFileSync(functions_path, "utf8");
                return JSON.parse(functions_file);
            }
            return functions;
        }
        return null;
    }
    actions() {
        return this.data.actions;
    }
    function_call() {
        if (this.data.functions && this.data.function_call) {
            return { name: this.data.function_call };
        }
        return undefined;
    }
    skip_function_result() {
        return !!this.data.skip_function_result;
    }
    temperature() {
        return this.data.temperature;
    }
}
exports.Manifest = Manifest;
exports.default = Manifest;

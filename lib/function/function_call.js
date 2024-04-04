"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const function_action_1 = __importDefault(require("../function/function_action"));
class FunctionCall {
    constructor(data, manifest) {
        this.function_call_data = data;
        // console.log(this.function_call_data);
        this.manifest = manifest;
        this.function_name = this.name();
        const actions = this.manifest.actions();
        this.function_action = actions && actions[this.function_name] ? new function_action_1.default(actions[this.function_name]) : null;
        this.call_arguments = this.get_call_arguments();
    }
    function_data() {
        return {
            function_name: this.function_name,
            call_arguments: this.call_arguments,
        };
    }
    name() {
        return this.function_call_data.name;
    }
    get_call_arguments() {
        const call_arguments = this.function_call_data.arguments;
        if (call_arguments && typeof call_arguments === "string") {
            try {
                return JSON.parse(call_arguments);
            }
            catch (e) {
                console.log(e);
            }
        }
        return call_arguments;
    }
    async process_function_call(history, verbose = false) {
        if (!this.function_name) {
            return {
                function_message: null,
                function_name: null,
                should_call_llm: false,
            };
        }
        const function_message = await (() => {
            if (this.function_action) {
                return this.function_action.call_api(this.function_name, this.call_arguments, this.manifest.base_dir);
            }
            return null;
        })();
        if (function_message) {
            history.append_message({
                role: "function",
                content: function_message,
                name: this.function_name,
            });
        }
        const should_call_llm = !this.manifest.skip_function_result() && !!function_message;
        return {
            function_message,
            function_name: this.function_name,
            should_call_llm,
            call_arguments: this.call_arguments,
        };
    }
}
exports.default = FunctionCall;

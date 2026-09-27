"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve_model_data = void 0;
const default_model = "gpt-3.5-turbo";
const default_llm_models = {
    gpt: {
        engine_name: "openai-gpt",
        model_name: "gpt-3.5-turbo",
        api_key: "OPENAI_API_KEY",
        max_token: 4096,
    },
    mistralai: {
        engine_name: "huggingface",
        model_name: "mistralai/Mistral-7B-Instruct-v0.2",
        api_key: "HF_API_KEY",
        max_token: 4096,
    },
    claude: {
        engine_name: "anthropic",
        model_name: "claude-3-opus-20240229",
        api_key: "ANTHROPIC_API_KEY",
        max_token: 1024,
    },
    groq: {
        engine_name: "groq",
        model_name: "mixtral-8x7b-32768",
        api_key: "GROQ_API_KEY",
        max_token: 1024,
    },
    replicate: {
        engine_name: "replicate",
        model_name: "stability-ai",
        api_key: "REPLICATE_API_KEY",
        max_token: 1024,
    },
};
const resolve_model_data = (model_name) => {
    const matched_model = Object.values(default_llm_models).find((model) => {
        return (model_name || default_model).startsWith(model.model_name);
    });
    if (matched_model) {
        return matched_model;
    }
    if (model_name) {
        if (model_name.startsWith("gpt")) {
            return default_llm_models["gpt"];
        }
        else if (model_name.startsWith("claude")) {
            return default_llm_models["claude"];
        }
        throw new Error("no llm engine");
    }
    return default_llm_models["gpt"];
};
exports.resolve_model_data = resolve_model_data;

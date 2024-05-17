import { ChatData, LlmUsage } from "@/types";

import Manifest from "@/manifest";
import FunctionCall from "@/function/function_call";

import { ClientOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";

import { LLMEngineBase, LLMEngineOpenAIGPT, LLMEngineAnthropic, LLMEngineHuggingface, LLMEngineGroq } from "./engines";

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
};

type LLMModelData = {
  engine_name: string;
  model_name: string;
  api_key: string;
  max_token: number;
};

export class LlmModel {
  private engine: LLMEngineBase;
  public model_data: LLMModelData;

  constructor(manifest: Manifest, option?: ClientOptions) {
    const model_name = manifest.model_name();
    const matched_model = Object.values(default_llm_models).find((model) => {
      return model.model_name === model_name;
    });
    if (matched_model) {
      this.model_data = matched_model;
      if (matched_model.engine_name === "openai-gpt") {
        this.engine = new LLMEngineOpenAIGPT(this, option);
        return;
      } else if (matched_model.engine_name === "anthropic") {
        this.engine = new LLMEngineAnthropic(this, option);
        return;
      } else if (matched_model.engine_name === "huggingface") {
        this.engine = new LLMEngineHuggingface(this, option);
        return;
      } else if (matched_model.engine_name === "groq") {
        this.engine = new LLMEngineGroq(this, option);
        return;
      }
      throw new Error("no llm engine");
    }
    if (model_name) {
      if (model_name.startsWith("gpt")) {
        this.model_data = default_llm_models["gpt"];
        this.engine = new LLMEngineOpenAIGPT(this, option);
        return;
      } else if (model_name.startsWith("claude")) {
        this.model_data = default_llm_models["claude"];
        this.engine = new LLMEngineAnthropic(this, option);
        return;
      }
      throw new Error("no llm engine");
    }
    this.model_data = default_llm_models["gpt"];
    this.engine = new LLMEngineOpenAIGPT(this, option);
  }
  async generate_response(messages: ChatData[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void) {
    return await this.engine.chat_completion(messages.map(this.engine.conv), manifest, verbose, callbackStraming);
  }

  get_api_key() {
    return process.env[this.model_data["api_key"] || ""];
  }
}

export default LlmModel;

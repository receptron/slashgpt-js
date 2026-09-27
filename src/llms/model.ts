import { ChatData } from "@/types";

import Manifest from "@/manifest";

import { ClientOptions } from "openai";

import { LLMEngineBase, LLMEngineOpenAIGPT, LLMEngineAnthropic, LLMEngineHuggingface, LLMEngineGroq, LLMEngineReplicate } from "./engines";
import { LLMModelData, resolve_model_data } from "./model_resolution";

export class LlmModel {
  private engine: LLMEngineBase;
  public model_data: LLMModelData;

  constructor(manifest: Manifest, option?: ClientOptions) {
    const matched_model = resolve_model_data(manifest.model_name());
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
    } else if (matched_model.engine_name === "replicate") {
      this.engine = new LLMEngineReplicate(this, option);
      return;
    }
    throw new Error("no llm engine");
  }
  async generate_response(messages: ChatData[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void) {
    return await this.engine.chat_completion(messages.map(this.engine.conv), manifest, verbose, callbackStraming);
  }

  get_api_key() {
    return process.env[this.model_data["api_key"] || ""];
  }
}

export default LlmModel;

import { ChatData, LlmUsage } from "@/types";

import Manifest from "@/manifest";
import FunctionCall from "@/function/function_call";

import { ClientOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";

import { LLMEngineBase, LLMEngineOpenAIGPT, LLMEngineAnthropic } from "./engines";

class LlmModel {
  private engine: LLMEngineBase;

  constructor(manifest: Manifest, option?: ClientOptions) {
    const model_name = manifest.model_name();
    if (model_name && model_name.startsWith("gpt")) {
      this.engine = new LLMEngineOpenAIGPT(option);
    } else if (model_name && model_name.startsWith("claude")) {
      this.engine = new LLMEngineAnthropic(option);
    } else {
      this.engine = new LLMEngineOpenAIGPT(option);
    }
  }
  async generate_response(messages: ChatData[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void) {
    return await this.engine.chat_completion(messages.map(this.engine.conv), manifest, verbose, callbackStraming);
  }
}

export default LlmModel;

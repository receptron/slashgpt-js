import { ChatData, LlmUsage } from "../types";

import Manifest from "../manifest";
import FunctionCall from "../function/function_call";

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
  conv(message: ChatData) {
    const { role, content, name } = message;
    return { role, content, name } as ChatCompletionMessageParam;
  }
  async generate_response(messages: ChatData[], manifest: Manifest, verbose: boolean) {
    return await this.engine.chat_completion(messages.map(this.conv), manifest, verbose);
  }
}

export default LlmModel;

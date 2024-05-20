import { LLMEngineBase } from "./base";

import { ChatData, Manifest } from "@/types";

import { ChatCompletionMessageParam } from "openai/resources/chat";
import { LlmModel } from "@/llms/model";

import { chatCompletionStream } from "@huggingface/inference";
import { ChatCompletionInputMessage } from "@huggingface/tasks";

export class LLMEngineHuggingface extends LLMEngineBase {
  llm_models: LlmModel;

  constructor(model: LlmModel, __option: any) {
    super();
    this.llm_models = model;
  }

  async chat_completion(messages: ChatCompletionMessageParam[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void) {
    const api_key = this.llm_models.get_api_key();
    let res = "";

    const stream = chatCompletionStream({
      accessToken: api_key,
      model: manifest.model_name(),
      messages: messages as ChatCompletionInputMessage[],
      max_tokens: 500,
      temperature: 0.1,
      seed: 0,
    });
    let role = "";
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const token = chunk.choices[0].delta.content || "";
        res += token;
        role = chunk.choices[0].delta.role;
        if (callbackStraming) {
          callbackStraming(token);
        }
      }
    }
    return { role, res, function_call: null, usage: null };
  }
  conv(message: ChatData) {
    const { role, content, name, id } = message;
    if (id) {
      return { role, content, name, id } as ChatCompletionMessageParam;
    }
    return { role, content, name } as ChatCompletionMessageParam;
  }
}

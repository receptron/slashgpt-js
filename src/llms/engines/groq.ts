import { LlmUsage } from "@/types";

import Manifest from "@/manifest";
import FunctionCall from "@/function/function_call";

import { LLMEngineBase } from "@/llms/engines/base";
import { LlmModel } from "@/llms/model";

import OpenAI, { ClientOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";

import { Groq } from "groq-sdk";
import { ChatCompletionCreateParams, ChatCompletionCreateParamsNonStreaming, ChatCompletionCreateParamsStreaming } from "groq-sdk/resources/chat/completions";

export class LLMEngineGroq extends LLMEngineBase {
  groq: Groq;
  llm_models: LlmModel;

  constructor(model: LlmModel, option?: ClientOptions) {
    super();
    this.llm_models = model;
    const api_key = this.llm_models.get_api_key();
    this.groq = api_key && process.env[api_key] ? new Groq({ apiKey: process.env[api_key] }) : new Groq();
  }
  async chat_completion(messages: ChatCompletionMessageParam[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void) {
    const tools = manifest.functions();
    const model_name = manifest.model_name();

    const send_message = messages.filter((m) => {
      return ["user", "system", "function", "assistant"].includes(m.role);
    }) as Groq.Chat.CompletionCreateParams.Message[];

    const options: ChatCompletionCreateParamsStreaming = {
      messages: send_message,
      model: model_name,
      temperature: 0.7,
      stream: true,
    };

    //if (max_tokens) {
    // options.max_tokens = max_tokens;
    //}
    if (tools) {
      options.tools = tools;
      // options.tool_choice = tool_choice ?? ("auto" as Groq.Chat.CompletionCreateParams.ToolChoice);
      options.tool_choice = "auto" as Groq.Chat.CompletionCreateParams.ToolChoice;
    }

    // streaming
    const stream = await this.groq.chat.completions.create(options);
    let lastMessage = null;
    const contents = [];
    for await (const message of stream) {
      const token = message.choices[0].delta.content;
      if (token) {
        if (callbackStraming) {
          callbackStraming(token);
        }
        contents.push(token);
      }
      lastMessage = message as any;
    }
    // return lastMessage;
    return { role: "assistant", res: contents.join(""), function_call: null, usage: null };
  }
}

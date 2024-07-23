import Manifest from "@/manifest";
import FunctionCall from "@/function/function_call";

import { LLMEngineBase } from "@/llms/engines/base";
import { LlmModel } from "@/llms/model";

import { ClientOptions } from "openai";

import { Groq } from "groq-sdk";
import { ChatCompletionCreateParams, ChatCompletionCreateParamsNonStreaming, ChatCompletionCreateParamsStreaming, ChatCompletionToolChoiceOption } from "groq-sdk/resources/chat/completions";

const get_tool_choice = (tools: any[]): ChatCompletionToolChoiceOption => {
  return {
    type: "function",
    function: { name: tools[0]["function"]["name"] },
  };
};

export class LLMEngineGroq extends LLMEngineBase {
  groq: Groq;
  llm_models: LlmModel;

  constructor(model: LlmModel, __option?: ClientOptions) {
    super();
    this.llm_models = model;
    const api_key = this.llm_models.get_api_key();
    this.groq = api_key ? new Groq({ apiKey: api_key }) : new Groq();
  }
  async chat_completion(messages: any[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void) {
    const tools = manifest.functions();
    const model_name = manifest.model_name();

    const send_message = messages.filter((m) => {
      return ["user", "system", "function", "assistant"].includes(m.role);
    });
    
    const streamOption: ChatCompletionCreateParamsStreaming = {
      messages: send_message,
      model: model_name,
      temperature: manifest.temperature(),
      stream: true,
    };
    const nonStreamOption: ChatCompletionCreateParamsNonStreaming = {
      messages: send_message,
      model: model_name,
      temperature: manifest.temperature(),
    };

    const isStreaming = !tools;
    const options: ChatCompletionCreateParams = isStreaming ? streamOption : nonStreamOption;

    if (this.llm_models.model_data.max_token) {
      options.max_tokens = this.llm_models.model_data.max_token;
    }
    if (tools) {
      options.tools = tools;
      options.tool_choice = get_tool_choice(tools);
    }

    if (!options.stream) {
      const result = await this.groq.chat.completions.create(options);

      const answer = result.choices[0].message;
      const res = answer.content;
      const role = answer.role;

      const function_call = (() => {
        if (tools && answer["tool_calls"] && answer["tool_calls"][0]) {
          const name = answer["tool_calls"][0]?.function?.name;
          const function_arguments = answer["tool_calls"][0]?.function?.arguments;
          const data = { name, arguments: function_arguments };
          return new FunctionCall(data as any, manifest);
        }
        return null;
      })();

      // console.log({ role, res, function_call, usage: null });
      return { role, res, function_call, usage: null };
    }
    // streaming
    const stream = await this.groq.chat.completions.create(options);
    const contents = [];
    for await (const message of stream) {
      const token = message.choices[0].delta.content;
      if (token) {
        if (callbackStraming) {
          callbackStraming(token);
        }
        contents.push(token);
      }
    }
    return { role: "assistant", res: contents.join(""), function_call: null, usage: null };
  }
}

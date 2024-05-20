import { LlmUsage } from "@/types";

import Manifest from "@/manifest";
import FunctionCall from "@/function/function_call";

import { LLMEngineBase } from "@/llms/engines/base";
import { LlmModel } from "@/llms/model";

import OpenAI, { ClientOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";

export class LLMEngineOpenAIGPT extends LLMEngineBase {
  openai: OpenAI;

  constructor(model: LlmModel, option?: ClientOptions) {
    super();
    this.openai = option ? new OpenAI(option) : new OpenAI();
  }
  async chat_completion(messages: ChatCompletionMessageParam[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void) {
    const functions = manifest.functions();
    const function_call_param = manifest.function_call();
    const model_name = manifest.model_name();

    const send_message = messages.filter((m) => {
      return ["user", "system", "function", "assistant"].includes(m.role);
    });
    const pipe = await this.openai.beta.chat.completions.stream({
      messages: send_message,
      model: model_name || "gpt-3.5-turbo",
      stream: true,
      functions,
      function_call: function_call_param,
    });

    const current = [];
    for await (const message of pipe) {
      const token = message.choices[0].delta.content;
      if (token) {
        current.push(token);
        // console.log(current.join(""))
        if (callbackStraming) {
          callbackStraming(token);
        }
      }
    }

    const chatCompletion = await pipe.finalChatCompletion();
    const answer = chatCompletion.choices[0].message;
    const res = answer.content;
    const role = answer.role;
    const usage = chatCompletion.usage as LlmUsage;

    // answer["function_call"] may be string, but actucally dict.
    const function_call = functions && answer["function_call"] ? new FunctionCall(answer["function_call"] as any, manifest) : null;

    return { role, res, function_call, usage };
  }
}

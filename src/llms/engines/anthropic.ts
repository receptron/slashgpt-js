import { LlmUsage } from "@/types";

import Manifest from "@/manifest";
import FunctionCall from "@/function/function_call";

import { LLMEngineBase } from "./base";
import Anthropic, { ClientOptions } from "@anthropic-ai/sdk";
import { ChatCompletionMessageParam } from "openai/resources/chat";

export class LLMEngineAnthropic extends LLMEngineBase {
  anthropic: Anthropic;

  constructor(option?: ClientOptions) {
    super();
    this.anthropic = option ? new Anthropic(option) : new Anthropic();
  }
  async chat_completion(messages: ChatCompletionMessageParam[], manifest: Manifest, verbose: boolean) {
    const functions = manifest.functions();
    const function_call_param = manifest.function_call();
    const model_name = manifest.model_name();

    const system = messages.length > 0 && messages[0].role === "system" ? messages[0].content ?? "" : undefined;

    const send_message = messages
      .filter((m) => {
        return ["user", "function", "assistant"].includes(m.role);
      })
      .map((a) => {
        const { role, content } = a;
        return { role, content } as any;
      });

    const chatCompletion = (await this.anthropic.messages.create({
      system,
      max_tokens: 1024,
      model: "claude-3-opus-20240229",
      messages: [send_message[0]],
    })) as any;

    const res = chatCompletion.content[0].text;
    const role = chatCompletion.role;

    const { input_tokens, output_tokens } = chatCompletion.usage;

    const usage = {
      prompt_tokens: input_tokens,
      completion_tokens: output_tokens,
      total_tokens: input_tokens + output_tokens,
    } as LlmUsage;

    // function calling not yet support
    const function_call = null;

    return { role, res, function_call, usage: null };
  }
}

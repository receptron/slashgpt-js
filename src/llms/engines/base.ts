import { ChatData, LlmUsage } from "@/types";

import Manifest from "@/manifest";
import FunctionCall from "@/function/function_call";

import { ChatCompletionMessageParam } from "openai/resources/chat";

export abstract class LLMEngineBase {
  abstract chat_completion(
    messages: ChatCompletionMessageParam[],
    manifest: Manifest,
    verbose: boolean,
    callbackStraming?: (message: string) => void,
  ): Promise<{
    role: string;
    res: string | null;
    function_call: FunctionCall | null;
    usage: LlmUsage | null;
  }>;

  conv(message: ChatData) {
    const { role, content, name } = message;
    return { role, content, name } as ChatCompletionMessageParam;
  }
}

import { LlmUsage } from "../../types";
import Manifest from "../../manifest";
import FunctionCall from "../../function/function_call";
import { LLMEngineBase } from "./base";
import OpenAI, { ClientOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";
export declare class LLMEngineOpenAIGPT extends LLMEngineBase {
    openai: OpenAI;
    constructor(option?: ClientOptions);
    chat_completion(messages: ChatCompletionMessageParam[], manifest: Manifest, verbose: boolean): Promise<{
        role: OpenAI.Chat.Completions.ChatCompletionRole;
        res: string | null;
        function_call: FunctionCall | null;
        usage: LlmUsage;
    }>;
}

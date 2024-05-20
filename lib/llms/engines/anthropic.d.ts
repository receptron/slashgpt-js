import { ChatData, LlmUsage } from "../../types";
import Manifest from "../../manifest";
import FunctionCall from "../../function/function_call";
import { LLMEngineBase } from "../../llms/engines/base";
import { LlmModel } from "../../llms/model";
import Anthropic, { ClientOptions } from "@anthropic-ai/sdk";
import { ChatCompletionMessageParam } from "openai/resources/chat";
export declare class LLMEngineAnthropic extends LLMEngineBase {
    anthropic: Anthropic;
    constructor(model: LlmModel, option?: ClientOptions);
    chat_completion(messages: ChatCompletionMessageParam[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void): Promise<{
        role: any;
        res: any;
        function_call: FunctionCall;
        usage: null;
    } | {
        role: any;
        res: any;
        function_call: null;
        usage: LlmUsage;
    }>;
    conv(message: ChatData): ChatCompletionMessageParam;
}

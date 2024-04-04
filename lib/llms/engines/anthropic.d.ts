import Manifest from "../../manifest";
import { LLMEngineBase } from "./base";
import Anthropic, { ClientOptions } from "@anthropic-ai/sdk";
import { ChatCompletionMessageParam } from "openai/resources/chat";
export declare class LLMEngineAnthropic extends LLMEngineBase {
    anthropic: Anthropic;
    constructor(option?: ClientOptions);
    chat_completion(messages: ChatCompletionMessageParam[], manifest: Manifest, verbose: boolean): Promise<{
        role: any;
        res: any;
        function_call: null;
        usage: null;
    }>;
}

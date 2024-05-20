import { LLMEngineBase } from "./base";
import { ChatData, Manifest } from "../../types";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { LlmModel } from "../../llms/model";
export declare class LLMEngineHuggingface extends LLMEngineBase {
    llm_models: LlmModel;
    constructor(model: LlmModel, __option: any);
    chat_completion(messages: ChatCompletionMessageParam[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void): Promise<{
        role: string;
        res: string;
        function_call: null;
        usage: null;
    }>;
    conv(message: ChatData): ChatCompletionMessageParam;
}

import Manifest from "../../manifest";
import FunctionCall from "../../function/function_call";
import { LLMEngineBase } from "../../llms/engines/base";
import { LlmModel } from "../../llms/model";
import { ClientOptions } from "openai";
import { Groq } from "groq-sdk";
export declare class LLMEngineGroq extends LLMEngineBase {
    groq: Groq;
    llm_models: LlmModel;
    constructor(model: LlmModel, __option?: ClientOptions);
    chat_completion(messages: any[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void): Promise<{
        role: "assistant";
        res: string | null;
        function_call: FunctionCall | null;
        usage: null;
    } | {
        role: string;
        res: string;
        function_call: null;
        usage: null;
    }>;
}

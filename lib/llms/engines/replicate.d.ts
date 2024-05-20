import Manifest from "../../manifest";
import { LLMEngineBase } from "../../llms/engines/base";
import { LlmModel } from "../../llms/model";
import Replicate from "replicate";
export declare class LLMEngineReplicate extends LLMEngineBase {
    replicate: Replicate;
    llm_models: LlmModel;
    constructor(model: LlmModel, option?: any);
    chat_completion(messages: any[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void): Promise<{
        role: string;
        res: string;
        function_call: null;
        usage: null;
    }>;
}

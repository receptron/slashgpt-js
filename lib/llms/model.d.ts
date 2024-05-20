import { ChatData } from "../types";
import Manifest from "../manifest";
import { ClientOptions } from "openai";
type LLMModelData = {
    engine_name: string;
    model_name: string;
    api_key: string;
    max_token: number;
};
export declare class LlmModel {
    private engine;
    model_data: LLMModelData;
    constructor(manifest: Manifest, option?: ClientOptions);
    generate_response(messages: ChatData[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void): Promise<{
        role: string;
        res: string | null;
        function_call: import("../function/function_call").default | null;
        usage: import("../types").LlmUsage | null;
    }>;
    get_api_key(): string | undefined;
}
export default LlmModel;

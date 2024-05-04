import { ChatData, LlmUsage } from "../types";
import Manifest from "../manifest";
import FunctionCall from "../function/function_call";
import { ClientOptions } from "openai";
declare class LlmModel {
    private engine;
    constructor(manifest: Manifest, option?: ClientOptions);
    generate_response(messages: ChatData[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void): Promise<{
        role: string;
        res: string | null;
        function_call: FunctionCall | null;
        usage: LlmUsage | null;
    }>;
}
export default LlmModel;

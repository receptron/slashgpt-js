import { ChatData, LlmUsage } from "../types";
import Manifest from "../manifest";
import FunctionCall from "../function/function_call";
import { ClientOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";
declare class LlmModel {
    private engine;
    constructor(manifest: Manifest, option?: ClientOptions);
    conv(message: ChatData): ChatCompletionMessageParam;
    generate_response(messages: ChatData[], manifest: Manifest, verbose: boolean): Promise<{
        role: string;
        res: string | null;
        function_call: FunctionCall | null;
        usage: LlmUsage | null;
    }>;
}
export default LlmModel;

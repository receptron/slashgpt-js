import { LlmUsage } from "../../types";
import Manifest from "../../manifest";
import FunctionCall from "../../function/function_call";
import { ChatCompletionMessageParam } from "openai/resources/chat";
export declare abstract class LLMEngineBase {
    abstract chat_completion(messages: ChatCompletionMessageParam[], manifest: Manifest, verbose: boolean): Promise<{
        role: string;
        res: string | null;
        function_call: FunctionCall | null;
        usage: LlmUsage | null;
    }>;
}

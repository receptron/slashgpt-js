import Manifest from "../manifest";
import ChatHistory from "../chat_history";
declare class FunctionCall {
    private manifest;
    private function_call_data;
    private function_action;
    function_name: string;
    call_arguments: Record<string, string>;
    tool_use_id: string | undefined;
    constructor(data: Record<string, string>, manifest: Manifest);
    function_data(): {
        function_name: string;
        call_arguments: Record<string, string>;
    };
    name(): string;
    get_call_arguments(): any;
    process_function_call(history: ChatHistory, verbose?: boolean): Promise<{
        function_message: null;
        function_name: null;
        should_call_llm: boolean;
        call_arguments?: undefined;
    } | {
        function_message: string | null;
        function_name: string;
        should_call_llm: boolean;
        call_arguments: Record<string, string>;
    }>;
}
export default FunctionCall;

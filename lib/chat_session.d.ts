import { ManifestData } from "./types";
import Manifest from "./manifest";
import ChatHistory from "./chat_history";
import ChatConfig from "./chat_config";
import { LlmUsage, ChatDataContent } from "./types";
declare class ChatSession {
    username: string;
    manifest: Manifest;
    history: ChatHistory;
    prompt: string;
    private llm_model;
    private config;
    constructor(config: ChatConfig, manifest_data: ManifestData, option?: Record<string, any>);
    botname(): string;
    append_message(role: string, content: string | ChatDataContent[], preset: boolean, usage?: LlmUsage | null, name?: string, function_data?: any, tool_use_id?: string): void;
    append_user_question(message: string): void;
    append_user_image(message: string, imagePath: string): void;
    call_llm(callback: (callback_type: string, data: unknown) => void, callbackStraming?: (message: string) => void): Promise<{
        function_call: import("./function/function_call").default | null;
    }>;
    call_loop(callback: (callback_type: string, data: unknown) => void, callbackStraming?: (message: string) => void): Promise<void>;
}
export default ChatSession;

import { ManifestData } from "@/types";
import Manifest from "@/manifest";
import ChatHistory from "@/chat_history";
import ChatConfig from "@/chat_config";
import LlmModel from "@/llms/model";
import { LlmUsage } from "@/types";

class ChatSession {
  public username: string;
  public manifest: Manifest;
  public history: ChatHistory;
  public prompt: string;

  private llm_model: LlmModel;
  private config: ChatConfig;

  constructor(config: ChatConfig, manifest_data: ManifestData, option?: Record<string, any>) {
    this.config = config;

    this.username = "you!";
    this.manifest = new Manifest(manifest_data, config.base_path);
    this.history = new ChatHistory();

    this.prompt = this.manifest.prompt_data();
    if (this.prompt) {
      this.append_message("system", this.prompt, true);
    }
    this.llm_model = new LlmModel(this.manifest, option);
  }

  botname() {
    return this.manifest.botname();
  }

  append_message(role: string, content: string, preset: boolean, usage?: LlmUsage | null, name?: string, function_data?: any) {
    this.history.append_message({
      role,
      content,
      name,
      preset,
      function_data,
      usage,
    });
  }
  append_user_question(message: string) {
    const post_message = this.manifest.format_question(message);
    this.append_message("user", post_message, false);
  }

  async call_llm() {
    const messages = this.history.messages();
    const { role, res, function_call, usage } = await this.llm_model.generate_response(messages, this.manifest, true);
    if (role && res) {
      this.append_message(role, res, false, usage);
    }
    return { res, function_call };
  }

  public async call_loop(callback: (callback_type: string, data: unknown) => void) {
    const { res, function_call } = await this.call_llm();

    if (res) {
      callback("bot", res);
    }

    if (function_call) {
      // for js original feature
      if (function_call.function_name) {
        this.append_message("function_result", "", false, null, "", function_call.call_arguments);
      }
      // not support emit yet.
      const { function_message, function_name, should_call_llm } = await function_call.process_function_call(this.history, true);

      if (function_message) {
        callback("function", { function_name, function_message });
      }
      if (should_call_llm) {
        await this.call_loop(callback);
      }
    }
  }
}

export default ChatSession;
